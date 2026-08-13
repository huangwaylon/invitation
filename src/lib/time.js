/**
 * Dates and clock times, all of them WALL-CLOCK values with no zone attached.
 *
 * THE ONE RULE: never `new Date('2027-05-15')`. That parses as UTC midnight, so
 * everywhere west of Greenwich it formats as the 14th — a guest in California opening the
 * invitation would read the wrong day. Every function here that turns a day string into a
 * Date does it through `Date.UTC` on the parsed parts and formats with `timeZone: 'UTC'`,
 * which makes the round trip exact.
 *
 * The countdown is the one place a real zone is involved, and it is the VENUE's zone, not
 * the device's: "3 days to go" has to flip at midnight in Nagano, so that everyone
 * everywhere is counting the same days to the same morning.
 */

const DAY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/
const TIME_PATTERN = /^(\d{1,2}):(\d{2})$/

const MS_PER_DAY = 86400000

/** True for a real calendar day in 'YYYY-MM-DD'. Rejects '2027-02-31' and '2027-13-01'. */
export function isValidDay(day) {
  const match = DAY_PATTERN.exec(String(day ?? ''))
  if (!match) return false
  const [, y, m, d] = match.map(Number)
  if (m < 1 || m > 12 || d < 1 || d > 31) return false
  // Round-trip through UTC: February 31st normalises to March 3rd and fails to match.
  const date = new Date(Date.UTC(y, m - 1, d))
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
}

/** True for 'HH:MM' on a 24-hour clock. */
export function isValidTime(time) {
  const match = TIME_PATTERN.exec(String(time ?? ''))
  if (!match) return false
  const [, h, m] = match.map(Number)
  return h >= 0 && h <= 23 && m >= 0 && m <= 59
}

/**
 * A day string as a UTC-anchored Date, for formatting only. Never for arithmetic against
 * `Date.now()` — that mixes a wall-clock value with a real instant.
 */
function utcDate(day, time = '00:00') {
  const dayMatch = DAY_PATTERN.exec(String(day))
  if (!dayMatch) return null
  const [, y, m, d] = dayMatch.map(Number)
  const timeMatch = TIME_PATTERN.exec(String(time))
  const [h, min] = timeMatch ? [Number(timeMatch[1]), Number(timeMatch[2])] : [0, 0]
  return new Date(Date.UTC(y, m - 1, d, h, min))
}

const dayFormats = new Map()

/**
 * The date, spelled out for a reader. 'YYYY-MM-DD' in, "Saturday, 15 May 2027" or
 * "2027年5月15日土曜日" or "2027年5月15日 星期六" out.
 *
 * `timeZone: 'UTC'` pairs with `utcDate` above and is what stops the formatter shifting
 * the day by one. `weekday` is on by default because on an invitation the day of the week
 * is half the information — people plan around a Saturday, not around the 15th.
 */
export function formatDay(day, locale, { weekday = true } = {}) {
  if (!isValidDay(day)) return ''
  const key = `${locale}|${weekday}`
  let format = dayFormats.get(key)
  if (!format) {
    format = new Intl.DateTimeFormat(locale, {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...(weekday ? { weekday: 'long' } : null),
    })
    dayFormats.set(key, format)
  }
  return format.format(utcDate(day))
}

const timeFormats = new Map()

/**
 * A clock time for a reader: '11:00' becomes "11:00 AM", "11:00" or "上午11:00" depending
 * on the locale. Whether to use a 12- or 24-hour clock is Intl's decision per locale and
 * not ours — hardcoding either one is how a Japanese page ends up saying "11:00 AM".
 */
export function formatTime(time, locale) {
  if (!isValidTime(time)) return ''
  let format = timeFormats.get(locale)
  if (!format) {
    format = new Intl.DateTimeFormat(locale, { timeZone: 'UTC', hour: 'numeric', minute: '2-digit' })
    timeFormats.set(locale, format)
  }
  // Any day at all: only the time fields are rendered.
  return format.format(utcDate('1970-01-01', time))
}

const zoneFormats = new Map()

/**
 * What day it is RIGHT NOW in a given zone, as 'YYYY-MM-DD'.
 *
 * Built from `formatToParts` rather than by formatting to a locale that happens to print
 * ISO order: 'en-CA' does produce YYYY-MM-DD today, but relying on a locale's format
 * pattern to be machine-readable is exactly the kind of thing that changes under you in a
 * CLDR update.
 */
export function todayInZone(timezone, nowMs = Date.now()) {
  let format = zoneFormats.get(timezone)
  if (!format) {
    try {
      format = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    } catch {
      // An unknown zone must not throw the page away: fall back to the device's own.
      format = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    }
    zoneFormats.set(timezone, format)
  }
  const parts = {}
  for (const part of format.formatToParts(new Date(nowMs))) parts[part.type] = part.value
  return `${parts.year}-${parts.month}-${parts.day}`
}

/**
 * Whole calendar days from today-in-`timezone` until `day`. Positive is future, 0 is
 * today, negative is past. `null` if the day is not a valid date, which is what
 * `content.js` holds before somebody fills it in.
 *
 * CALENDAR days, not elapsed 24-hour periods: both sides are reduced to a wall-clock date
 * first and subtracted at UTC midnight, so no DST transition anywhere between here and
 * the wedding can make this off by one.
 */
export function daysUntil(day, timezone, nowMs = Date.now()) {
  if (!isValidDay(day)) return null
  const today = todayInZone(timezone, nowMs)
  const from = utcDate(today)
  const to = utcDate(day)
  if (!from || !to) return null
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY)
}
