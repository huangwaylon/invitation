/**
 * The trail's path, generated as one continuous curve through the waypoints.
 *
 * WHY THIS EXISTS AT ALL — the three things a tiled background could not do:
 *
 *   1. NOT REPEAT. A tiled SVG repeats by definition. Every loop was identical and evenly spaced,
 *      which reads as wallpaper rather than as a route somebody drew.
 *   2. HOLD A ROUND LOOP. A tile has to fit the narrowest column the page ever has, so the loop was
 *      squeezed into an oval barely wider than a waypoint disc. One path for the whole trail can use
 *      the page's left padding, which is dead space no text may enter, so a loop can be circular.
 *   3. PASS THROUGH THE WAYPOINTS. A tile knows nothing about where the discs are, so the path met
 *      them by luck. Here every disc is a knot the curve is guaranteed to pass through, which is
 *      what makes it read as a route visiting places rather than a decoration behind them.
 *
 * IT IS A CATMULL-ROM SPLINE, and that choice is what satisfies "no sharp points" structurally
 * rather than by taste: the curve is C1 continuous at every knot by construction, so there is no
 * corner anywhere for a tangent mismatch to produce. Hand-authoring cubics — which is what the tile
 * was — makes every junction a place to get that wrong.
 *
 * PURE, AND NODE-SAFE. No DOM, no randomness beyond its own seeded generator, so `test/trail.test.js`
 * can assert the geometry directly instead of parsing shapes out of a stylesheet.
 */

/**
 * mulberry32: a small, fast, well-distributed 32-bit PRNG.
 *
 * `Math.random()` is unusable here — the path has to be identical on every render, or it would
 * redraw itself differently every time a `<details>` row opened.
 */
function mulberry32(seed) {
  let state = seed >>> 0
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Mix two integers into a well-scattered seed.
 *
 * NOT `seed + span * 7919`, WHICH IS WHAT THIS REPLACES AND WHY IT MATTERS. mulberry32 advances its
 * state by a fixed constant and then hashes, so two seeds a fixed stride apart produce correlated
 * FIRST outputs — and every early draw here is a decision. The symptom was not subtle: across a whole
 * page, all four loops came out on the same side of the path and within 3px of the same size, which is
 * the exact repetition this generator exists to avoid, arrived at by a different route.
 *
 * This is the splitmix32 finaliser applied to both inputs, which avalanches: one bit of difference in
 * `span` changes about half the bits of the result.
 */
function hashSeed(seed, span) {
  let h = (seed ^ 0x9e3779b9) >>> 0
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b) >>> 0
  h = (h + Math.imul(span + 1, 0xc2b2ae35)) >>> 0
  h = Math.imul(h ^ (h >>> 13), 0x27d4eb2f) >>> 0
  return (h ^ (h >>> 16)) >>> 0
}

/** A number in [min, max) from a generator. */
function between(random, min, max) {
  return min + random() * (max - min)
}

/**
 * Knots around a loop, entered travelling down the mean line at `y`.
 *
 * THE LOOP IS A CIRCLE OFFSET SIDEWAYS FROM THE PATH, traversed once. Six knots at 60° is what makes
 * a Catmull-Rom spline through them read as a circle rather than a hexagon — at four the flats are
 * visible, and past eight nothing improves.
 *
 * The exit is nudged a couple of pixels further down the mean line rather than landing exactly on the
 * entry. Two reasons, and both matter: two identical consecutive knots give the spline a zero-length
 * tangent and a cusp — the one way this construction can produce the sharp point it is meant to avoid
 * — and a real hand-drawn loop does not close on itself perfectly either.
 */
function loopKnots(meanX, y, radius, side, exitDrop) {
  const centre = { x: meanX + side * radius, y }
  // Angle of the entry point as seen from the centre: due left of it for a right-hand loop.
  const entry = side > 0 ? Math.PI : 0
  // Travelling downwards means increasing angle for a left-hand loop and decreasing for a right one.
  const direction = -side
  const knots = []
  for (let step = 1; step < 6; step += 1) {
    const angle = entry + direction * step * (Math.PI / 3)
    knots.push({ x: centre.x + radius * Math.cos(angle), y: centre.y + radius * Math.sin(angle) })
  }
  knots.push({ x: meanX, y: y + exitDrop })
  return knots
}

