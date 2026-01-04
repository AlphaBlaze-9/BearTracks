import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

// Initialize Supabase with Service Role Key for admin access
const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * Calculate Cosine Similarity between two vectors
 */
function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0.0
    let normA = 0.0
    let normB = 0.0
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i]
        normA += vecA[i] * vecA[i]
        normB += vecB[i] * vecB[i]
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

export const handler = async (event) => {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' }
    }

    try {
        const { newItemId } = JSON.parse(event.body)

        if (!newItemId) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Missing newItemId' }) }
        }

        console.log(`[Match-Items] Starting matching for item: ${newItemId}`)

        // 1. Fetch the new item
        const { data: newItem, error: fetchError } = await supabase
            .from('lost_found_items')
            .select('*')
            .eq('id', newItemId)
            .single()

        if (fetchError || !newItem) {
            throw new Error(`Item not found: ${fetchError?.message}`)
        }

        // 2. Generate Embedding for the new item
        // Combine fields for better context
        const textToEmbed = `
      Title: ${newItem.title}
      Description: ${newItem.description}
      Category: ${newItem.category}
    `.trim().replace(/\s+/g, ' ')

        const embeddingResponse = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: textToEmbed,
        })
        const embedding = embeddingResponse.data[0].embedding

        // 3. Save embedding to the new item
        await supabase
            .from('lost_found_items')
            .update({ embedding })
            .eq('id', newItemId)

        // 4. Find potential matches
        // Only look for items of the OPPOSITE type (Lost <-> Found)
        const targetType = newItem.type === 'Lost' ? 'Found' : 'Lost'

        // Fetch candidate items that have embeddings
        // Note: In a real prod app with millions of rows, use pgvector's dot product operator.
        // For now, we fetch all potential candidates and compute similarity in JS (good for small scale).
        const { data: candidates, error: candidateError } = await supabase
            .from('lost_found_items')
            .select('id, title, embedding, location, date_incident, category')
            .eq('type', targetType)
            .not('embedding', 'is', null) // Only fetch items with embeddings

        if (candidateError) throw candidateError

        const matches = []

        for (const candidate of candidates) {
            const sim = cosineSimilarity(embedding, candidate.embedding)
            let score = sim
            const boosts = []

            // --- Boosting Logic ---

            // Location Boost (+0.05)
            // Simple exact match or substring check (naive)
            if (
                newItem.location &&
                candidate.location &&
                (newItem.location.toLowerCase().includes(candidate.location.toLowerCase()) ||
                    candidate.location.toLowerCase().includes(newItem.location.toLowerCase()))
            ) {
                score += 0.05
                boosts.push('Location match')
            }

            // Category Boost (+0.03) already implicitly handled by embedding, but let's explicit boost
            if (newItem.category === candidate.category) {
                score += 0.03
                boosts.push('Category match')
            }

            // Date Boost (+0.05 if within 3 days)
            if (newItem.date_incident && candidate.date_incident) {
                const d1 = new Date(newItem.date_incident)
                const d2 = new Date(candidate.date_incident)
                if (!isNaN(d1) && !isNaN(d2)) {
                    const diffTime = Math.abs(d2 - d1);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    if (diffDays <= 3) {
                        score += 0.05
                        boosts.push('Close date')
                    }
                }
            }

            // Description Keyword Boost (+0.05 for > 2 shared meaningful words)
            // This ensures we double-check the description text beyond just the vector embedding
            if (newItem.description && candidate.description) {
                const getWords = (str) => str.toLowerCase().split(/\W+/).filter(w => w.length > 3)
                const newWords = new Set(getWords(newItem.description))
                const candWords = getWords(candidate.description)
                const shared = candWords.filter(w => newWords.has(w))
                // Simple heuristic: if they share at least 2 meaningful words
                if (shared.length >= 2) {
                    score += 0.05
                    boosts.push('Description match')
                }
            }

            // Threshold Check
            if (score >= 0.82) {
                matches.push({
                    id: candidate.id,
                    title: candidate.title,
                    score: parseFloat(score.toFixed(4)),
                    reasons: boosts
                })
            }
        }

        // Sort matches by score
        matches.sort((a, b) => b.score - a.score)

        // 5. Update BOTH items with the match results
        // We update the current item with its matches
        if (matches.length > 0) {
            await supabase
                .from('lost_found_items')
                .update({ potential_matches: matches })
                .eq('id', newItemId)

            // OPTIONAL: Update the *other* items to point back to this new item?
            // For simplicity/performance, we might skip this or do it asynchronously.
            // But user requested "direct clickable links between the matched items", so mutual links are nice.
            // We will loop and append this new item to their match lists.
            /* 
             * Ideally we'd append to the JSON array in Postgres, but doing it in JS is easier for this demo.
             * We won't block the response on this.
             */
            for (const match of matches) {
                // Fetch existing matches for the candidate
                const { data: existingData } = await supabase.from('lost_found_items').select('potential_matches').eq('id', match.id).single()
                let existingMatches = existingData?.potential_matches || []

                // Add this new item if not exists
                if (!existingMatches.find(m => m.id === newItemId)) {
                    existingMatches.push({
                        id: newItemId,
                        title: newItem.title,
                        score: match.score,
                        reasons: match.reasons
                    })
                    existingMatches.sort((a, b) => b.score - a.score)
                    await supabase.from('lost_found_items').update({ potential_matches: existingMatches }).eq('id', match.id)
                }
            }
        }

        console.log(`[Match-Items] Completed. Found ${matches.length} matches.`)

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, matches: matches.length }),
        }

    } catch (error) {
        console.error('Match Error:', error)
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        }
    }
}
