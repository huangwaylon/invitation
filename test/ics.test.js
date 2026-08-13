/**
 * The calendar file. Mostly about two things that only bite in this app specifically: zone
 * conversion without a VTIMEZONE component, and folding a line whose every character is
 * three UTF-8 bytes.
 */

import { describe, expect, it } from 'vitest'
import { buildIcs, icsPath, zonedInstant } from '../src/lib/ics.js'
import { SUPPORTED } from '../src/i18n/catalogs.js'

/** Unfold a folded file back into logical lines, the way a real parser would. */
function logicalLines(text) {
  return text.split('\r\n').reduce((lines, line) => {
    if (line.startsWith(' ')) lines[lines.length - 1] += line.slice(1)
    else if (line) lines.push(line)
    return lines
  }, [])
}

function field(text, name) {
  return logicalLines(text).find((line) => line.startsWith(`${name}:`))?.slice(name.length + 1)
}

describe('zonedInstant', () => {
  it('converts a Tokyo wall clock to the right UTC instant', () => {
    // Japan is UTC+9 all year, with no DST.
    expect(zonedInstant('2027-05-15', '11:00', 'Asia/Tokyo').toISOString()).toBe('2027-05-15T02:00:00.000Z')
    expect(zonedInstant('2027-05-15', '00:30', 'Asia/Tokyo').toISOString()).toBe('2027-05-14T15:30:00.000Z')
  })

  it('is exact for UTC itself', () => {
    expect(zonedInstant('2027-05-15', '11:00', 'UTC').toISOString()).toBe('2027-05-15T11:00:00.000Z')
  })

  /**
   * The second pass in `zonedInstant` exists only for this: on either side of a DST change the
   * offset differs, and a single-pass conversion picks whichever one the naive guess landed in.
   * Japan has no DST, so without a zone that does, that loop would be untested.
   */
  it('picks the right offset on both sides of a DST transition', () => {
    // New York: EST (-05:00) until 2027-03-14, EDT (-04:00) after.
    expect(zonedInstant('2027-03-01', '12:00', 'America/New_York').toISOString()).toBe('2027-03-01T17:00:00.000Z')
    expect(zonedInstant('2027-04-01', '12:00', 'America/New_York').toISOString()).toBe('2027-04-01T16:00:00.000Z')
  })

  it('handles midnight, where a 24-hour formatter may report hour 24', () => {
    expect(zonedInstant('2027-05-15', '00:00', 'Asia/Tokyo').toISOString()).toBe('2027-05-14T15:00:00.000Z')
    expect(zonedInstant('2027-05-15', '00:00', 'UTC').toISOString()).toBe('2027-05-15T00:00:00.000Z')
  })
})

