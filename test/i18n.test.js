/**
 * The three catalogs, and the locale negotiation that the sibling app's version would get
 * wrong.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { CATALOGS, DEFAULT_LOCALE, LOCALE_NAMES, LOCALE_SHORT, SUPPORTED } from '../src/i18n/catalogs.js'
import { interpolate, negotiateLocale, pick, translate } from '../src/i18n/index.js'

/** Every .js/.jsx file under src/, so the scan below cannot miss a new component. */
function sourceFiles(directory = 'src', found = []) {
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry)
    if (statSync(path).isDirectory()) sourceFiles(path, found)
    else if (/\.jsx?$/.test(entry)) found.push(path)
  }
  return found
}

const sources = sourceFiles().map((path) => ({ path, text: readFileSync(path, 'utf8') }))

/** Keys referenced as `t('…')` anywhere in src/. */
const referenced = new Set()
for (const { text } of sources) {
  for (const match of text.matchAll(/\bt\(\s*'([^']+)'/g)) referenced.add(match[1])
}

describe('catalogs', () => {
  it('all three exist and are listed in SUPPORTED', () => {
    expect(SUPPORTED).toEqual(['en', 'ja', 'zh-Hant'])
    for (const locale of SUPPORTED) expect(CATALOGS[locale]).toBeTypeOf('object')
  })

  it('carries the same key set in every language', () => {
    const base = Object.keys(CATALOGS[DEFAULT_LOCALE]).sort()
    for (const locale of SUPPORTED) {
      expect(Object.keys(CATALOGS[locale]).sort(), `${locale} key set`).toEqual(base)
    }
  })

  it('has no key that nothing references, and references no key that is missing', () => {
    const defined = new Set(Object.keys(CATALOGS[DEFAULT_LOCALE]))
    expect([...defined].filter((key) => !referenced.has(key)).sort(), 'unused').toEqual([])
    expect([...referenced].filter((key) => !defined.has(key)).sort(), 'missing').toEqual([])
  })

  it('has a non-empty string, or a plural object, for every value in every language', () => {
    for (const locale of SUPPORTED) {
      for (const [key, value] of Object.entries(CATALOGS[locale])) {
        if (typeof value === 'string') {
          expect(value.trim(), `${locale} ${key}`).not.toBe('')
        } else {
          // A plural object must at least have `other`, which is the branch every fallback
          // path lands on.
          expect(value.other, `${locale} ${key}`).toBeTypeOf('string')
        }
      }
    }
  })

  /**
   * Japanese and Chinese each have exactly one cardinal plural category, so a `one` branch in
   * either catalog can never be selected — it is dead text that reads as if it were live.
   */
  it('gives the two CJK catalogs no unreachable plural branches', () => {
    for (const locale of ['ja', 'zh-Hant']) {
      const categories = new Set()
      for (let count = 0; count < 25; count += 1) categories.add(new Intl.PluralRules(locale).select(count))
      expect([...categories], `${locale} categories`).toEqual(['other'])
      for (const [key, value] of Object.entries(CATALOGS[locale])) {
        if (typeof value === 'string') continue
        expect(Object.keys(value), `${locale} ${key}`).toEqual(['other'])
      }
    }
  })

  it('names each language in its own language, for every language', () => {
    for (const locale of SUPPORTED) {
      expect(LOCALE_NAMES[locale]).toBeTypeOf('string')
      expect(LOCALE_SHORT[locale]).toBeTypeOf('string')
    }
    // If these were translated per locale, a reader who landed on the wrong language could
    // not find their own — the switch has to read the same whichever page it is on.
    expect(LOCALE_NAMES.ja).toBe('日本語')
    expect(LOCALE_NAMES['zh-Hant']).toBe('繁體中文')
  })
})

describe('translate', () => {
  it('selects the English plural branches', () => {
    expect(translate('en', 'countdown.days', { count: 1 })).toBe('1 day to go')
    expect(translate('en', 'countdown.days', { count: 12 })).toBe('12 days to go')
  })

  it('uses the single CJK branch for any count', () => {
    expect(translate('ja', 'countdown.days', { count: 1 })).toBe('あと1日')
    expect(translate('zh-Hant', 'countdown.days', { count: 1 })).toBe('還有 1 天')
  })

  it('falls back to English for a locale that has no such key, rather than throwing', () => {
    expect(translate('de', 'section.where')).toBe(CATALOGS.en['section.where'])
  })

  it('returns the key itself for a key nothing defines', () => {
    expect(translate('en', 'nope.not.here')).toBe('nope.not.here')
  })

  it('leaves an unknown placeholder visible instead of blanking it', () => {
    expect(interpolate('{a} and {b}', { a: 'x' }, 'en')).toBe('x and {b}')
  })

  it('routes numbers through Intl so a large count is grouped', () => {
    expect(interpolate('{count}', { count: 1234 }, 'en')).toBe('1,234')
  })
})

describe('negotiateLocale', () => {
  it('matches an exact tag, case-insensitively', () => {
    expect(negotiateLocale(['zh-Hant'])).toBe('zh-Hant')
    expect(negotiateLocale(['ZH-HANT'])).toBe('zh-Hant')
    expect(negotiateLocale(['ja'])).toBe('ja')
  })

  /**
   * THE REGRESSION THIS FILE EXISTS FOR. The sibling app negotiates with
   * `tag.split('-')[0]` against SUPPORTED, which can never equal 'zh-Hant' — so every
   * Chinese-preferring browser would silently land on English.
   */
  it('resolves every flavour of Chinese to the one Chinese catalog', () => {
    for (const tag of ['zh', 'zh-TW', 'zh-HK', 'zh-MO', 'zh-Hant-TW', 'zh-CN', 'zh-Hans']) {
      expect(negotiateLocale([tag]), tag).toBe('zh-Hant')
    }
  })

  it('matches on the primary subtag for the two-letter locales', () => {
    expect(negotiateLocale(['ja-JP'])).toBe('ja')
    expect(negotiateLocale(['en-GB'])).toBe('en')
  })

  it('respects the order the browser offered', () => {
    expect(negotiateLocale(['ko', 'zh-TW', 'en'])).toBe('zh-Hant')
    expect(negotiateLocale(['ko', 'en-AU', 'ja'])).toBe('en')
  })

  it('falls back to the default for anything it does not have', () => {
    expect(negotiateLocale(['ko', 'de'])).toBe(DEFAULT_LOCALE)
    expect(negotiateLocale([])).toBe(DEFAULT_LOCALE)
    expect(negotiateLocale([null, undefined])).toBe(DEFAULT_LOCALE)
  })

  it('accepts a bare string as well as a list', () => {
    expect(negotiateLocale('zh-TW')).toBe('zh-Hant')
  })
})

describe('pick', () => {
  const value = { en: 'E', ja: 'J', 'zh-Hant': 'Z' }

  it('resolves each locale', () => {
    expect(pick('en', value)).toBe('E')
    expect(pick('ja', value)).toBe('J')
    expect(pick('zh-Hant', value)).toBe('Z')
  })

  it('falls back through the default locale', () => {
    expect(pick('ko', value)).toBe('E')
  })

  it('passes a plain string and an array straight through', () => {
    expect(pick('ja', 'unchanged')).toBe('unchanged')
    expect(pick('ja', { ja: ['a', 'b'], en: ['x'], 'zh-Hant': ['z'] })).toEqual(['a', 'b'])
  })

  it('never returns the object itself, which would render as [object Object]', () => {
    expect(pick('en', {})).toBe('')
    expect(pick('en', null)).toBe('')
    expect(pick('en', undefined)).toBe('')
  })

  /* pick() lives in lib/pick.js with its own FALLBACK constant so that lib/ics.js can use it
     in Node without importing React. Two copies of the same fact, so they get asserted equal. */
  it("agrees with the i18n module's default locale", () => {
    expect(pick('ko', { en: 'E', ja: 'J', 'zh-Hant': 'Z' })).toBe(value[DEFAULT_LOCALE])
  })
})
