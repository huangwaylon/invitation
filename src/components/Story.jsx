/**
 * How we got here. A year, a title, a sentence — four times.
 *
 * `year` is printed verbatim and never parsed: content.js is free to put a season or a dash
 * in there. Treating it as a date would mean the one field somebody wants to write "the
 * winter after that" in is the one field that rejects it.
 */

import { STORY } from '../content.js'
import { useT } from '../i18n/index.js'

export default function Story() {
  const { pick } = useT()

  return (
    <div className="story">
      {STORY.map((row, index) => {
        const note = pick(row.note)
        return (
          <div className="story__row" key={index}>
            {/* Not a <time>: see above — this is a label, and half of them may not be dates. */}
            <p className="story__year tnum">{row.year}</p>
            <h3 className="story__title">{pick(row.title)}</h3>
            {note ? <p className="story__note">{note}</p> : null}
          </div>
        )
      })}
    </div>
  )
}
