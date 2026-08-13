/**
 * The trail's geometry, verified against the CSS that draws it.
 *
 * This file exists because the meandering path has two properties that are invisible in the
 * source and obvious on the page when they break:
 *
 *   1. THE TILE MUST SEAM. The path is three full waves and a loop in a 30x396 box, repeated with
 *      `repeat-y`. Every tile restarts its dash pattern at phase zero, so unless the arc length is
 *      an exact whole multiple of the dash period, the dashes step sideways at every tile boundary.
 *      Nothing in the CSS states the arc length, so it is recomputed here from the control points.
 *
 *   2. THE TILE MUST BE SMOOTH WHERE IT MEETS ITSELF. The outgoing tangent at the top has to match
 *      the incoming tangent at the bottom, or there is a visible corner at every repeat. A
 *      symmetric-looking path can fail this and look perfectly fine in isolation.
 *
 *   3. THE LOOP MUST ACTUALLY BE A LOOP. Every other assertion here would still pass on a plain
 *      wave, so one of them checks that the path genuinely crosses itself.
 *
 * And one that is invisible in a different way: the stroke colour is baked into the data URI,
 * because an SVG inside a `url()` cannot see a custom property. So it can silently drift from
 * --trail forever.
 *
 * Everything is parsed out of the real stylesheets rather than restated, so these assertions
 * cannot pass while grading a path nobody is drawing.
 */

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { arcLength, cubicPoint, parseCubicPath, tangents } from '../scripts/path-math.js'

const trailCss = readFileSync('src/styles/trail.css', 'utf8')
const appCss = readFileSync('src/styles/app.css', 'utf8')
const tokensCss = readFileSync('src/styles/tokens.css', 'utf8')

/**
 * Pull the first `data:image/svg+xml,...` out of a rule and decode enough of it to inspect.
 *
 * The URIs encode `<` and `>` and `#`; single quotes are left literal so the value can sit inside
 * the CSS double quotes. Only those three need reversing to get parseable markup back.
 */
function extractSvg(css, selector) {
  const rule = new RegExp(`${selector}\\s*\\{([^}]*)\\}`).exec(css)
  expect(rule, `rule for ${selector}`).not.toBe(null)
  const uri = /url\("data:image\/svg\+xml,([^"]+)"\)/.exec(rule[1])
  expect(uri, `data URI in ${selector}`).not.toBe(null)
  return uri[1].replace(/%3C/g, '<').replace(/%3E/g, '>').replace(/%23/g, '#')
}

function attribute(svg, name) {
  const match = new RegExp(`${name}='([^']*)'`).exec(svg)
  expect(match, `${name} attribute`).not.toBe(null)
  return match[1]
}

/** `stroke-dasharray='3.1 6.09206'` -> { dash, gap, period }. */
function dashPattern(svg) {
  const [dash, gap] = attribute(svg, 'stroke-dasharray').split(/\s+/).map(Number)
  return { dash, gap, period: dash + gap }
}

describe('the path math itself', () => {
  it('measures a straight line exactly', () => {
    // A degenerate cubic whose control points are collinear and evenly spaced is a line of
    // length 30. If this is wrong, nothing below means anything.
    expect(arcLength([[[0, 0], [0, 10], [0, 20], [0, 30]]])).toBeCloseTo(30, 4)
  })

  it('measures a quarter circle to within sampling error', () => {
    // The standard cubic approximation of a quarter circle of radius 1: k = 4/3 * (sqrt(2) - 1).
    const k = (4 / 3) * (Math.SQRT2 - 1)
    const quarter = [[[1, 0], [1, k], [k, 1], [0, 1]]]
    expect(arcLength(quarter)).toBeCloseTo(Math.PI / 2, 3)
  })

  it('refuses a path command it does not actually support', () => {
    // A tolerant parser here would measure the wrong path and pass. See path-math.js.
    expect(() => parseCubicPath('M0 0 S 10 10 20 20')).toThrow(/unsupported path command/)
    expect(() => parseCubicPath('M0 0 c 1 1 2 2 3 3')).toThrow(/unsupported path command/)
    expect(() => parseCubicPath('M0 0')).toThrow(/no curve segments/)
  })
})

