/**
 * Good to know. `<details>`/`<summary>`, so the browser owns the open state, its keyboard
 * behaviour and its announcement — and so the whole section still works with no JavaScript.
 *
 * All closed by default. Five answers expanded would double the length of the page for the
 * benefit of the one guest who needed a particular one; closed, the section is five lines
 * that can be scanned in a second.
 *
 * `name` is deliberately NOT set on the details elements. Sharing a name would make them
 * mutually exclusive like an accordion, and there is no reason two of these cannot be open
 * at once — the reader is comparing, not navigating.
 */

import { FAQ } from '../content.js'
import { useT } from '../i18n/index.js'
import { ChevronDownIcon } from './icons.jsx'

export default function Faq() {
  const { pick } = useT()

  return (
    <div className="faq">
      {FAQ.map((row, index) => (
        <details className="faq__item" key={index}>
          <summary className="faq__q">
            {pick(row.q)}
            <span className="faq__chevron" aria-hidden="true">
              <ChevronDownIcon />
            </span>
          </summary>
          <p className="faq__a">{pick(row.a)}</p>
        </details>
      ))}
    </div>
  )
}
