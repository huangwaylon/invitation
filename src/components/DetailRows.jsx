/**
 * A glyph, a heading and a paragraph, repeated. Used twice — once for getting there and
 * staying over, once for the kit list — because the two sections are the same shape at two
 * scales, and two components would drift apart.
 *
 * This is the ONE place a glyph appears inside a section rather than on the trail, and it
 * earns it: these rows are a set of parallel options (train, car, plane, bed) where the
 * picture is what lets somebody find their own row without reading the other three.
 */

import { Glyph } from './icons.jsx'
import { useT } from '../i18n/index.js'

/**
 * @param {object} props
 * @param {Array<{icon: string, title: object, label?: object, note: object}>} props.rows
 *   `title` for a travel row, `label` for a kit item — the two halves of content.js name the
 *   same field differently because a travel entry has a heading and a kit entry has a name.
 *   Accepting both keeps content.js reading naturally in each place.
 * @param {boolean} [props.tight] the kit variant: smaller notes, tighter rhythm.
 */
export default function DetailRows({ rows, tight = false }) {
  const { pick } = useT()

  return (
    <div className={tight ? 'detail kit' : 'detail'}>
      {rows.map((row, index) => {
        const heading = pick(row.title ?? row.label)
        const note = pick(row.note)
        return (
          <div className="detail__row" key={index}>
            <span className="detail__glyph" aria-hidden="true">
              <Glyph name={row.icon} />
            </span>
            <h3 className="detail__title">{heading}</h3>
            {note ? <p className="detail__note">{note}</p> : null}
          </div>
        )
      })}
    </div>
  )
}
