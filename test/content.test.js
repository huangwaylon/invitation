/**
 * content.js against the rest of the app: every glyph name it uses must exist, and every
 * translated field must carry all three languages.
 *
 * The overlap with scripts/check-content.js is deliberate and the split is not arbitrary —
 * that script is a DEPLOY GATE and runs in plain Node, so it cannot import JSX. This file can,
 * which is the only way to assert an `icon:` string against the real glyph registry.
 */

import { describe, expect, it } from 'vitest'
import { BRING, CLOSING, COUPLE, DAY, FAQ, PHOTOS, SCHEDULE, STORY, TRAVEL, VENUE, text } from '../src/content.js'
import { FLORA, GLYPHS } from '../src/components/icons.jsx'
import { SUPPORTED } from '../src/i18n/catalogs.js'
import { pick } from '../src/lib/pick.js'
import { isValidDay, isValidTime } from '../src/lib/time.js'

/** Every `icon:` string anywhere in content.js, with where it came from. */
const iconUses = [
  ...SCHEDULE.map((row, index) => [`SCHEDULE[${index}]`, row.icon]),
  ...TRAVEL.map((row, index) => [`TRAVEL[${index}]`, row.icon]),
  ...BRING.kit.map((row, index) => [`BRING.kit[${index}]`, row.icon]),
]

describe('icons', () => {
  it('resolves every glyph name content.js asks for', () => {
    for (const [where, name] of iconUses) {
      expect(GLYPHS[name], `${where} icon '${name}'`).toBeTypeOf('function')
    }
  })

  it('has at least as many plants as there are waypoints to put them beside', () => {
    // Ten waypoints at most: eight sections plus the two that are conditional on content.
    expect(FLORA.length).toBeGreaterThanOrEqual(10)
    for (const plant of FLORA) expect(plant).toBeTypeOf('function')
  })
})

describe('text()', () => {
  it('produces exactly the supported locale keys', () => {
    expect(Object.keys(text('a', 'b', 'c')).sort()).toEqual([...SUPPORTED].sort())
  })
})

describe('translated fields', () => {
  /** Recognises a `text()` object by its key set, so a field added later is checked for free. */
  function isTextObject(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false
    const keys = Object.keys(value)
    return keys.length === SUPPORTED.length && SUPPORTED.every((locale) => locale in value)
  }

  function collect(value, path, found = []) {
    if (isTextObject(value)) {
      found.push([path, value])
      return found
    }
    if (Array.isArray(value)) {
      value.forEach((item, index) => collect(item, `${path}[${index}]`, found))
      return found
    }
    if (value && typeof value === 'object') {
      for (const [key, item] of Object.entries(value)) collect(item, `${path}.${key}`, found)
    }
    return found
  }

  const fields = collect(
    { COUPLE, SCHEDULE, VENUE, TRAVEL, BRING, STORY, PHOTOS, FAQ, CLOSING },
    'content',
  )

  it('found some, so the walk above is actually reaching them', () => {
    expect(fields.length).toBeGreaterThan(30)
  })

  it('resolves to a non-empty value in all three languages', () => {
    for (const [path, value] of fields) {
      for (const locale of SUPPORTED) {
        const resolved = pick(locale, value)
        const empty = Array.isArray(resolved)
          ? resolved.filter((line) => String(line).trim()).length === 0
          : !String(resolved).trim()
        expect(empty, `${path} in ${locale}`).toBe(false)
      }
    }
  })

  it('never resolves to an object, which would render as [object Object]', () => {
    for (const [path, value] of fields) {
      for (const locale of SUPPORTED) {
        const resolved = pick(locale, value)
        expect(typeof resolved === 'string' || Array.isArray(resolved), `${path} in ${locale}`).toBe(true)
      }
    }
  })

  /**
   * A locale whose value is identical to English in every field means somebody filled the file
   * in with three copies of the same sentence, which the page would render as a working
   * language switch that changes nothing. Checked in aggregate rather than per field, because
   * a proper noun legitimately repeats.
   */
  it('is genuinely different per language rather than three copies of English', () => {
    for (const locale of SUPPORTED.filter((tag) => tag !== 'en')) {
      const differing = fields.filter(
        ([, value]) => JSON.stringify(pick(locale, value)) !== JSON.stringify(pick('en', value)),
      )
      expect(differing.length / fields.length, `${locale} share differing from en`).toBeGreaterThan(0.5)
    }
  })
})

describe('the day', () => {
  it('is a real date and two real times, or the calendar file will not be emitted', () => {
    expect(isValidDay(DAY.date)).toBe(true)
    expect(isValidTime(DAY.start)).toBe(true)
    expect(isValidTime(DAY.end)).toBe(true)
  })

  it('names a zone Intl recognises', () => {
    expect(() => new Intl.DateTimeFormat('en', { timeZone: DAY.timezone })).not.toThrow()
  })

  it('ends after it starts', () => {
    expect(DAY.end > DAY.start).toBe(true)
  })

  it('gives every schedule row either null or a real time', () => {
    for (const [index, row] of SCHEDULE.entries()) {
      expect(row.at == null || isValidTime(row.at), `SCHEDULE[${index}].at`).toBe(true)
    }
  })

  it('keeps the schedule in chronological order, since the trail is read top to bottom', () => {
    const times = SCHEDULE.map((row) => row.at).filter(Boolean)
    expect([...times].sort()).toEqual(times)
  })
})

describe('the couple', () => {
  it('orders two slots that both exist', () => {
    expect(COUPLE.order).toHaveLength(2)
    for (const slot of COUPLE.order) expect(COUPLE[slot]).toBeTypeOf('object')
  })
})

describe('photos', () => {
  /* An empty gallery is a valid, supported state — App.jsx drops the whole waypoint. These
     assertions therefore only apply to entries that exist. */
  it('declares real pixel dimensions for every entry, so the page does not reflow', () => {
    for (const [index, photo] of PHOTOS.entries()) {
      expect(photo.src, `PHOTOS[${index}].src`).toBeTruthy()
      expect(Number.isFinite(photo.w) && Number.isFinite(photo.h), `PHOTOS[${index}] w/h`).toBe(true)
    }
  })
})
