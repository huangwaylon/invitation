/**
 * The drawn trail: one continuous curve through every waypoint disc, generated from their measured
 * positions.
 *
 * IT HAS TO BE MEASURED, because the thing the path has to fit — how far apart the waypoints are — is
 * decided by text that wraps differently in three languages, by photographs that change the page's
 * height when they land, and by `<details>` rows the reader opens. None of that is known at build
 * time, which is why the previous version was a tiled background and why it repeated.
 *
 * `useLayoutEffect` RATHER THAN `useEffect`, and that is the difference between a correct path and a
 * visible flicker: a layout effect runs after the DOM is in place but BEFORE the browser paints, so
 * the estimated path the first render produces is never actually shown. With `useEffect` the reader
 * would see the estimate for one frame and then watch it snap.
 *
 * The whole thing is `aria-hidden` decoration. A reader who never sees it gets the same headings in
 * the same order — see the note about the trail's colours in tokens.css.
 */

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { estimatedStops, trailPath } from '../lib/trailPath.js'

/**
 * React warns that `useLayoutEffect` does nothing on the server, and `renderToStaticMarkup` is
 * exactly that — so the render tests would print a warning per run. The measurement is meaningless
 * without layout anyway, so outside a browser it becomes the effect that never fires.
 */
const useMeasurement = typeof window === 'undefined' ? useEffect : useLayoutEffect

/** Half a pixel is finer than a dashed 1.5px stroke can show, so anything closer is the same drawing. */
function sameGeometry(a, b) {
  if (!a || !b) return false
  const close = (x, y) => Math.abs(x - y) < 0.5
  return (
    close(a.width, b.width) &&
    close(a.height, b.height) &&
    close(a.meanX, b.meanX) &&
    a.stops.length === b.stops.length &&
    a.stops.every((stop, index) => close(stop, b.stops[index]))
  )
}

export default function TrailPath({ stopCount }) {
  const ref = useRef(null)
  const [measured, setMeasured] = useState(null)

  useMeasurement(() => {
    const drawing = ref.current
    const trail = drawing?.parentElement
    if (!drawing || !trail || typeof ResizeObserver === 'undefined') return undefined

    function measure() {
      const own = drawing.getBoundingClientRect()
      const marks = trail.querySelectorAll('[data-trail-stop]')
      // A zero-width box means the element is not laid out yet; a path built from it would be junk.
      if (!own.width || !marks.length) return

      const stops = []
      let meanX = own.width / 2
      for (const mark of marks) {
        const rect = mark.getBoundingClientRect()
        stops.push(rect.top + rect.height / 2 - own.top)
        /* Every disc shares one x, so reading it from the last mark is the same as reading it from
           any of them — and taking it from the DOM rather than from a custom property means the
           curve cannot drift from the discs it is supposed to thread. */
        meanX = rect.left + rect.width / 2 - own.left
      }

      /* Ignore a measurement that has not meaningfully moved. A ResizeObserver fires on every frame
         of a drag-resize, and without this each one rebuilds a hundred-segment path string and
         re-renders for a change of a tenth of a pixel. Rounding to a half-pixel is finer than anything
         a dashed 1.5px stroke can show. */
      const next = { width: own.width, height: own.height, meanX, stops }
      setMeasured((previous) => (sameGeometry(previous, next) ? previous : next))
    }

    measure()

    /* Observing the TRAIL, not the marks. Anything that moves a waypoint also changes the trail's
       height — a language switch, an image landing, a FAQ row opening, a window resize — so one
       observer on the container catches every case, and observing ten nodes as well would only mean
       ten callbacks for one reflow. */
    const observer = new ResizeObserver(measure)
    observer.observe(trail)
    return () => observer.disconnect()
  }, [stopCount])

  /**
   * Before measurement — and in any environment with no layout at all — fall back to evenly spaced
   * guesses so the markup is never missing its path. See `estimatedStops`.
   */
  const geometry = useMemo(() => {
    if (measured) return measured
    const stops = estimatedStops(stopCount)
    return { width: 64, height: stops[stops.length - 1], meanX: 40, stops }
  }, [measured, stopCount])

  const d = useMemo(
    () => trailPath({ stops: geometry.stops, width: geometry.width, meanX: geometry.meanX }),
    [geometry],
  )

  return (
    <div className="trail__drawing" ref={ref} aria-hidden="true">
      <svg
        /* The wrapper is aria-hidden already, so this is redundant to a screen reader and kept
           anyway: it makes "every <svg> on the page is hidden" an exact assertion the render test can
           make, rather than one it has to reason about ancestors to check. */
        aria-hidden="true"
        focusable="false"
        width={geometry.width}
        height={geometry.height}
        viewBox={`0 0 ${geometry.width} ${geometry.height}`}
        fill="none"
        /* currentColor, which is the one thing the old background-image could not do: the colour now
           comes from `--trail` through CSS instead of being frozen into a data URI. */
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        /**
         * A round 3.4/6, and it can be round now. While the path was tiled, the dash period had to
         * divide the tile's arc length exactly or the dashes stepped sideways at every seam. One
         * continuous path has no seams, so the rhythm is a free choice again.
         */
        strokeDasharray="3.4 6"
      >
        <path d={d} />
      </svg>
    </div>
  )
}
