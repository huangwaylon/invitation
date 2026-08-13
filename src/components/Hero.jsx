/**
 * The hero: who is getting married, when, where, and how long there is left.
 *
 * TWO VARIANTS, and the drawn one is the default. With no photograph set in content.js this
 * renders a dashed card with the couple's mark set into its top edge like a seal — not a
 * placeholder, and not a broken-image box. A photograph is an upgrade, not a requirement,
 * which matters because the page has to look finished before anybody has chosen one.
 *
 * The countdown is computed ONCE, at mount. On a page somebody opens, reads and closes,
 * that is the honest amount of machinery: the sibling planning app ticks a `useNow` hook
 * every minute because its whole subject is dates going past, whereas here the only way to
 * see a stale number is to leave the tab open across midnight in Nagano.
 */

import { COUPLE, DAY, HERO, VENUE } from '../content.js'
import { daysUntil, formatDay } from '../lib/time.js'
import { useT } from '../i18n/index.js'
import { PeaksIcon, FernIcon } from './icons.jsx'

/** A `public/` asset, so it needs the deployed base — the site serves from `/invitation/`. */
function photoUrl(src) {
  return `${import.meta.env?.BASE_URL ?? '/'}${src}`
}

/** The couple, in `COUPLE.order`, as an array so the ampersand can be a separate element. */
export function coupleNames(pick) {
  return COUPLE.order.map((slot) => pick(COUPLE[slot])).filter(Boolean)
}

/** The countdown line, or null when there is no real date yet to count towards. */
export function countdownText(t, days) {
  if (days == null) return null
  if (days > 0) return t('countdown.days', { count: days })
  if (days === 0) return t('countdown.today')
  return t('countdown.past', { count: -days })
}

export default function Hero() {
  const { t, pick, locale } = useT()

  const names = coupleNames(pick)
  const day = formatDay(DAY.date, locale)
  const days = daysUntil(DAY.date, DAY.timezone)
  const countdown = countdownText(t, days)
  const where = [pick(VENUE.name), pick(VENUE.area)].filter(Boolean).join(' · ')

  /* Shared by both variants, so the two never drift apart in wording or in order. */
  const text = (
    <div className="hero__text">
      <p className="hero__eyebrow">{t('hero.eyebrow')}</p>
      <h1 className="hero__names">
        {names[0] ? <span className="hero__name">{names[0]}</span> : null}
        {names.length > 1 ? <span className="hero__amp">&amp;</span> : null}
        {names[1] ? <span className="hero__name">{names[1]}</span> : null}
      </h1>
      <p className="hero__rule" aria-hidden="true" />
      {/* `<time>` only when the date is real. A dateTime attribute on "Date to be
          confirmed" would be a machine-readable lie. */}
      {day ? (
        <p className="hero__date">
          <time dateTime={DAY.date}>{day}</time>
        </p>
      ) : (
        <p className="hero__date">{t('hero.dateTbc')}</p>
      )}
      {where ? <p className="hero__where">{where}</p> : null}
      {countdown ? <p className="hero__count tnum">{countdown}</p> : null}
    </div>
  )

  if (HERO.src) {
    return (
      <header className="hero hero--photo on-photo">
        <img
          className="hero__img"
          src={photoUrl(HERO.src)}
          /* Deliberately empty, and it must stay that way: the <h1> below names the couple,
             so a described photograph says the same thing twice to a screen reader. */
          alt=""
          /* The largest-contentful-paint element on the page. index.html preloads the same
             URL, since React renders this and the preload scanner cannot see it in the HTML. */
          fetchPriority="high"
          decoding="async"
        />
        <span className="hero__scrim" aria-hidden="true" />
        {text}
      </header>
    )
  }

  return (
    <header className="hero">
      <div className="hero__frame">
        <span className="hero__mark" aria-hidden="true">
          <PeaksIcon />
        </span>
        {text}
        {/* Two sprigs in the bottom corners. The right one is the same frond mirrored — a
            second distinct plant here reads as clip-art; the same one flipped reads as a
            frame. */}
        <span className="hero__sprig hero__sprig--left" aria-hidden="true">
          <FernIcon />
        </span>
        <span className="hero__sprig hero__sprig--right" aria-hidden="true">
          <FernIcon />
        </span>
      </div>
    </header>
  )
}
