/**
 * Tiny i18n layer: a module singleton plus a `useSyncExternalStore` hook.
 *
 * A singleton rather than a context, because non-React modules (`lib/ics.js`,
 * `lib/format.js`) need the same locale, and because the render tests mount components
 * bare with no provider to wire up. There is exactly one locale per tab, so the
 * multi-tenant argument for context does not apply.
 *
 * All three catalogs are statically imported: a couple of KB gzipped for the set is
 * cheaper than the round trip and the Suspense boundary a dynamic import would cost, and
 * it means the language switch is instant rather than a spinner.
 */

import { useMemo, useSyncExternalStore } from 'react'
import { STORAGE_KEYS, readStored, writeStored } from '../lib/storage.js'
import { pick } from '../lib/pick.js'
import { CATALOGS, DEFAULT_LOCALE, SUPPORTED } from './catalogs.js'

/**
 * Re-exported so components have one place to import from, while the implementation stays
 * in `lib/pick.js` with no React dependency — `lib/ics.js` needs it in Node at build time.
 */
export { pick }

/** `{name}` — the only interpolation syntax. */
const VAR_PATTERN = /\{(\w+)\}/g

const numberFormats = new Map()
const pluralRules = new Map()

function numberFormat(locale) {
  let format = numberFormats.get(locale)
  if (!format) {
    format = new Intl.NumberFormat(locale)
    numberFormats.set(locale, format)
  }
  return format
}

/**
 * Plural category via `Intl.PluralRules` rather than a hand-rolled `count === 1` ternary.
 * `en` yields one|other; `ja` and `zh-Hant` yield 'other' for every count, which is
 * correct — both have a single cardinal category — and is why their catalogs carry only
 * an `other` branch.
 */
function selectPlural(locale, count) {
  let rules = pluralRules.get(locale)
  if (!rules) {
    rules = new Intl.PluralRules(locale)
    pluralRules.set(locale, rules)
  }
  return rules.select(count)
}

const warned = new Set()

function lookup(locale, key) {
  const value = CATALOGS[locale]?.[key] ?? CATALOGS[DEFAULT_LOCALE]?.[key]
  if (value == null) {
    // Never throw: a missing string must not blank the page. Structural guarantees live
    // in test/i18n.test.js, not at runtime.
    if (import.meta.env?.DEV && !warned.has(key)) {
      warned.add(key)
      console.warn(`[i18n] missing key: ${key}`)
    }
    return key
  }
  return value
}

/**
 * Substitute `{name}` placeholders. An unknown placeholder is left VISIBLE rather than
 * blanked, so a mistake is obvious on screen and the test catches it. Numbers route
 * through Intl so a count reads 1,234 in English and 1,234 in Chinese.
 */
export function interpolate(template, vars, locale) {
  if (!vars) return template
  return String(template).replace(VAR_PATTERN, (whole, name) => {
    if (!(name in vars)) return whole
    const value = vars[name]
    return typeof value === 'number' ? numberFormat(locale).format(value) : String(value)
  })
}

/**
 * Translate for an explicit locale. A catalog value is either a string or, for a
 * pluralised key, an object keyed by plural category — the only case where a value is not
 * a string, which makes `typeof` an unambiguous discriminator.
 */
export function translate(locale, key, vars) {
  const entry = lookup(locale, key)
  if (entry && typeof entry === 'object') {
    const count = Number(vars?.count ?? 0)
    // `?? entry.other` keeps an unexpected category readable rather than undefined.
    const branch = entry[selectPlural(locale, count)] ?? entry.other
    return interpolate(branch, vars, locale)
  }
  return interpolate(entry, vars, locale)
}

