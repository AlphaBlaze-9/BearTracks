// storage.js: Thin, type-safe wrappers around the browser's localStorage API.
// Centralizing JSON serialization here keeps all other files free of try/catch
// boilerplate and makes it trivial to swap localStorage for a real backend later.

// ── readJSON ─────────────────────────────────────────────────────────────────
// Retrieves a JSON-parsed value from localStorage.
// Returns `fallback` if the key is missing or the stored value is malformed JSON.
export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    // If the key doesn't exist at all, return the caller's default immediately
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    // Silently swallow parse errors — corrupted data should never crash the app
    return fallback;
  }
}

// ── writeJSON ────────────────────────────────────────────────────────────────
// Serializes a value to JSON and persists it under the given key.
// Accepts any JSON-serializable value (objects, arrays, primitives).
export function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ── remove ───────────────────────────────────────────────────────────────────
// Removes a key from localStorage entirely.
// Used by AuthContext during logout to clear lingering Supabase auth tokens.
export function remove(key) {
  localStorage.removeItem(key);
}
