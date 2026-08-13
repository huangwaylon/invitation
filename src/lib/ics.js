/**
 * The calendar file, generated at BUILD time — one per language — by the plugin in
 * vite.config.js, and served as a static same-origin file.
 *
 * WHY BUILD TIME AND NOT A BLOB. The obvious implementation is to build the text in the
 * browser and hand it to an anchor as a `blob:` or `data:` URL. Both have real problems:
 * a `data:text/calendar` href is blocked by every browser as a top-level navigation, and
 * a `blob:` URL would need `default-src 'self'` widened to allow it. A file emitted into
 * `dist/` needs neither, works with JavaScript disabled, and can be linked directly.
 *
 * THIS MODULE MUST STAY NODE-SAFE — no `import.meta.env`, no `document`, no `window`. The
 * Vite config imports it during the build.
 *
 * Format is RFC 5545. The parts that look like superstition and are not: CRLF line
 * endings, folding at 75 octets, and escaping before folding.
 */

import { DAY, SCHEDULE, VENUE, COUPLE, CLOSING } from '../content.js'
import { pick } from './pick.js'
import { isValidDay, isValidTime } from './time.js'

/**
 * The UTC offset of `timeZone` at a given instant, in milliseconds.
 *
 * Formats the instant INTO the zone, reads the wall-clock fields back out, and treats
 * them as if they were UTC — the difference is the offset. This is the standard trick and
 * it is the only way to get a zone offset out of `Intl` without a tz database.
 *
 * `hour: '2-digit'` with `hour12: false` yields '24' for midnight in some engines rather
 * than '00', hence the `% 24`. Without it, midnight comes back a day late.
 */
function offsetMs(timeZone, instant) {
  const format = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const parts = {}
  for (const part of format.formatToParts(instant)) parts[part.type] = part.value
  const asIfUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) % 24,
    Number(parts.minute),
    Number(parts.second),
  )
  return asIfUtc - instant.getTime()
}

/**
 * A wall-clock day and time in a named zone, as a real instant.
 *
 * Two passes. The first guesses that the wall time is UTC and asks what the offset is
 * near that instant; the second re-checks with the corrected instant, which is what makes
 * it right across a DST boundary — during the hour a zone springs forward, the offset
 * before and after differ, and one pass picks the wrong one. Japan has no DST, so today
 * this loop is theatre; it is here because the venue's zone is a field in content.js and
 * the next couple to copy this file may be getting married in Auckland.
 */
export function zonedInstant(day, time, timeZone) {
  const [y, m, d] = day.split('-').map(Number)
  const [h, min] = time.split(':').map(Number)
  const naive = Date.UTC(y, m - 1, d, h, min)
  let instant = new Date(naive - offsetMs(timeZone, new Date(naive)))
  instant = new Date(naive - offsetMs(timeZone, instant))
  return instant
}

/** RFC 5545 UTC timestamp: 20270515T020000Z. */
function stamp(instant) {
  return `${instant.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`
}

/**
 * Escape a TEXT value. Backslash first — escaping it after the others would double-escape
 * the backslashes they just introduced. Newlines become a literal `\n`, which is how
 * iCalendar carries a multi-line description.
 */
function esc(value) {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

/**
 * Fold a content line to 75 OCTETS, not 75 characters, and never mid-codepoint.
 *
 * This is the part that matters for this page specifically: every summary and description
 * here exists in Japanese and Chinese, where one character is three UTF-8 bytes. A naive
 * 75-character fold produces lines of up to 225 octets, which some parsers truncate; a
 * naive 75-byte slice splits a multi-byte character in half and yields mojibake in the
 * middle of the venue name. So the length is measured in encoded bytes and the break is
 * only ever taken at a codepoint boundary.
 *
 * A continuation line begins with exactly one space, which the parser strips.
 */
function fold(line) {
  const encoder = new TextEncoder()
  const out = []
  let current = ''
  let bytes = 0
  // Continuation lines carry one leading space, so their payload budget is one less.
  let limit = 75
  for (const character of line) {
    const size = encoder.encode(character).length
    if (bytes + size > limit) {
      out.push(current)
      current = character
      bytes = size
      limit = 74
    } else {
      current += character
      bytes += size
    }
  }
  out.push(current)
  return out.map((part, index) => (index === 0 ? part : ` ${part}`)).join('\r\n')
}

/** The couple, in `COUPLE.order`, joined for a calendar entry's title. */
function coupleNames(locale) {
  return COUPLE.order.map((slot) => pick(locale, COUPLE[slot])).filter(Boolean).join(' & ')
}

/**
 * The .ics text for one locale, or `null` if the day is not yet a real date — in which
 * case the build emits no file and the calendar button does not render. An invitation that
 * offers to add "Invalid Date" to your calendar is worse than one that offers nothing.
 *
 * ONE EVENT, NOT SEVEN. The schedule has seven rows, and putting each on the guest's
 * calendar would fill their Saturday with seven overlapping blocks and seven alarms. The
 * day is one event; the schedule rides in its DESCRIPTION, which is where somebody looks
 * when they have already decided to come.
 */
export function buildIcs(locale, { now = new Date(0) } = {}) {
  const { date, timezone, start, end } = DAY
  if (!isValidDay(date) || !isValidTime(start) || !isValidTime(end)) return null

  const names = coupleNames(locale)
  const venue = pick(locale, VENUE.name)
  const address = pick(locale, VENUE.address)
  const location = [venue, ...(Array.isArray(address) ? address : [address])].filter(Boolean).join(', ')

  const description = [
    ...SCHEDULE.filter((row) => isValidTime(row.at)).map(
      (row) => `${row.at} — ${pick(locale, row.title)}`,
    ),
    '',
    pick(locale, CLOSING),
  ].join('\n')

  /**
   * A stable UID: the same day and the same couple must produce the same UID on every
   * build, or a guest who taps the button twice ends up with two events. Which is also why
   * `now` is injected and defaults to the epoch rather than calling `Date.now()` — a
   * DTSTAMP that moves every build makes the emitted files differ on every deploy, which
   * defeats content hashing and makes the diff unreadable.
   */
  const uid = `${date}-${locale}@waylon-asuka.invitation`

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Waylon and Asuka//Invitation//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp(now)}`,
    // UTC instants rather than `DTSTART;TZID=Asia/Tokyo:…`. A TZID that is not accompanied
    // by a VTIMEZONE component is non-conformant, and clients disagree about how to guess
    // one — some assume the reader's own zone, which would put the ceremony an hour out
    // for a guest importing it in Taipei. A Z-suffixed instant is unambiguous everywhere.
    `DTSTART:${stamp(zonedInstant(date, start, timezone))}`,
    `DTEND:${stamp(zonedInstant(date, end, timezone))}`,
    `SUMMARY:${esc(`${names} — ${venue}`)}`,
    `LOCATION:${esc(location)}`,
    `DESCRIPTION:${esc(description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]

  // CRLF, per the spec, and a trailing one: a file that ends without a line break is
  // rejected outright by some parsers.
  return `${lines.map(fold).join('\r\n')}\r\n`
}

/** Where the emitted file lives under the site root. Shared by the plugin and the button. */
export function icsPath(locale) {
  return `calendar/wedding-${locale}.ics`
}