/**
 * Negotiate one of `SUPPORTED` from a list of BCP-47 tags a browser offered.
 *
 * THIS IS WHERE THE SIBLING APP'S VERSION WOULD BE WRONG. It does
 * `tag.toLowerCase().split('-')[0]` and matches the result against SUPPORTED — fine when
 * every supported tag is two letters, and silently broken here, because 'zh-Hant' is
 * never equal to 'zh' and every Chinese-preferring browser would land on English.
 *
 * So the matching is explicit, in narrowing order:
 *   1. an exact tag, case-insensitively           zh-Hant  -> zh-Hant
 *   2. a Traditional-script or Traditional-region Chinese tag
 *                                                 zh-TW, zh-HK, zh-MO, zh-Hant-* -> zh-Hant
 *   3. any other Chinese tag                      zh, zh-CN, zh-Hans -> zh-Hant
 *   4. the primary language subtag                ja-JP -> ja, en-GB -> en
 *
 * Step 3 hands a SIMPLIFIED reader Traditional text, which is a deliberate choice and not
 * an oversight: Traditional is the only Chinese this page has, the guest list it exists
 * for is Taiwanese, and a Simplified reader can read Traditional far more easily than
 * they can read English. The switch is always there to overrule it.
 */
export function negotiateLocale(tags) {
  const offered = (Array.isArray(tags) ? tags : [tags]).filter(Boolean).map((tag) => String(tag))

  for (const tag of offered) {
    const lower = tag.toLowerCase()
    const exact = SUPPORTED.find((supported) => supported.toLowerCase() === lower)
    if (exact) return exact
    // Any flavour of Chinese resolves to the one Chinese catalog. Checked before the
    // primary-subtag step below, which would otherwise look for a bare 'zh' and miss.
    if (lower === 'zh' || lower.startsWith('zh-')) return 'zh-Hant'
    const primary = lower.split('-')[0]
    const byPrimary = SUPPORTED.find((supported) => supported.toLowerCase().split('-')[0] === primary)
    if (byPrimary) return byPrimary
  }
  return DEFAULT_LOCALE
}

function detectLocale() {
  const stored = readStored(STORAGE_KEYS.locale)
  if (SUPPORTED.includes(stored)) return stored
  const preferences =
    (typeof navigator !== 'undefined' && (navigator.languages || [navigator.language])) || []
  return negotiateLocale(preferences)
}

// Runs at module load, which also happens under vitest's `node` environment, so every
// storage and navigator touch above is guarded.
let current = detectLocale()

const listeners = new Set()

export function getLocale() {
  return current
}

function onLocaleChange(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/**
 * Reflect the locale onto the document element. No-op outside a browser.
 *
 * `lang` is not cosmetic here: it is what selects the per-locale CJK font stacks in
 * tokens.css (Hiragino Mincho for Japanese, Songti TC for Chinese), what a screen reader
 * switches voice on, and what the browser hyphenates and line-breaks by. Setting the
 * catalog without setting `lang` renders Chinese in Japanese letterforms.
 *
 * The document TITLE is deliberately not set here — it needs the couple's names, which
 * live in content.js, and this module has no business importing content. `App.jsx` owns
 * the title in an effect.
 */
export function syncDocumentLocale(tag = current) {
  if (typeof document === 'undefined') return
  document.documentElement.lang = tag
}

export function setLocale(tag) {
  const next = SUPPORTED.includes(tag) ? tag : DEFAULT_LOCALE
  if (next === current) return
  current = next
  writeStored(STORAGE_KEYS.locale, next)
  syncDocumentLocale(next)
  for (const listener of listeners) listener()
}

/** Locale-bound translate. Safe to import from non-React modules. */
export function t(key, vars) {
  return translate(current, key, vars)
}

/**
 * The hook components use. The third `getServerSnapshot` argument is load-bearing:
 * without it `useSyncExternalStore` throws "Missing getServerSnapshot" under
 * `renderToStaticMarkup`, which is exactly how the render tests run.
 */
export function useT() {
  const locale = useSyncExternalStore(onLocaleChange, getLocale, getLocale)
  return useMemo(
    () => ({
      locale,
      t: (key, vars) => translate(locale, key, vars),
      /** Locale-bound `pick`, so a component never has to thread the locale itself. */
      pick: (value) => pick(locale, value),
      setLocale,
    }),
    [locale],
  )
}
