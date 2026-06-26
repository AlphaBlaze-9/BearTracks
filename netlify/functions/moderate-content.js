// moderate-content.js: Checks arbitrary user-submitted text for inappropriate content before it is

// Lightweight server-side blocklist. Kept intentionally small + obvious; the
// Google Gemini AI layer handles the harder cases. Matches whole words only.
// saved (item submissions, claim reasons, etc.).
const BLOCKLIST = [
    'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'dick', 'piss',
    'cunt', 'slut', 'whore', 'nigger', 'nigga', 'faggot', 'fag',
    'retard', 'rape', 'kys', 'kill yourself',
]

// It runs two layers: A fast local keyword blocklist (catches obvious slurs/profanity even if
// It runs two layers: the Google Gemini AI network call is unavailable).
function localProfanityHit(text) {
    const lowered = ` ${text.toLowerCase().replace(/[^a-z\s]/g, ' ')} `
    return BLOCKLIST.find((word) => lowered.includes(` ${word} `))
}

// It runs two layers: Google Gemini AI models (gemini-2.5-flash-lite) for nuanced cases
// It runs two layers: like hate, harassment, sexual content, threats, and self-harm.
// It runs two layers: Response: { flagged: boolean, reason: string, categories: string[] }
export const handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' }
    }

    try {
        const { text } = JSON.parse(event.body || '{}')

        if (!text || !text.trim()) {
            return {
                statusCode: 200,
                body: JSON.stringify({ flagged: false, reason: '', categories: [] }),
            }
        }

        // Layer 1: local blocklist
        const hit = localProfanityHit(text)
        if (hit) {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    flagged: true,
                    reason: 'Contains inappropriate language.',
                    categories: ['profanity'],
                }),
            }
        }

        // Layer 2: Google Gemini moderation (best-effort — never block submission on an
        // API/network error, since layer 1 already caught the obvious stuff).
        try {
            const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY
            if (apiKey) {
                const prompt = `You are a content safety moderation AI. Evaluate if the following user input contains hate speech, harassment, sexual violence, threats, self-harm, or severe profanity. If safe, reply 'User Safety: safe'. If unsafe, reply 'User Safety: unsafe' followed by 'Categories: category1, category2'.\n\nUser Input: "${text}"`

                const models = ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-flash-lite-latest']
                for (const model of models) {
                    try {
                        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                contents: [{ role: "user", parts: [{ text: prompt }] }]
                            })
                        })

                        if (response.ok) {
                            const data = await response.json()
                            const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
                            if (aiReply.toLowerCase().includes("unsafe")) {
                                const lines = aiReply.split("\n")
                                const catLine = lines.find(l => l.toLowerCase().includes("categories:")) || ""
                                const categories = catLine ? catLine.split(":")[1]?.split(",").map(c => c.trim()).filter(Boolean) || ["safety violation"] : ["safety violation"]

                                return {
                                    statusCode: 200,
                                    body: JSON.stringify({
                                        flagged: true,
                                        reason:
                                            'This text was flagged as inappropriate (' +
                                            categories.join(', ') +
                                            '). Please reword it.',
                                        categories,
                                    }),
                                }
                            }
                            break // Success, didn't flag
                        }
                    } catch (mErr) {
                        console.warn(`[Moderation] Model ${model} failed, trying next fallback:`, mErr.message)
                    }
                }
            }
        } catch (aiErr) {
            console.error('[Moderation] Google Gemini call failed, relying on blocklist:', aiErr.message)
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ flagged: false, reason: '', categories: [] }),
        }
    } catch (error) {
        console.error('Moderation Error:', error)
        // Fail open so a parsing error never blocks a legitimate submission,
        // but report it so the client can decide.
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message, flagged: false }),
        }
    }
}