describe('the trail spine', () => {
  const svg = extractSvg(trailCss, '\\.trail::before')
  const segments = parseCubicPath(attribute(svg, 'd'))
  const pattern = dashPattern(svg)
  const length = arcLength(segments)

  it('is six half-waves and a four-arc loop', () => {
    expect(segments).toHaveLength(10)
  })

  /**
   * THE LOOP HAS TO BE A LOOP. Every other assertion in this file would still pass if somebody
   * flattened the figure back into a plain wave — the tangents would still match, the arc length
   * could be re-divided, the amplitude would still fit. So this one checks the thing that actually
   * makes it a loop: the path CROSSES ITSELF.
   *
   * Sample densely, then look for two samples that are far apart along the path and close together
   * in space. Far apart is what rules out neighbouring samples, which are trivially close.
   */
  it('crosses itself, which is what makes the loop a loop', () => {
    const PER_SEGMENT = 200
    const samples = []
    for (const segment of segments) {
      for (let i = 0; i < PER_SEGMENT; i += 1) samples.push(cubicPoint(segment, i / PER_SEGMENT))
    }

    // The CLOSEST such pair, not the first one under a threshold: near a true crossing there are
    // hundreds of pairs within any tolerance, and the first one encountered is an arbitrary member
    // of that cloud sitting up to a sample-step away from the crossing itself.
    let nearest = null
    for (let a = 0; a < samples.length; a += 1) {
      // A whole segment apart, so neighbouring samples — which are trivially close — cannot match.
      for (let b = a + PER_SEGMENT; b < samples.length; b += 1) {
        const distance = Math.hypot(samples[a][0] - samples[b][0], samples[a][1] - samples[b][1])
        if (distance < 0.4 && (!nearest || distance < nearest.distance)) {
          nearest = { distance, point: samples[a] }
        }
      }
    }

    expect(nearest, 'a self-intersection').not.toBe(null)

    // And it crosses ON THE MEAN LINE, where the waypoint discs sit: the loop is attached to the
    // path at a single point rather than bulging off to one side of it.
    const centre = Number(attribute(svg, 'width')) / 2
    expect(Math.abs(nearest.point[0] - centre)).toBeLessThan(0.5)
  })

  /**
   * THE ASSERTION THIS FILE IS FOR. 476.110017 / 9.155962 = 52 exactly. The tolerance is a
   * thousandth of a dash period, which is far below anything visible and far above the sampling
   * error in `arcLength`.
   */
  it('has an arc length that is a whole number of dash periods, so its tiles seam', () => {
    const periods = length / pattern.period
    expect(periods).toBeCloseTo(Math.round(periods), 3)
    expect(Math.round(periods)).toBe(52)
  })

  it('is smooth where it meets its own repeat', () => {
    const first = tangents(segments[0])
    const last = tangents(segments[segments.length - 1])
    // Leaving the top of the tile and arriving at the bottom must be the same direction.
    expect(first.start[0]).toBeCloseTo(last.end[0], 6)
    expect(first.start[1]).toBeCloseTo(last.end[1], 6)
  })

  it('is smooth at its own midpoint, where the wave changes side', () => {
    const incoming = tangents(segments[0]).end
    const outgoing = tangents(segments[1]).start
    expect(incoming[0]).toBeCloseTo(outgoing[0], 6)
    expect(incoming[1]).toBeCloseTo(outgoing[1], 6)
  })

  it('starts and ends on the mean line, so every disc sits on the path', () => {
    const [start] = segments[0]
    const end = segments[segments.length - 1][3]
    const centre = Number(attribute(svg, 'width')) / 2
    expect(start[0]).toBeCloseTo(centre, 6)
    expect(end[0]).toBeCloseTo(centre, 6)
    expect(start[1]).toBe(0)
    expect(end[1]).toBeCloseTo(Number(attribute(svg, 'height')), 6)
  })

  /**
   * The figure must stay inside a waypoint disc's radius. This is what makes a curving, looping path
   * free: the disc is --trail-node-size wide and centred on the mean line, so as long as the ink
   * stays inside its radius, the path never widens the trail's footprint and never costs the text
   * column a pixel. --trail-node-size floors at 28px, so the radius floors at 14.
   *
   * MEASURED ON THE CURVE, NOT THE CONTROL HULL. An earlier version took the max over control
   * points, which is a valid bound and a bad one: the loop's control points reach 15.07 from the
   * centre while the drawn curve reaches 13.855, so it failed a figure that fits. A control hull
   * over-estimates by an amount that depends on the curvature, which for an ellipse arc is a lot.
   */
  const sampled = segments.flatMap((segment) =>
    Array.from({ length: 501 }, (_, i) => cubicPoint(segment, i / 500)),
  )

  it('swings less far than the smallest waypoint disc\'s radius', () => {
    const centre = Number(attribute(svg, 'width')) / 2
    const reach = Math.max(...sampled.map(([x]) => Math.abs(x - centre)))
    const smallestNode = Number(/--trail-node-size:\s*clamp\((\d+)px/.exec(tokensCss)[1])
    expect(reach).toBeLessThan(smallestNode / 2)
    // And it is actually a meander rather than a twitch — the whole point of the change.
    expect(reach).toBeGreaterThan(6)
  })

  /**
   * And the ink has to fit the tile it is drawn in, stroke included — half the stroke width hangs
   * outside the path on each side, and anything past the viewBox is CLIPPED rather than overflowing.
   * The loop is the part that gets close: it reaches 28.855 in a 30-wide box, so with a 1.5 stroke
   * there is 0.395 to spare.
   */
  it('fits inside its own tile, stroke and all', () => {
    const width = Number(attribute(svg, 'width'))
    const half = Number(attribute(svg, 'stroke-width')) / 2
    const xs = sampled.map(([x]) => x)
    expect(Math.min(...xs) - half).toBeGreaterThan(0)
    expect(Math.max(...xs) + half).toBeLessThan(width)
  })

  it('declares the same intrinsic size as the tokens that lay it out', () => {
    expect(`${attribute(svg, 'width')}px`).toBe(/--trail-tile-w:\s*([\d.]+px)/.exec(tokensCss)[1])
    expect(`${attribute(svg, 'height')}px`).toBe(/--trail-tile-h:\s*([\d.]+px)/.exec(tokensCss)[1])
  })

  it('tiles vertically at its natural size, never stretched', () => {
    const rule = /\.trail::before\s*\{([^}]*)\}/.exec(trailCss)[1]
    expect(rule).toContain('background-repeat: repeat-y')
    expect(rule).toContain('background-size: var(--trail-tile-w) var(--trail-tile-h)')
    // Anchored at the top so the wave's phase does not shift as the page's length changes.
    expect(rule).toContain('background-position: top center')
  })

  it('draws in the token colour, which it cannot inherit', () => {
    const trail = /--trail:\s*(#[0-9a-fA-F]{6})/.exec(tokensCss)[1]
    expect(attribute(svg, 'stroke').toLowerCase()).toBe(trail.toLowerCase())
    expect(attribute(svg, 'stroke-width')).toBe(
      /--trail-weight:\s*([\d.]+)px/.exec(tokensCss)[1],
    )
  })
})

describe("the hero's rule", () => {
  const svg = extractSvg(appCss, '\\.hero__rule')
  const segments = parseCubicPath(attribute(svg, 'd'))
  const pattern = dashPattern(svg)
  const length = arcLength(segments)

  it('is the same drawing turned on its side: one full wave, two half-waves', () => {
    expect(segments).toHaveLength(2)
  })

  /**
   * Not tiled, so it is free of the whole-multiple constraint — but only in one direction. The
   * pattern still has to END ON A DASH rather than in the middle of a gap, or the rule looks like
   * it was cropped. length = k * period + dash, for a whole k.
   */
  it('ends on a dash rather than mid-gap', () => {
    const k = (length - pattern.dash) / pattern.period
    expect(k).toBeCloseTo(Math.round(k), 3)
    expect(Math.round(k)).toBe(8)
  })

  it('is not tiled, since one wave is the whole flourish', () => {
    const rule = /\.hero__rule\s*\{([^}]*)\}/.exec(appCss)[1]
    expect(rule).toContain('background-repeat: no-repeat')
  })

  /**
   * The two curves have to read as one hand. Matching the amplitude-to-wavelength ratio is what
   * does that — the hero's rule is a sixth of the size, so equal amplitudes would have made it a
   * far sharper wave than the spine at the same glance.
   */
  it('curves at the same ratio as the spine, at a sixth of the size', () => {
    /**
     * ONE FULL WAVE ONLY — the first two segments of each path.
     *
     * It is tempting to measure the whole path, and that was right until the spine grew a loop:
     * its tile is now 396 tall and holds three waves plus the loop, so the tile's height stopped
     * being a wavelength and the loop's reach stopped being the wave's amplitude. Two segments is
     * exactly one full wave in both paths, which is the shape a reader is comparing.
     */
    function ratio(pathSegments, axis) {
      const wave = pathSegments.slice(0, 2).flat()
      const values = wave.map((point) => point[axis])
      const mean = (Math.max(...values) + Math.min(...values)) / 2
      const amplitude = Math.max(...values.map((value) => Math.abs(value - mean)))
      const wavelength = Math.max(...wave.map((point) => point[1 - axis]))
      return amplitude / wavelength
    }
    const spine = parseCubicPath(attribute(extractSvg(trailCss, '\\.trail::before'), 'd'))
    // The spine waves in x over y; the rule waves in y over x.
    expect(ratio(segments, 1)).toBeCloseTo(ratio(spine, 0), 2)
  })

  it('shares the spine\'s dash rhythm closely enough to look deliberate', () => {
    const spineSvg = extractSvg(trailCss, '\\.trail::before')
    const spine = dashPattern(spineSvg)
    // Within half a pixel of period. They cannot be equal — each is derived from its own arc
    // length — but a reader should not be able to tell them apart.
    expect(Math.abs(pattern.period - spine.period)).toBeLessThan(0.5)
  })

  it('draws in the token colour', () => {
    const trail = /--trail:\s*(#[0-9a-fA-F]{6})/.exec(tokensCss)[1]
    expect(attribute(svg, 'stroke').toLowerCase()).toBe(trail.toLowerCase())
  })

  it('is redrawn in white over a photograph, where the brown has no measured contrast', () => {
    const overPhoto = extractSvg(appCss, '\\.hero--photo \\.hero__rule')
    expect(attribute(overPhoto, 'stroke').toLowerCase()).toBe('#ffffff')
    // Same path and same rhythm — only the stroke may differ, or the two heroes stop matching.
    expect(attribute(overPhoto, 'd')).toBe(attribute(svg, 'd'))
    expect(attribute(overPhoto, 'stroke-dasharray')).toBe(attribute(svg, 'stroke-dasharray'))
  })
})

describe('the retired dash tokens', () => {
  /**
   * --trail-dash and --trail-gap described a rhythm that is now derived per curve and lives inside
   * the two data URIs. Reintroducing them would invite somebody to "unify" two numbers that are
   * each pinned by their own arc length.
   */
  it('are gone from every stylesheet', () => {
    for (const [name, css] of Object.entries({ trail: trailCss, app: appCss, tokens: tokensCss })) {
      // Strip comments first: tokens.css explains at length why these no longer exist, and a raw
      // search would match that prose and pass whatever the rules do.
      const code = css.replace(/\/\*[\s\S]*?\*\//g, '')
      expect(code, `${name}.css`).not.toMatch(/var\(--trail-dash\)|var\(--trail-gap\)/)
      expect(code, `${name}.css`).not.toMatch(/--trail-dash:|--trail-gap:/)
    }
  })
})
