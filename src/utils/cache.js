/**
 * A tiny localStorage-backed cache. It exists so the app can paint instantly on
 * reload from the last known snapshot instead of blocking on Appwrite + the
 * Gemini boot, and so lists only re-fetch when something actually changed.
 *
 * Everything is best-effort: private mode, quota, and disabled storage all
 * degrade to "no cache" rather than throwing.
 */
const PREFIX = "habit-incharge:v1:";

export function readCache(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeCache(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* quota exceeded / storage disabled — cache is optional, carry on */
  }
}

export function clearCache(key) {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    /* ignore */
  }
}