/**
 * Every knot the curve passes through, from the first waypoint to the last.
 *
 * @param {object} options
 * @param {number[]} options.stops y of each waypoint disc's centre, and finally the summit mark's.
 *   The curve is guaranteed to pass through `meanX` at each one.
 * @param {number} options.width the drawing box's width. The curve stays inside it, stroke included.
 * @param {number} options.meanX x of the disc centres within that box.
 * @param {number} options.inset kept clear at each edge. Half the stroke width plus a hair, because
 *   an SVG CLIPS at its viewBox rather than overflowing — a curve that touches x=0 loses the outer
 *   half of its stroke, and looks like it has been shaved rather than like a mistake.
 * @param {number} options.seed
 */
export function trailKnots({ stops, width, meanX, inset = 1.5, seed = 20271008 }) {
  if (!Array.isArray(stops) || stops.length < 2) return []

  const leftReach = Math.max(0, meanX - inset)
  const rightReach = Math.max(0, width - meanX - inset)

  const knots = [{ x: meanX, y: stops[0] }]
  let side = -1
  /**
   * Carried ACROSS spans, and the reason is that per-span randomness alone is not enough to look
   * varied. The side is weighted toward whichever has more room, so a page of six loops legitimately
   * comes out all on one side about one time in fifteen — and on the two pages where it did, the
   * result was six near-identical loops down the left, which is exactly the uniformity the whole
   * generator exists to avoid. Probability that is right on average can still be wrong on the one page
   * somebody actually looks at.
   *
   * So consecutive loops are pushed apart deliberately: mostly-but-not-always alternating in side, and
   * never twice the same size. Since the two sides have very different room — the left about twice the
   * right — alternating the side varies the size for free.
   */
  let lastLoopSide = 0
  let lastLoopScale = -1

  for (let span = 0; span < stops.length - 1; span += 1) {
    const top = stops[span]
    const bottom = stops[span + 1]
    const gap = bottom - top
    if (gap <= 0) continue

    /**
     * SEEDED PER SPAN, not once for the whole path. With a single stream, a change anywhere — a
     * language switch, a FAQ row opening, a photograph landing — shifts every later draw and the
     * entire trail redraws itself differently. Per span, only the spans whose own gap changed can
     * change shape, and the seed does not depend on the gap, so most of them do not change at all.
     */
    const random = mulberry32(hashSeed(seed, span))

    // One swing per ~110px, so a long span meanders more than a short one rather than harder.
    const swings = Math.max(1, Math.round(gap / between(random, 95, 135)))
    const swingHeight = gap / swings

    /**
     * WHICH SIDES A LOOP MAY GO ON IS DECIDED BY ROOM, NOT BY TASTE.
     *
     * A loop is a circle offset from the mean line by its own radius and reaching a further radius
     * beyond that, so it needs 2r of clear width — capping the radius at the reach instead let an
     * early version draw to x=65 in a 49-wide box and get shaved flat by the viewBox. So the usable
     * radius on a side is HALF its reach.
     *
     * `MIN_LOOP` is the radius below which a loop stops reading as a loop and starts reading as a knot
     * in the string. It is measured by looking at one, and it is the reason the trail gutter had to
     * give up the plants that used to live in it: at the old width the right-hand side could only hold
     * a radius of 7 and every loop on it came out pinched.
     *
     * IT IS ALSO WHAT GIVES THE NARROW SIDE A RANGE TO VARY IN, which is a second job and the reason it
     * is 9 rather than 11. The right side's room here is 11.85, so at a floor of 11 every right-hand
     * loop came out within half a pixel of the same size — three identical loops in a row on the page,
     * which is the uniformity this generator exists to avoid showing up in yet another place.
     */
    const MIN_LOOP = 9
    const roomOn = (candidate) => Math.min((candidate < 0 ? leftReach : rightReach) / 2, swingHeight * 0.42)
    const sides = [-1, 1].filter((candidate) => roomOn(candidate) >= MIN_LOOP)

    /* Somewhere that is not the very start or end of a span — a loop right against a waypoint disc
       reads as a mistake in the disc. Roughly two spans in three get one. */
    const canLoop = swings >= 2 && swingHeight > 70 && sides.length > 0
    const loopAfter = canLoop && random() < 0.7 ? 1 + Math.floor(random() * (swings - 1)) : -1
    /**
     * Side AND size both vary, and between them that is most of what stops a page of loops looking
     * stamped. Both are drawn even when there is no loop, so the stream stays aligned whatever the
     * span's length turns out to be.
     *
     * THE SIDE IS WEIGHTED BY ROOM rather than being a coin toss: on this page the left has the page's
     * padding behind it and roughly twice the reach of the right, so a straight 50/50 sends half the
     * loops to the side that can only hold a small one. Weighting means the big loops — the ones that
     * actually read as loops — are the common case, and the small ones are the variety.
     */
    /* Weighted by room, then overridden three times in four to be the other side from the last loop.
       The weighting still decides the long-run mix; the override is what stops a run. */
    const weights = sides.map((candidate) => roomOn(candidate))
    const total = weights.reduce((sum, weight) => sum + weight, 0)
    let pick = random() * total
    let drawnSide = sides[0] ?? -1
    for (let i = 0; i < sides.length; i += 1) {
      if (pick < weights[i]) {
        drawnSide = sides[i]
        break
      }
      pick -= weights[i]
    }
    /* 0.6, not 0.78. The two sides hold very different loops — about 40px across on the left against
       20 on the right — so a strong switch bias makes the sequence half-and-half and the median loop
       comes out small. At 0.6 the room-weighting still shows through, so the big ones are the more
       common, and runs of the same side are still broken up. */
    const switching = random() < 0.6
    if (switching && sides.length > 1 && drawnSide === lastLoopSide) {
      drawnSide = sides.find((candidate) => candidate !== lastLoopSide) ?? drawnSide
    }

    /**
     * Where in the available range this loop sits, as a fraction. Biased toward the large end — an
     * unbiased draw put the median at the bottom of the range and the page read as a row of little
     * curls — and then pushed at least a quarter of the range away from the previous loop's fraction,
     * so no two in a row are the same size even when they land on the same side.
     */
    let scale = random() ** 0.62
    for (let attempt = 0; attempt < 3 && Math.abs(scale - lastLoopScale) < 0.25; attempt += 1) {
      scale = random() ** 0.62
    }
    const room = Math.max(MIN_LOOP, roomOn(drawnSide))
    const drawnRadius = MIN_LOOP + (room - MIN_LOOP) * scale
    const loopSide = drawnSide
    const loopRadius = loopAfter > 0 ? drawnRadius : 0

    for (let swing = 0; swing < swings; swing += 1) {
      const reach = side < 0 ? leftReach : rightReach
      /**
       * A FRACTION OF THE REACH, AND DELIBERATELY NOT ALL OF IT — this is the balance between the two
       * gestures on the path.
       *
       * The waves and the loops compete for the same width, but they do not read at the same scale: a
       * crest at the full reach is a sweep spread over 200px of height, while a loop at the full reach
       * is a circle of that diameter. At 0.62–1.0 the sweeps dominated and the loops read as small
       * ornaments hung off a big meander.
       *
       * A loop cannot simply be made bigger to match — it needs 2r of width, so its radius is already
       * capped at half the reach. So the waves give way instead. At 0.42–0.68 a full peak-to-peak
       * excursion is about the same size as a typical loop's diameter, which is what makes the two
       * read as one hand rather than as decoration on a wave.
       *
       * The range stays wide because a constant amplitude is the other way a path looks machine-made.
       */
      const amplitude = reach * between(random, 0.42, 0.68)
      knots.push({
        x: meanX + side * amplitude,
        // Not exactly mid-swing — a crest that always lands halfway is a regular wave.
        y: top + swingHeight * (swing + between(random, 0.4, 0.6)),
      })

      const crossing = top + swingHeight * (swing + 1)

      if (swing + 1 === loopAfter && loopRadius > 0) {
        knots.push(...loopKnots(meanX, crossing, loopRadius, loopSide, between(random, 2.5, 4.5)))
        lastLoopSide = loopSide
        lastLoopScale = scale
      } else if (swing + 1 < swings) {
        knots.push({ x: meanX, y: crossing })
      }

      side = -side
    }

    knots.push({ x: meanX, y: bottom })
  }

  return knots
}

