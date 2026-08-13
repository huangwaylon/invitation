/**
 * The end of the trail: the closing line, the calendar file, and how to reach the two of them.
 *
 * THERE IS NO RSVP, and that is a decision rather than an omission. At fifteen guests the
 * couple already knows who is coming; a form would be ceremony for its own sake, and on a
 * static page it would mean either a third-party embed or a backend. So the one action here
 * is the calendar file — which is the thing a guest actually wants from an invitation once
 * they have read it.
 *
 * The `.ics` is generated at BUILD time by the plugin in vite.config.js, one per language,
 * and linked as a plain same-origin file. See `lib/ics.js` for why not a blob.
 */

import { CLOSING, CONTACT, DAY } from '../content.js'
import { COUPLE } from '../content.js'
import { icsPath } from '../lib/ics.js'
import { isValidDay, isValidTime } from '../lib/time.js'
import { useT } from '../i18n/index.js'
import { CalendarIcon, EnvelopeIcon } from './icons.jsx'

export default function Closing() {
  const { t, pick, locale } = useT()

  const names = COUPLE.order.map((slot) => pick(COUPLE[slot])).filter(Boolean).join(' & ')
  const email = CONTACT.email
  const other = pick(CONTACT.other)

  /* The button appears only if the build would actually have emitted a file. The same three
     fields gate `buildIcs`, so this cannot offer a download that 404s. */
  const hasCalendar = isValidDay(DAY.date) && isValidTime(DAY.start) && isValidTime(DAY.end)
  const href = `${import.meta.env?.BASE_URL ?? '/'}${icsPath(locale)}`

  return (
    <div className="closing">
      <p className="closing__line">{pick(CLOSING)}</p>
      {names ? <p className="closing__names">{names}</p> : null}

      {hasCalendar ? (
        <div className="closing__actions">
          {/* `download` names the saved file; iOS ignores it and opens the event in Calendar
              instead, which is the better behaviour and the reason the hint below exists — an
              unexplained system sheet is alarming, and saying what will happen first costs
              one line. */}
          <a className="btn btn--primary" href={href} download={`wedding-${locale}.ics`}>
            <CalendarIcon />
            {t('calendar.add')}
          </a>
          <p className="closing__hint">{t('calendar.hint')}</p>
        </div>
      ) : null}

      {email || other ? (
        <div className="closing__contact">
          <span className="label">{t('contact.title')}</span>
          {email ? (
            <p>
              <a className="btn btn--quiet" href={`mailto:${email}`}>
                <EnvelopeIcon />
                {t('contact.email')}
              </a>
            </p>
          ) : null}
          {other ? <p>{other}</p> : null}
        </div>
      ) : null}
    </div>
  )
}
