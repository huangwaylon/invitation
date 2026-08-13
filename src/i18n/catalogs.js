/**
 * The three catalogs and the locale list, in one place so `index.js`, the tests and
 * tokens.css's `html[lang]` blocks all agree on the tags.
 *
 * THE TAGS ARE BCP-47 AND ONE OF THEM CARRIES A SCRIPT SUBTAG. 'zh-Hant', not 'zh' and
 * not 'zh-TW': the distinction that matters to a Taiwanese reader is Traditional vs
 * Simplified script, not the region, and writing the script explicitly is what makes
 * `Intl` and the font stack in tokens.css select correctly. Anything that assumes a
 * locale tag is two letters — `tag.split('-')[0]`, `tag.slice(0, 2)` — is wrong here and
 * `test/i18n.test.js` has a case for it.
 */

import en from './en.js'
import ja from './ja.js'
import zhHant from './zh-Hant.js'

export const DEFAULT_LOCALE = 'en'

/** Order matters: it is the order the language switch renders in. */
export const SUPPORTED = ['en', 'ja', 'zh-Hant']

export const CATALOGS = { en, ja, 'zh-Hant': zhHant }

/**
 * What the switch prints for each language — each in ITS OWN language, never translated.
 * A Japanese reader looking for their language scans for 日本語, not for "Japanese", and a
 * switch that renames the options per current locale is a switch you cannot use once you
 * have picked the wrong one.
 *
 * Not in the catalogs for the same reason: these three strings are identical in all three
 * of them, and a key with three identical values is a key somebody will eventually
 * "helpfully" translate.
 */
export const LOCALE_NAMES = {
  en: 'English',
  ja: '日本語',
  'zh-Hant': '繁體中文',
}

/** The short form, for the switch on a narrow phone where three full names will not fit. */
export const LOCALE_SHORT = {
  en: 'EN',
  ja: '日本語',
  'zh-Hant': '中文',
}
