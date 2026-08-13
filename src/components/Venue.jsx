/**
 * Where, the address, and the two map links.
 *
 * NO EMBEDDED MAP. An iframe would mean widening the CSP to allow a frame and loading
 * third-party JavaScript into an invitation, in order to show a small static picture of a
 * map that every guest's own map app draws better, with their own traffic and their own
 * saved home address. Two links do the job at zero cost. See `lib/maps.js`.
 *
 * The copy button is the interesting bit: an address is the one thing on this page somebody
 * needs to get INTO another app — a taxi booking, a message to a friend — and selecting four
 * lines of text by hand on a phone is genuinely awkward.
 */

import { useEffect, useRef, useState } from 'react'
import { VENUE } from '../content.js'
import { appleMapsUrl, googleMapsUrl } from '../lib/maps.js'
import { useT } from '../i18n/index.js'
import { CheckIcon, CopyIcon } from './icons.jsx'

/** Whether the browser can copy at all. False over plain http and in older engines. */
function canCopy() {
  return typeof navigator !== 'undefined' && Boolean(navigator.clipboard?.writeText)
}

export default function Venue() {
  const { t, pick } = useT()
  const [copied, setCopied] = useState(false)
  const timer = useRef(null)

  // Clear the pending reset on unmount, and on a second tap before the first has expired —
  // without this, switching language mid-timeout leaves a setState pointed at a gone node.
  useEffect(() => () => clearTimeout(timer.current), [])

  const name = pick(VENUE.name)
  const area = pick(VENUE.area)
  const lines = pick(VENUE.address)
  const addressLines = Array.isArray(lines) ? lines.filter(Boolean) : [lines].filter(Boolean)
  const query = VENUE.mapQuery || [name, ...addressLines].filter(Boolean).join(', ')

  async function copy() {
    try {
      await navigator.clipboard.writeText([name, ...addressLines].join('\n'))
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 2400)
    } catch {
      // Denied, or a browser that reports the API and refuses the permission. Nothing to
      // report: the address is right there on screen to be selected by hand.
    }
  }

  return (
    <div className="venue">
      <p className="venue__name">{name}</p>
      {area ? <p className="venue__area">{area}</p> : null}

      {addressLines.length ? (
        <address className="venue__address">
          <ul>
            {addressLines.map((line, index) => (
              <li key={index}>{line}</li>
            ))}
          </ul>
        </address>
      ) : null}

      {query ? (
        <div className="venue__actions btn__row">
          {/* `rel="noreferrer"` alongside `noopener`: nothing here needs to leak which
              invitation the guest came from. No `target="_blank"` — on a phone the map link
              hands off to the native app, and forcing a new tab on desktop takes the back
              button away for no gain. */}
          <a className="btn btn--quiet" href={appleMapsUrl(query)} rel="noopener noreferrer">
            {t('venue.openApple')}
          </a>
          <a className="btn btn--quiet" href={googleMapsUrl(query)} rel="noopener noreferrer">
            {t('venue.openGoogle')}
          </a>
        </div>
      ) : null}

      {/* Hidden outright where clipboard access does not exist, rather than shown and
          failing silently. A button that does nothing is worse than one that is not there. */}
      {canCopy() && addressLines.length ? (
        <div className="venue__actions btn__row">
          <button type="button" className="btn btn--quiet" onClick={copy}>
            <CopyIcon />
            {t('venue.copyAddress')}
          </button>
          {/* The live region is rendered ALWAYS and its contents change, rather than the
              region itself appearing on copy. A live region that is inserted at the moment
              it gains content is frequently not announced at all — the screen reader has to
              have been watching it beforehand. */}
          <span className="venue__copied" role="status" aria-live="polite">
            {copied ? (
              <>
                <CheckIcon />
                {t('venue.copied')}
              </>
            ) : null}
          </span>
        </div>
      ) : null}

      {VENUE.phone ? (
        <p className="venue__phone">
          <span className="label">{t('venue.phone')}</span>
          {/* A phone number is the one string on the page that must NOT be translated, and
              `tel:` strips its own spaces. */}
          <a href={`tel:${VENUE.phone.replace(/\s+/g, '')}`}>{VENUE.phone}</a>
        </p>
      ) : null}
    </div>
  )
}
