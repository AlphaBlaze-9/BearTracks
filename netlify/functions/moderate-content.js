import OpenAI from 'openai'

// Initialize OpenAI (same key used by the matching function)
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

/**
 * moderate-content
 * ----------------
 * Checks arbitrary user-submitted text for inappropriate content before it is
 * saved (item submissions, claim reasons, etc.).
 *
 * It runs two layers:
 *   1. A fast local keyword blocklist (catches obvious slurs/profanity even if
 *      the OpenAI call is unavailable).
 *   2. OpenAI's moderation model (omni-moderation-latest) for nuanced cases
 *      like hate, harassment, sexual content, threats, and self-harm.
 *
 * Response: { flagged: boolean, reason: string, categories: string[] }
 */

// Lightweight server-side blocklist. Kept intentionally small + obvious; the
// OpenAI layer handles the harder cases. Matches whole words only.
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

        // Layer 2: OpenAI moderation (best-effort — never block submission on an
        // API/network error, since layer 1 already caught the obvious stuff).
        try {
            const result = await openai.moderations.create({
                model: 'omni-moderation-latest',
                input: text,
            })

            const r = result.results?.[0]
            if (r && r.flagged) {
                const categories = Object.entries(r.categories || {})
                    .filter(([, v]) => v)
                    .map(([k]) => k)

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
        } catch (aiErr) {
            console.error('[Moderation] OpenAI call failed, relying on blocklist:', aiErr.message)
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
