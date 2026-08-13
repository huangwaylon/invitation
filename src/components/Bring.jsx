/**
 * What to wear and what to bring — one section, not two.
 *
 * At an outdoor wedding "what to wear" IS "what to bring": a dress code section that says
 * "garden formal" and a separate packing section that says "shoes you do not mind getting
 * damp" are answering the same question twice and would contradict each other within a
 * month of editing. So the dress code is the paragraph and the kit is the list beneath it.
 */

import { BRING } from '../content.js'
import { useT } from '../i18n/index.js'
import DetailRows from './DetailRows.jsx'

export default function Bring() {
  const { t, pick } = useT()

  return (
    <div>
      <span className="label">{t('bring.dress')}</span>
      <p className="prose">{pick(BRING.dress)}</p>

      {BRING.kit.length ? (
        <>
          {/* The label sits above the list rather than inside the card, so the kit reads as
              a continuation of the dress advice and not as a separate topic. */}
          <span className="label label--spaced">{t('bring.kit')}</span>
          <DetailRows rows={BRING.kit} tight />
        </>
      ) : null}
    </div>
  )
}
