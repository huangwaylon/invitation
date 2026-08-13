/**
 * Cubic Bézier arc length, and just enough SVG path parsing to measure the trail.
 *
 * IT EXISTS FOR ONE ASSERTION, and that assertion is the reason the trail looks continuous.
 * The meandering path in `trail.css` is a TILE — one full wave in a 28x132 box, repeated
 * vertically with `background-repeat: repeat-y`. Tiling keeps the curve and the dashes at their
 * natural size at any page length, which is what a stretched single SVG could never do. But
 * every tile restarts its own dash pattern at phase zero, so unless the path's ARC LENGTH is an
 * exact whole multiple of the dash period, the dashes jump sideways at every tile boundary —
 * about eight visible seams down the page, each one looking like a rendering fault.
 *
 * Arc length is not something you can read off a path, so `test/trail.test.js` computes it from
 * the CSS itself. Change the amplitude, the tile height or a control point and that test tells
 * you the new dasharray is wrong.
 *
 * Node-only, and imported by the test rather than the app.
 */

/** A point on a cubic Bézier at t, by the explicit Bernstein form. */
export function cubicPoint([p0, p1, p2, p3], t) {
  const m = 1 - t
  const a = m * m * m
  const b = 3 * m * m * t
  const c = 3 * m * t * t
  const d = t * t * t
  return [
    a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0],
    a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1],
  ]
}

/**
 * Arc length by dense polyline sampling.
 *
 * 20,000 samples per segment rather than an adaptive or analytic method: the answer only has to
 * be good to about four decimal places (a tenth of a percent of one dash), sampling error here
 * is well below that, and a closed-form cubic arc length does not exist — every "exact" method is
 * also a numerical approximation, just a cleverer one. Straight-line summation always
 * UNDERestimates, monotonically, which is the failure direction you want: it cannot report a
 * seam as clean when it is not.
 */
export function arcLength(segments, samples = 20000) {
  let total = 0
  for (const segment of segments) {
    let previous = cubicPoint(segment, 0)
    for (let i = 1; i <= samples; i += 1) {
      const point = cubicPoint(segment, i / samples)
      total += Math.hypot(point[0] - previous[0], point[1] - previous[1])
      previous = point
    }
  }
  return total
}

/**
 * Parse an `M` followed by one or more absolute `C` commands into cubic segments.
 *
 * DELIBERATELY REFUSES EVERYTHING ELSE. It would be easy to write a tolerant parser that
 * silently ignores an `S`, a `Q` or a lowercase relative command — and then the arc-length test
 * would measure a path that is not the one being drawn and pass. Throwing means a future edit
 * that reaches for a shorthand curve command fails loudly and gets this parser extended.
 */
export function parseCubicPath(d) {
  const tokens = String(d).trim().match(/[A-Za-z]|-?\d*\.?\d+/g) ?? []
  const segments = []
  let cursor = null
  let index = 0

  function number(command) {
    const token = tokens[index]
    index += 1
    if (token == null || !/^-?\d*\.?\d+$/.test(token)) {
      throw new Error(`${command}: expected a number, got ${JSON.stringify(token)}`)
    }
    return Number(token)
  }

  while (index < tokens.length) {
    const command = tokens[index]
    index += 1
    if (command === 'M') {
      cursor = [number('M'), number('M')]
    } else if (command === 'C') {
      if (!cursor) throw new Error('C before any M')
      const c1 = [number('C'), number('C')]
      const c2 = [number('C'), number('C')]
      const end = [number('C'), number('C')]
      segments.push([cursor, c1, c2, end])
      cursor = end
    } else {
      throw new Error(
        `unsupported path command ${JSON.stringify(command)} — this parser handles absolute M and C only, on purpose (see the header)`,
      )
    }
  }

  if (!segments.length) throw new Error('no curve segments found')
  return segments
}

/**
 * The outgoing tangent direction at a segment's start and the incoming one at its end, each
 * normalised.
 *
 * Used to assert the tile is smooth where it meets its own repeat. A tile whose start and end
 * tangents differ puts a visible corner at every boundary, and because the tile is symmetric it
 * is the kind of thing that looks fine in isolation and wrong only once repeated.
 */
export function tangents([p0, p1, p2, p3]) {
  const unit = ([x, y]) => {
    const length = Math.hypot(x, y)
    return [x / length, y / length]
  }
  return {
    start: unit([p1[0] - p0[0], p1[1] - p0[1]]),
    end: unit([p3[0] - p2[0], p3[1] - p2[1]]),
  }
}
