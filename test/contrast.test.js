/**
 * The palette, asserted from the test suite rather than only by `npm run contrast`.
 *
 * The script prints a report a human reads; this fails a build. The two overlap on purpose —
 * the script is where the numbers to paste into tokens.css come from, and this is what stops
 * somebody changing a hex in tokens.css without running it.
 *
 * The values here are duplicated from tokens.css because CSS custom properties cannot be
 * imported. That duplication is the weak point, and the last test in this file is what covers
 * it: it reads tokens.css and asserts every colour below actually appears in it.
 */

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { contrast, over } from '../scripts/contrast-math.js'

const BG = '#faf7f4'
const SURFACE = '#ffffff'
const SUNKEN = '#f3ece7'
const SURFACES = { bg: BG, surface: SURFACE, sunken: SUNKEN }

const INK = { '--ink': '#1c1a17', '--ink-2': '#56504a', '--ink-3': '#736a61' }
/** Placeholder and disabled text only. Never carries information, so 3:1 rather than 4.5:1. */
const INK_4 = '#8c8377'

const ACCENT = '#385844'
const ACCENT_HOVER = '#2d4737'
const ACCENT_WASH = '#e8f0ea'
const OCHRE = '#6b4d17'
const TRAIL = '#a68f70'
const TRAIL_NODE = '#9d8768'
const FLORA = '#c2b49c'

describe('contrast maths', () => {
  it('matches the WCAG reference pairs', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 5)
    expect(contrast('#ffffff', '#ffffff')).toBeCloseTo(1, 5)
    // Order must not matter.
    expect(contrast(ACCENT, BG)).toBeCloseTo(contrast(BG, ACCENT), 10)
  })

  it('expands three-digit hex', () => {
    expect(contrast('#fff', '#000')).toBeCloseTo(contrast('#ffffff', '#000000'), 10)
  })

  it('composites alpha the way the browser paints it', () => {
    expect(over('#ffffff', '#000000', 0)).toBe('#ffffff')
    expect(over('#ffffff', '#000000', 1)).toBe('#000000')
    expect(over('#ffffff', '#000000', 0.5)).toBe('#808080')
  })
})

describe('text', () => {
  it('clears AA on all three surfaces', () => {
    for (const [name, hex] of Object.entries(INK)) {
      for (const [where, surface] of Object.entries(SURFACES)) {
        expect(contrast(hex, surface), `${name} on ${where}`).toBeGreaterThanOrEqual(4.5)
      }
    }
  })

  it('holds the placeholder ink to the 3:1 graphic floor', () => {
    for (const [where, surface] of Object.entries(SURFACES)) {
      expect(contrast(INK_4, surface), `--ink-4 on ${where}`).toBeGreaterThanOrEqual(3)
    }
  })

  /**
   * --ink-3 is the lightest ink on the page and it is used at 13px, where both CJK locales
   * render Han glyphs whose strokes are far finer than Latin at the same size. There is no
   * headroom to give away here, so the floor is asserted rather than the comfortable margin.
   */
  it('leaves the lightest ink no room to be lightened further', () => {
    expect(contrast(INK['--ink-3'], SUNKEN)).toBeGreaterThanOrEqual(4.5)
    expect(contrast('#807a70', SUNKEN), 'one step lighter would fail').toBeLessThan(4.5)
  })
})

describe('the accent', () => {
  it('carries white text', () => {
    expect(contrast('#ffffff', ACCENT)).toBeGreaterThanOrEqual(4.5)
    expect(contrast('#ffffff', ACCENT_HOVER)).toBeGreaterThanOrEqual(4.5)
  })

  it('is legible as text on every surface it is used on, including its own wash', () => {
    for (const [where, surface] of Object.entries({ ...SURFACES, wash: ACCENT_WASH })) {
      expect(contrast(ACCENT, surface), `accent on ${where}`).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('clears the 3:1 non-text floor as a focus ring on anything it can land on', () => {
    for (const [where, surface] of Object.entries({ ...SURFACES, wash: ACCENT_WASH })) {
      expect(contrast(ACCENT, surface), `ring on ${where}`).toBeGreaterThanOrEqual(3)
    }
  })

  it('gets darker on hover rather than lighter', () => {
    expect(contrast('#ffffff', ACCENT_HOVER)).toBeGreaterThan(contrast('#ffffff', ACCENT))
  })
})

describe('the ochre', () => {
  /* Used for the story years, which are WORDS. A decorative-only colour that later gets text
     put on it is how a palette rots, so it is held to full AA from the start. */
  it('clears AA as text, not just as a shape', () => {
    for (const [where, surface] of Object.entries(SURFACES)) {
      expect(contrast(OCHRE, surface), `ochre on ${where}`).toBeGreaterThanOrEqual(4.5)
    }
    expect(contrast('#ffffff', OCHRE)).toBeGreaterThanOrEqual(4.5)
  })
})

describe('the trail', () => {
  /**
   * These are BELOW 3:1 and that is legitimate: every one is aria-hidden and carries no
   * information. What they must not be is invisible — the path and the rings are the only thing
   * holding this layout's shape together. So the assertion is a floor AND a ceiling, and the
   * ceiling is what documents that they are decoration: if the trail ever clears 3:1 somebody
   * has started using it to mean something, and check-contrast.js needs a real row for it.
   */
  it('is clearly visible without pretending to be informational', () => {
    expect(contrast(TRAIL, BG)).toBeGreaterThan(2.5)
    expect(contrast(TRAIL_NODE, BG)).toBeGreaterThan(3)
  })

  it('keeps the flora the faintest thing on the page', () => {
    expect(contrast(FLORA, BG)).toBeLessThan(contrast(TRAIL, BG))
    expect(contrast(FLORA, BG)).toBeLessThan(contrast(TRAIL_NODE, BG))
    // Still visible at all: below about 1.3 a hairline vanishes on a dimmed phone screen.
    expect(contrast(FLORA, BG)).toBeGreaterThan(1.5)
  })
})

describe('over the hero photograph', () => {
  /**
   * The one surface whose background is unknown, so the ink is measured against the WORST case
   * the scrim allows: a blown-out white sky beneath the gradient's densest stop.
   */
  it('keeps white ink legible over a white sky at the scrim used in tokens.css', () => {
    expect(contrast('#ffffff', over('#ffffff', '#181410', 0.72))).toBeGreaterThanOrEqual(4.5)
  })

  it('records what lightening the scrim would cost', () => {
    expect(contrast('#ffffff', over('#ffffff', '#181410', 0.5))).toBeLessThan(4.5)
  })

  it('keeps a control disc on the photograph above the 3:1 graphic floor', () => {
    // --photo-control is 0.55 over an unknown image; worst case is again a white sky.
    expect(contrast('#ffffff', over('#ffffff', '#181410', 0.55))).toBeGreaterThanOrEqual(3)
  })
})

describe('tokens.css', () => {
  const css = readFileSync('src/styles/tokens.css', 'utf8').toLowerCase()

  /* The duplication guard. Every hex asserted above has to be the hex tokens.css actually
     ships, or these tests are grading a palette nobody is using. */
  it('ships every colour this file asserts', () => {
    const asserted = [
      BG, SURFACE, SUNKEN,
      ...Object.values(INK), INK_4,
      ACCENT, ACCENT_HOVER, ACCENT_WASH,
      OCHRE, TRAIL, TRAIL_NODE, FLORA,
    ]
    for (const hex of asserted) expect(css, hex).toContain(hex.toLowerCase())
  })

  it('uses the scrim end stop this file measured', () => {
    expect(css).toContain('0.72')
  })
})