/**
 * CENTRIPETAL Catmull-Rom through the knots, emitted as cubic Béziers.
 *
 * THE `centripetal` IS THE WHOLE POINT, and the uniform form this replaced is why the first version
 * of the loops had visible cusps in them. Uniform Catmull-Rom is parameterised by knot INDEX, so it
 * assumes every knot is equally far from the last — and a loop is six knots packed a few pixels apart
 * sitting between swing crests a hundred pixels apart. Given that, the uniform form overshoots
 * violently at the join and produces exactly the sharp corner this curve is supposed to be incapable
 * of.
 *
 * Centripetal parameterisation (α = 1/2) spaces the knots by the square root of the distance between
 * them, and Yuksel et al. proved it cannot produce a cusp or a self-intersection WITHIN a segment —
 * which is the guarantee that makes "no sharp points" a property of the construction rather than
 * something to check by eye. The loops still cross each other, because that happens BETWEEN segments
 * and is the entire idea.
 *
 * Endpoints duplicate their neighbour so the first and last segments have a tangent to work from.
 */
export function knotsToPath(knots, precision = 2) {
  if (knots.length < 2) return ''
  const round = (value) => Number(value.toFixed(precision))
  const at = (index) => knots[Math.max(0, Math.min(knots.length - 1, index))]

  /** |b - a| ^ 0.5, floored so two coincident knots cannot divide by zero. */
  const span = (a, b) => Math.max(Math.hypot(b.x - a.x, b.y - a.y) ** 0.5, 1e-4)

  let d = `M${round(knots[0].x)} ${round(knots[0].y)}`
  for (let i = 0; i < knots.length - 1; i += 1) {
    const p0 = at(i - 1)
    const p1 = at(i)
    const p2 = at(i + 1)
    const p3 = at(i + 2)

    const d1 = span(p0, p1)
    const d2 = span(p1, p2)
    const d3 = span(p2, p3)

    /* The standard non-uniform Catmull-Rom tangents, per axis. `m1` is the tangent at p1 and `m2` at
       p2, both already scaled to this segment's parameter length, so the Bézier handles are m/3. */
    const tangent = (axis) => {
      const a0 = p0[axis]
      const a1 = p1[axis]
      const a2 = p2[axis]
      const a3 = p3[axis]
      const m1 = d2 * ((a1 - a0) / d1 - (a2 - a0) / (d1 + d2) + (a2 - a1) / d2)
      const m2 = d2 * ((a2 - a1) / d2 - (a3 - a1) / (d2 + d3) + (a3 - a2) / d3)
      return [m1, m2]
    }

    const [mx1, mx2] = tangent('x')
    const [my1, my2] = tangent('y')

    const c1 = { x: p1.x + mx1 / 3, y: p1.y + my1 / 3 }
    const c2 = { x: p2.x - mx2 / 3, y: p2.y - my2 / 3 }
    d += `C${round(c1.x)} ${round(c1.y)} ${round(c2.x)} ${round(c2.y)} ${round(p2.x)} ${round(p2.y)}`
  }
  return d
}

/** The whole job: geometry in, one `d` attribute out. */
export function trailPath(options) {
  return knotsToPath(trailKnots(options))
}

/**
 * Waypoint positions to use before the real ones have been measured, and in any environment with no
 * layout at all — a test rendering to static markup, most obviously.
 *
 * They are a GUESS AND THEY ARE MEANT TO BE: `TrailPath` measures for real in a layout effect, which
 * runs before the browser paints, so these are never actually seen in a browser. What they buy is
 * that the markup is never missing its path, so nothing downstream has to cope with a trail that
 * exists only after JavaScript has run.
 */
export function estimatedStops(count, spacing = 430) {
  return Array.from({ length: Math.max(2, count + 1) }, (_, index) => index * spacing)
}
