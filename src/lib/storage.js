/**
 * storage.js
 * ----------
 * Tiny helpers around localStorage.
 *
 * Why?
 * - Keeps JSON parsing/stringifying in one place.
 * - Makes it easy to swap localStorage with a real backend later.
 */

export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function remove(key) {
  localStorage.removeItem(key);
}
