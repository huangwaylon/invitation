/**
 * Every localStorage touch in the app goes through these two, because every one of them
 * can throw: Safari in Private Browsing rejects writes outright, and an iOS home-screen
 * app gets its own storage bucket that may be evicted. A failure is never fatal here —
 * the language choice just does not survive a reload, and the switch is one tap away.
 *
 * Note the origin caveat inherited from the sibling app: localStorage is scoped to the
 * ORIGIN, not the path, so every other site published from the same GitHub Pages account
 * shares this namespace. That is why the key is prefixed rather than bare `locale`.
 */

export const STORAGE_KEYS = {
  /** The chosen language, as a BCP-47 tag from `SUPPORTED`. Per device, never shared. */
  locale: 'inv.locale',
}

export function readStored(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeStored(key, value) {
  try {
    if (value == null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    // Storage blocked. Nothing to do: this is a preference cache, never a source of truth.
  }
}
