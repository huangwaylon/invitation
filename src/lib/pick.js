/**
 * Resolve one of `content.js`'s `text(en, ja, zh)` objects for a locale.
 *
 * ALONE IN A FILE, AND DELIBERATELY. `lib/ics.js` needs this and runs in Node during the
 * build; `i18n/index.js` imports React. Re-exported from there for components, so there is
 * still one name for it, but the implementation carries no dependency at all.
 */

/** Must match `DEFAULT_LOCALE` in i18n/catalogs.js. `test/i18n.test.js` asserts they agree. */
const FALLBACK = 'en'

/**
 * Falls back through the default locale, then to an empty string — never to the object
 * itself, which would render as "[object Object]" on the page.
 *
 * A plain string passes through untouched, so a field that never needed translating (a
 * phone number, a map query, a year label) can be a bare string in content.js without a
 * special case at every call site. Arrays pass through whole: `VENUE.address` is
 * `text([...], [...], [...])`, because a Japanese address breaks into lines in different
 * places than an English one, and the array IS the resolved value.
 */
export function pick(locale, value) {
  if (value == null) return ''
  if (typeof value === 'string' || Array.isArray(value)) return value
  if (typeof value !== 'object') return String(value)
  const resolved = value[locale] ?? value[FALLBACK]
  return resolved == null ? '' : resolved
}
