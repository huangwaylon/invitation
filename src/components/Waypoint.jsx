/**
 * One waypoint on the trail: the disc with its glyph, the heading, the section's content,
 * and a plant.
 *
 * A `<section>` with `aria-labelledby` pointing at its own `<h2>`, which is what makes each
 * one a navigable landmark — on a page this long, a screen reader user should be able to
 * jump between "Where" and "Getting there" without arrowing through the schedule.
 *
 * The glyph and the plant are both `aria-hidden` and neither is ever the only label: the
 * heading beside them carries the meaning, and `Glyph` renders nothing at all for a name it
 * does not recognise rather than substituting a wrong picture.
 */

import { FLORA, Glyph } from './icons.jsx'
import { useReveal } from '../lib/useReveal.js'

/**
 * @param {object} props
 * @param {string} props.id anchors the section and its heading. Also the skip-link target
 *   for the first one.
 * @param {number} props.index position on the trail, from 0. Chooses the plant, and the
 *   first two skip the reveal — see `useReveal`.
 */
export default function Waypoint({ id, index, icon, title, children }) {
  const [ref, visible] = useReveal({ initiallyVisible: index < 2 })
  // Indexed, not random: the same waypoint gets the same plant on every render and in every
  // language, so the page does not reshuffle its own decoration when somebody switches
  // language. `% length` keeps it safe if a waypoint is ever added without a plant for it.
  const Plant = FLORA[index % FLORA.length]

  return (
    <section
      ref={ref}
      id={id}
      className={visible ? 'wp is-visible' : 'wp'}
      aria-labelledby={`${id}-head`}
    >
      {/* `data-trail-stop` is how TrailPath finds this disc to thread the curve through it. The
          attribute rather than the class, so restyling cannot silently detach the path. */}
      <span className="wp__node" data-trail-stop aria-hidden="true">
        <Glyph name={icon} />
      </span>
      <h2 className="wp__head" id={`${id}-head`}>
        {title}
      </h2>
      {children}
      {/* A printer's fleuron closing the section, IN the text column.
          These plants used to grow in the trail gutter beside the path, which is where they looked
          best and also the only place a loop could find room to be round — at the old width every
          loop on the right-hand side came out pinched. The gutter went to the path; the plants got a
          better job, which is closing each section the way an ornament does. */}
      <p className="wp__ornament" aria-hidden="true">
        <Plant />
      </p>
    </section>
  )
}
