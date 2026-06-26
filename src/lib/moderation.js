/**
 * moderation.js
 * -------------
 * Client-side helpers for keeping user-submitted text appropriate.
 *
 * Two layers, mirroring the serverless function:
 *   1. localProfanityCheck — instant, offline, catches obvious words so the
 *      user gets immediate feedback (and we stay safe even if the API is down).
 *   2. moderateText — calls the /moderate-content Netlify function, which adds
 *      Google Gemini's AI model for nuanced hate/harassment/sexual/threat text.
 */

const FUNCTION_URL = "/.netlify/functions/moderate-content";

// Small, obvious blocklist for instant client feedback. The serverless layer
// (Google Gemini AI) does the heavier lifting for subtler cases.
const LOCAL_BLOCKLIST = [
  "fuck",
  "shit",
  "bitch",
  "asshole",
  "bastard",
  "dick",
  "piss",
  "cunt",
  "slut",
  "whore",
  "nigger",
  "nigga",
  "faggot",
  "fag",
  "retard",
  "rape",
  "kys",
];

/**
 * Returns the offending word if the text contains obvious profanity, else null.
 */
export function localProfanityCheck(text) {
  if (!text) return null;
  const lowered = ` ${text.toLowerCase().replace(/[^a-z\s]/g, " ")} `;
  return LOCAL_BLOCKLIST.find((word) => lowered.includes(` ${word} `)) || null;
}

/**
 * Moderates a single string. Returns { flagged, reason }.
 * Falls back to the local check if the network/API is unavailable.
 */
export async function moderateText(text) {
  if (!text || !text.trim()) return { flagged: false, reason: "" };

  // Instant local check first.
  const localHit = localProfanityCheck(text);
  if (localHit) {
    return {
      flagged: true,
      reason: "Please remove inappropriate language before submitting.",
    };
  }

  try {
    const res = await fetch(FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error(`Moderation request failed (${res.status})`);
    const data = await res.json();
    return {
      flagged: Boolean(data.flagged),
      reason: data.reason || "This text was flagged as inappropriate.",
    };
  } catch (err) {
    // Fail open: local check already passed, so allow it through rather than
    // blocking a legitimate submission on a network hiccup.
    console.error("Moderation request error:", err);
    return { flagged: false, reason: "" };
  }
}

/**
 * Moderates several labeled fields at once. Returns the first flag found, with
 * a message that names the field.
 *
 * @param {Array<{label: string, value: string}>} fields
 * @returns {Promise<{flagged: boolean, reason: string}>}
 */
export async function moderateFields(fields) {
  for (const { label, value } of fields) {
    const { flagged, reason } = await moderateText(value);
    if (flagged) {
      return { flagged: true, reason: `${label}: ${reason}` };
    }
  }
  return { flagged: false, reason: "" };
}
