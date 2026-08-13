/**
 * The language switch. Three buttons, all visible, no dropdown.
 *
 * A `<select>` would be smaller and would hide two of the three languages behind a native
 * sheet — the wrong trade for the one control that decides whether a guest can read the page
 * at all. Three taps' worth of width is affordable; a language you cannot find is not.
 *
 * Each option is labelled in ITS OWN language and never translated: a Japanese reader
 * scanning for their language looks for 日本語, not for "Japanese", and a switch whose labels
 * change with the current locale is unusable the moment you land on the wrong one.
 *
 * `aria-current` carries the selected state rather than a class, so what is announced and
 * what is painted cannot disagree. `role="group"` and not `radiogroup`: these are buttons
 * that act immediately, and radio semantics would promise a separate confirmation step.
 */

import { useT } from '../i18n/index.js'
import { LOCALE_NAMES, LOCALE_SHORT, SUPPORTED } from '../i18n/catalogs.js'

export default function LangSwitch() {
  const { t, locale, setLocale } = useT()

  return (
    <div className="langbar">
      <div className="langswitch" role="group" aria-label={t('lang.label')}>
        {SUPPORTED.map((tag) => (
          <button
            key={tag}
            type="button"
            className="langswitch__option"
            /* The visible label is the short form so three options fit a 320px screen; the
               full name is the accessible one, so a screen reader says "English" rather
               than spelling out "E N". For the two CJK tags the short and long forms are
               nearly the same, and 中文 is not an abbreviation anybody has to decode. */
            aria-label={LOCALE_NAMES[tag]}
            aria-current={tag === locale ? 'true' : undefined}
            lang={tag}
            onClick={() => setLocale(tag)}
          >
            {LOCALE_SHORT[tag]}
          </button>
        ))}
      </div>
    </div>
  )
}