describe('buildIcs', () => {
  const text = buildIcs('en')

  it('produces a file for every supported language', () => {
    for (const locale of SUPPORTED) {
      expect(buildIcs(locale), locale).toContain('BEGIN:VCALENDAR')
    }
  })

  it('uses CRLF throughout and ends with one', () => {
    expect(text.endsWith('\r\n')).toBe(true)
    // A bare LF anywhere would be a spec violation some parsers reject outright.
    expect(text.replace(/\r\n/g, '')).not.toContain('\n')
  })

  it('carries exactly one event', () => {
    expect(logicalLines(text).filter((line) => line === 'BEGIN:VEVENT')).toHaveLength(1)
  })

  /**
   * A TZID with no accompanying VTIMEZONE is non-conformant and clients guess differently —
   * some assume the reader's own zone, which would put the ceremony an hour out for a guest
   * importing it in Taipei. Z-suffixed instants are unambiguous, so there must be no TZID.
   */
  it('writes UTC instants rather than a bare TZID', () => {
    expect(text).not.toContain('TZID')
    expect(field(text, 'DTSTART')).toMatch(/^\d{8}T\d{6}Z$/)
    expect(field(text, 'DTEND')).toMatch(/^\d{8}T\d{6}Z$/)
  })

  it('starts and ends at the hours content.js gives, converted from the venue zone', () => {
    // 11:00 and 21:00 Asia/Tokyo, which is UTC+9 all year with no DST. The event deliberately spans
    // the whole day, from the ceremony to getting back to Togoshi Ginza — see DAY in content.js.
    expect(field(text, 'DTSTART')).toBe('20271008T020000Z')
    expect(field(text, 'DTEND')).toBe('20271008T120000Z')
  })

  it('is byte-identical between builds, so a deploy does not churn the file', () => {
    expect(buildIcs('en')).toBe(text)
    expect(field(text, 'DTSTAMP')).toBe('19700101T000000Z')
  })

  it('gives each language its own stable UID, so two taps do not make two events', () => {
    expect(field(buildIcs('ja'), 'UID')).toBe(field(buildIcs('ja'), 'UID'))
    expect(field(buildIcs('ja'), 'UID')).not.toBe(field(buildIcs('en'), 'UID'))
  })

  /**
   * The venue name is also the sharpest available test that the Chinese column is not a copy of
   * the Japanese one: 偕楽園 uses the Japanese shinjitai 楽, whose Traditional form is 樂. If
   * somebody ever "tidies" content.js by duplicating the Japanese into the Chinese slot, this is
   * what catches it.
   */
  it('localises the summary, because a calendar client has no locale context of its own', () => {
    expect(field(buildIcs('ja'), 'SUMMARY')).toContain('偕楽園')
    expect(field(buildIcs('zh-Hant'), 'SUMMARY')).toContain('偕樂園')
    expect(field(buildIcs('zh-Hant'), 'SUMMARY')).not.toContain('偕楽園')
    expect(field(buildIcs('en'), 'SUMMARY')).toContain('Kairakuen')
  })

  it('escapes the characters iCalendar reserves, and does not double-escape them', () => {
    // The description joins schedule rows with newlines, which must survive as literal \n.
    const description = field(text, 'DESCRIPTION')
    expect(description).toContain('\\n')
    expect(description).not.toContain('\\\\n')
    // A comma inside any content string must arrive escaped exactly once.
    expect(field(text, 'LOCATION')).toContain('\\,')
    expect(field(text, 'LOCATION')).not.toContain('\\\\,')
  })

  /**
   * THE ONE THAT MATTERS FOR THIS PAGE. Every summary and description exists in Japanese and
   * Chinese, where one character is three UTF-8 bytes. A 75-CHARACTER fold produces lines of
   * up to 225 octets; a naive 75-BYTE slice splits a character in half and yields mojibake in
   * the middle of the venue name.
   */
  it('folds to 75 octets and never mid-codepoint', () => {
    for (const locale of SUPPORTED) {
      const file = buildIcs(locale)
      for (const line of file.split('\r\n')) {
        expect(Buffer.byteLength(line, 'utf8'), `${locale}: ${line}`).toBeLessThanOrEqual(76)
      }
      // Round-tripping the encoded bytes is what proves no character was cut in half: a split
      // codepoint decodes to U+FFFD, which cannot appear in the source strings.
      expect(file, locale).not.toContain('�')
    }
  })

  it('unfolds back to the strings that went in', () => {
    expect(field(buildIcs('ja'), 'LOCATION')).toContain('茨城県水戸市')
    expect(field(buildIcs('ja'), 'LOCATION')).toContain('迎賓館 偕楽園 別邸')
  })
})

describe('icsPath', () => {
  it('is a plain relative path, so it composes with any deployed base', () => {
    expect(icsPath('en')).toBe('calendar/wedding-en.ics')
    expect(icsPath('zh-Hant')).toBe('calendar/wedding-zh-Hant.ics')
    for (const path of SUPPORTED.map(icsPath)) expect(path.startsWith('/')).toBe(false)
  })
})
