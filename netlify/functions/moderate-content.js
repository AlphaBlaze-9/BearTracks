/**
 * moderate-content.js
 * -------------------
 * Checks arbitrary user-submitted text for inappropriate content before it is
 * saved (item submissions, claim reasons, etc.).
 *
 * It runs two layers:
 *   1. A fast local keyword blocklist (catches obvious slurs/profanity even if
 *      the OpenRouter AI network call is unavailable).
 *   2. OpenRouter free content safety model (nvidia/nemotron-3.5-content-safety:free)
 *      with auto-fallback models array for nuanced cases like hate, harassment,
 *      sexual content, threats, and self-harm.
 *
 * Response: { flagged: boolean, reason: string, categories: string[] }
 */

// Lightweight server-side blocklist. Kept intentionally small + obvious; the
// OpenRouter AI layer handles the harder cases. Matches whole words only.
const BLOCKLIST = [
    'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'dick', 'piss',
    'cunt', 'slut', 'whore', 'nigger', 'nigga', 'faggot', 'fag',
    'retard', 'rape', 'kys', 'kill yourself',
]

function localProfanityHit(text) {
    const lowered = ` ${text.toLowerCase().replace(/[^a-z\s]/g, ' ')} `
    return BLOCKLIST.find((word) => lowered.includes(` ${word} `))
}

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

        // Layer 2: OpenRouter moderation (best-effort — never block submission on an
        // API/network error, since layer 1 already caught the obvious stuff).
        try {
            const apiKey = process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY
            if (apiKey) {
                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${apiKey}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        model: "nvidia/nemotron-3.5-content-safety:free",
                        models: [
                            "nvidia/nemotron-3.5-content-safety:free",
                            "google/gemma-4-31b-it:free",
                            "meta-llama/llama-3.3-70b-instruct:free"
                        ],
                        messages: [
                            { role: "system", content: "You are a content safety moderation AI. Evaluate if user input contains hate speech, harassment, sexual content, violence, threats, or self-harm. If safe, reply 'User Safety: safe'. If unsafe, reply 'User Safety: unsafe' followed by the violated categories." },
                            { role: "user", content: text }
                        ]
                    })
                })

                if (response.ok) {
                    const data = await response.json()
                    const aiReply = data.choices?.[0]?.message?.content || ""
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
                }
            }
        } catch (aiErr) {
            console.error('[Moderation] OpenRouter call failed, relying on blocklist:', aiErr.message)
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
