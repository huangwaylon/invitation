/**
 * The day, as a description list — which is what it is: a set of times, each with a thing
 * that happens at it. `<dl>` gives a screen reader that pairing for free, where a pile of
 * divs would read as fourteen unrelated fragments.
 *
 * No glyph column. Every row already has one on the trail a few pixels to the left, and a
 * second column of pictures inside the section would compete with the waypoint disc rather
 * than add anything.
 */

import { SCHEDULE } from '../content.js'
import { formatTime, isValidTime } from '../lib/time.js'
import { useT } from '../i18n/index.js'

export default function Schedule() {
  const { pick, locale } = useT()

  return (
    <dl className="schedule">
      {SCHEDULE.map((row, index) => {
        const timed = isValidTime(row.at)
        const note = pick(row.note)
        return (
          <div
            key={index}
            className={timed ? 'schedule__row' : 'schedule__row schedule__row--untimed'}
          >
            {/* A row with no time prints no time column at all rather than an empty one —
                an empty cell beside a title reads as a value that failed to load. */}
            {timed ? (
              <dt className="schedule__time">
                <time dateTime={row.at}>{formatTime(row.at, locale)}</time>
              </dt>
            ) : null}
            <dd className="schedule__title">{pick(row.title)}</dd>
            {note ? <dd className="schedule__note">{note}</dd> : null}
          </div>
        )
      })}
    </dl>
  )
}
