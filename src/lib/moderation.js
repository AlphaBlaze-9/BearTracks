// moderation.js: Client-side content moderation helpers for BearTracks.
// Implements a two-layer moderation pipeline to keep user-submitted text appropriate:
//
//   Layer 1 — LOCAL_BLOCKLIST: an instant, offline check against a hard-coded list
//             of obvious profanity. Provides immediate UI feedback without a network
//             round-trip, and acts as a fail-safe if the API is unavailable.
//
//   Layer 2 — Netlify Function (/.netlify/functions/moderate-content): calls Google
//             Gemini AI for nuanced content analysis — hate speech, sexual content,
//             harassment, and threats that a simple blocklist would miss.
//
// Exported functions: localProfanityCheck, moderateText, moderateFields

// Netlify serverless function endpoint — proxies to Google Gemini AI
const FUNCTION_URL = "/.netlify/functions/moderate-content";

// ── LOCAL_BLOCKLIST ───────────────────────────────────────────────────────────
// A curated list of obviously offensive words. Words are matched as whole tokens
// (surrounded by spaces) to avoid flagging substrings in legitimate words.
// This list is intentionally short — the AI layer handles subtler cases.
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

// ── localProfanityCheck ───────────────────────────────────────────────────────
/**
 * Synchronously checks text against the LOCAL_BLOCKLIST.
 * Returns the first matched word if found, or null if the text is clean.
 * Normalization steps: lowercase + strip non-alpha characters + pad with spaces
 * so whole-word matching works correctly without requiring regex word boundaries.
 *
 * @param {string} text — the raw user input to check
 * @returns {string|null} — the offending word, or null if none found
 */
export function localProfanityCheck(text) {
  if (!text) return null;
  // Normalize: lowercase, replace punctuation with spaces, then pad with spaces
  // so words at the start/end of the string are also matched by the " word " pattern.
  const lowered = ` ${text.toLowerCase().replace(/[^a-z\s]/g, " ")} `;
  return LOCAL_BLOCKLIST.find((word) => lowered.includes(` ${word} `)) || null;
}

// ── moderateText ─────────────────────────────────────────────────────────────
/**
 * Moderates a single string through both layers.
 *
 * Flow:
 *   1. Return early if text is blank (no moderation needed).
 *   2. Run the local blocklist check — instant feedback for obvious violations.
 *   3. POST to the Netlify/Gemini function for AI-based nuanced analysis.
 *   4. On network failure, fail open (allow the submission through) since the
 *      local check already passed and blocking legitimate users on a hiccup is worse.
 *
 * @param {string} text
 * @returns {Promise<{flagged: boolean, reason: string}>}
 */
export async function moderateText(text) {
  if (!text || !text.trim()) return { flagged: false, reason: "" };

  // Layer 1: instant local check
  const localHit = localProfanityCheck(text);
  if (localHit) {
    return {
      flagged: true,
      reason: "Please remove inappropriate language before submitting.",
    };
  }

  try {
    // Layer 2: AI-powered check via Netlify function → Google Gemini
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
    // Fail open: the local check passed, so let the submission through.
    // A network hiccup should never silently block a legitimate user.
    console.error("Moderation request error:", err);
    return { flagged: false, reason: "" };
  }
}

// ── moderateFields ────────────────────────────────────────────────────────────
/**
 * Moderates an array of labeled form fields in sequence.
 * Returns on the FIRST flagged field so the user sees one targeted error message
 * (e.g., "Title: Please remove inappropriate language") rather than a generic one.
 * Fields are checked in array order, so place higher-priority fields (title, description)
 * earlier in the array.
 *
 * @param {Array<{label: string, value: string}>} fields
 * @returns {Promise<{flagged: boolean, reason: string}>}
 */
export async function moderateFields(fields) {
  for (const { label, value } of fields) {
    const { flagged, reason } = await moderateText(value);
    if (flagged) {
      // Prefix the reason with the field name so the user knows which field to fix
      return { flagged: true, reason: `${label}: ${reason}` };
    }
  }
  return { flagged: false, reason: "" };
}
