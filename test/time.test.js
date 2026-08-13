/**
 * Wall-clock dates and times, and the one rule they all serve: `new Date('2027-05-15')`
 * parses as UTC midnight and renders as the 14th anywhere west of Greenwich.
 */

import { describe, expect, it } from 'vitest'
import { daysUntil, formatDay, formatTime, isValidDay, isValidTime, todayInZone } from '../src/lib/time.js'

describe('isValidDay', () => {
  it('accepts a real day', () => {
    expect(isValidDay('2027-05-15')).toBe(true)
    expect(isValidDay('2028-02-29')).toBe(true)
  })

  it('rejects a day that does not exist', () => {
    expect(isValidDay('2027-02-31')).toBe(false)
    expect(isValidDay('2027-13-01')).toBe(false)
    expect(isValidDay('2027-00-10')).toBe(false)
    expect(isValidDay('2027-02-30')).toBe(false)
    expect(isValidDay('2027-02-29')).toBe(false)
  })

  it('rejects anything that is not exactly YYYY-MM-DD', () => {
    for (const value of ['2027-5-15', '2027-05-15T00:00', '15/05/2027', '', null, undefined, 20270515]) {
      expect(isValidDay(value), String(value)).toBe(false)
    }
  })
})

describe('isValidTime', () => {
  it('accepts a 24-hour wall clock', () => {
    expect(isValidTime('00:00')).toBe(true)
    expect(isValidTime('9:05')).toBe(true)
    expect(isValidTime('23:59')).toBe(true)
  })

  it('rejects an impossible clock', () => {
    for (const value of ['24:00', '12:60', '12', '12:5', '', null]) {
      expect(isValidTime(value), String(value)).toBe(false)
    }
  })
})

describe('formatDay', () => {
  /**
   * THE CENTRAL REGRESSION. If `formatDay` ever builds its Date without the UTC anchoring,
   * this reads as the 14th under any negative-offset TZ, and the test process runs in whatever
   * zone the machine is in.
   */
  it('renders the day it was given, not the day before', () => {
    expect(formatDay('2027-05-15', 'en')).toContain('15')
    expect(formatDay('2027-05-15', 'en')).toContain('2027')
    expect(formatDay('2027-01-01', 'en')).toContain('January')
  })

  it('names the weekday, which is half of what a date on an invitation is for', () => {
    // 15 May 2027 is a Saturday.
    expect(formatDay('2027-05-15', 'en')).toContain('Saturday')
    expect(formatDay('2027-05-15', 'ja')).toContain('土曜日')
    expect(formatDay('2027-05-15', 'zh-Hant')).toContain('六')
  })

  it('can be asked for no weekday', () => {
    expect(formatDay('2027-05-15', 'en', { weekday: false })).not.toContain('Saturday')
  })

  it('renders each locale in its own convention', () => {
    expect(formatDay('2027-05-15', 'ja')).toContain('2027年5月15日')
    expect(formatDay('2027-05-15', 'zh-Hant')).toContain('2027年5月15日')
  })

  it('returns empty for a day that is not real, so a caller can substitute its own copy', () => {
    expect(formatDay('', 'en')).toBe('')
    expect(formatDay('2027-02-31', 'en')).toBe('')
  })
})

describe('formatTime', () => {
  it("uses each locale's own clock rather than a hardcoded one", () => {
    // en is 12-hour, ja is 24-hour. Asserting the shape rather than the exact punctuation,
    // which CLDR is entitled to change.
    expect(formatTime('11:00', 'en')).toMatch(/11:00\s?(AM|am)/)
    expect(formatTime('19:00', 'ja')).toContain('19:00')
    expect(formatTime('11:00', 'zh-Hant')).toContain('11:00')
  })

  it('renders midnight and noon without wrapping to the wrong half', () => {
    expect(formatTime('00:00', 'en')).toMatch(/12:00\s?(AM|am)/)
    expect(formatTime('12:00', 'en')).toMatch(/12:00\s?(PM|pm)/)
  })

  it('returns empty for an impossible time', () => {
    expect(formatTime('24:00', 'en')).toBe('')
    expect(formatTime(null, 'en')).toBe('')
  })
})

describe('todayInZone', () => {
  it('reports the calendar day at the venue, not at the reader', () => {
    // 2027-05-14T22:00Z is already the 15th in Tokyo (+09:00) and still the 14th in New York.
    const instant = Date.UTC(2027, 4, 14, 22, 0)
    expect(todayInZone('Asia/Tokyo', instant)).toBe('2027-05-15')
    expect(todayInZone('America/New_York', instant)).toBe('2027-05-14')
    expect(todayInZone('UTC', instant)).toBe('2027-05-14')
  })

  it('zero-pads, so the result is always exactly YYYY-MM-DD', () => {
    expect(todayInZone('UTC', Date.UTC(2027, 0, 5, 12))).toBe('2027-01-05')
  })

  it('falls back to the device zone rather than throwing on an unknown zone', () => {
    expect(isValidDay(todayInZone('Mars/Olympus_Mons', Date.UTC(2027, 4, 15, 12)))).toBe(true)
  })
})

describe('daysUntil', () => {
  it('counts calendar days in the venue zone', () => {
    expect(daysUntil('2027-05-15', 'Asia/Tokyo', Date.UTC(2027, 4, 14, 3))).toBe(1)
    expect(daysUntil('2027-05-15', 'Asia/Tokyo', Date.UTC(2027, 4, 15, 3))).toBe(0)
    expect(daysUntil('2027-05-15', 'Asia/Tokyo', Date.UTC(2027, 4, 16, 3))).toBe(-1)
  })

  /**
   * The whole reason the zone is a content.js field. At 22:00Z on the 14th, Tokyo has already
   * turned over: a guest anywhere in the world should be told the same number, and it should
   * be the venue's.
   */
  it('flips at midnight at the venue, not at midnight on the device', () => {
    const instant = Date.UTC(2027, 4, 14, 22, 0)
    expect(daysUntil('2027-05-15', 'Asia/Tokyo', instant)).toBe(0)
    expect(daysUntil('2027-05-15', 'America/New_York', instant)).toBe(1)
  })

  it('is unaffected by a DST transition between now and then', () => {
    // US DST starts 2027-03-14. Counting from 1 March to 1 April crosses it; the answer is
    // 31 calendar days regardless, which an elapsed-hours calculation would get wrong by one.
    expect(daysUntil('2027-04-01', 'America/New_York', Date.UTC(2027, 2, 1, 17))).toBe(31)
  })

  it('handles a leap day and a year boundary', () => {
    expect(daysUntil('2028-03-01', 'UTC', Date.UTC(2028, 1, 28, 12))).toBe(2)
    expect(daysUntil('2028-01-01', 'UTC', Date.UTC(2027, 11, 31, 12))).toBe(1)
  })

  it('is null for a day that is not real, which is what content.js holds before it is filled in', () => {
    expect(daysUntil('', 'UTC', 0)).toBe(null)
    expect(daysUntil('2027-02-31', 'UTC', 0)).toBe(null)
  })
})
