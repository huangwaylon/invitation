/**
 * Scroll reveal for the waypoints.
 *
 * OPT-IN, and the direction is the whole design. `revealEnabled()` is false unless
 * IntersectionObserver exists and the reader has not asked for reduced motion, and when it
 * is false every waypoint reports itself visible immediately. The CSS that hides an
 * unrevealed waypoint is scoped to `[data-reveal="on"]`, which `App.jsx` writes only when
 * this function agrees — so no JavaScript, an old engine, reduced motion, or a test
 * rendering to static markup all give the same result: a fully visible invitation.
 *
 * Doing it the other way round — hidden in CSS by default, revealed by script — is how a
 * page ends up blank because one bundle failed to parse.
 */

import { useEffect, useRef, useState } from 'react'

export function revealEnabled() {
  if (typeof window === 'undefined') return false
  if (!('IntersectionObserver' in window)) return false
  // `matchMedia` is optional-chained because jsdom-less test environments do not have it.
  return !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

/**
 * @param {object} [options]
 * @param {boolean} [options.initiallyVisible] skip the reveal for this element entirely.
 *   Used for the first two waypoints: the observer's first callback lands after the first
 *   paint, so anything already on screen at load would flash from transparent to opaque for
 *   one frame. Starting the above-the-fold waypoints visible costs nothing — nobody
 *   scrolled to them, so there was no reveal to see.
 */
export function useReveal({ initiallyVisible = false } = {}) {
  const ref = useRef(null)
  /**
   * Decided DURING RENDER, not in the effect below, and that is the point: when the reveal is
   * off — no browser, no IntersectionObserver, reduced motion — a waypoint's very first render
   * is already visible. Leaving it to the effect worked, because the CSS that hides an
   * unrevealed waypoint is gated on an attribute that is also absent in exactly those cases,
   * but it meant the component's own output claimed "hidden" while the page showed it. Two
   * things agreeing by luck is a thing that stops agreeing.
   *
   * It also saves a render pass per waypoint for reduced-motion readers, and removes the one
   * frame of transparency they would otherwise get.
   */
  const [visible, setVisible] = useState(() => initiallyVisible || !revealEnabled())

  useEffect(() => {
    if (visible) return undefined
    const node = ref.current
    if (!node) {
      setVisible(true)
      return undefined
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          setVisible(true)
          // One-shot: a waypoint that has been seen stays visible. Re-hiding it on the way
          // back up would make scrolling upwards through the page flicker.
          observer.disconnect()
        }
      },
      // Fire a little before the element's top edge reaches the bottom of the screen, so
      // the rise finishes as it arrives rather than starting once it is already in view.
      { rootMargin: '0px 0px -12% 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [visible])

  return [ref, visible]
}
