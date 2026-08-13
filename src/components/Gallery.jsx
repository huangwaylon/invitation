/**
 * The gallery, and a lightbox built on the native `<dialog>`.
 *
 * `showModal()` gives four things for free that a hand-rolled overlay reliably gets wrong:
 * a focus trap, Escape to close, the rest of the page marked inert, and top-layer stacking
 * that no z-index on the page can beat. The only thing left to do by hand is return focus to
 * the thumbnail that was tapped, which the browser does NOT do when the dialog is closed
 * programmatically rather than by its own close button.
 *
 * Each tile declares its real pixel dimensions from content.js, so the grid reserves the
 * right space before any image lands. Without that, the page reflows as the photographs
 * arrive and the paragraph somebody is reading jumps up the screen.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { PHOTOS } from '../content.js'
import { useT } from '../i18n/index.js'
import { CloseIcon } from './icons.jsx'

function photoUrl(src) {
  return `${import.meta.env?.BASE_URL ?? '/'}photos/${src}`
}

export default function Gallery() {
  const { t, pick } = useT()
  const dialogRef = useRef(null)
  const openerRef = useRef(null)
  const [open, setOpen] = useState(null)

  const close = useCallback(() => {
    setOpen(null)
    // Focus back to the thumbnail. A modal dialog closed by script leaves focus on <body>,
    // which drops a keyboard user back at the top of a very long page.
    openerRef.current?.focus()
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return undefined
    if (open != null) {
      // Guarded: `showModal` throws if the dialog is already open, which happens on a
      // re-render triggered by a language switch while the lightbox is up.
      if (!dialog.open) dialog.showModal()
    } else if (dialog.open) {
      dialog.close()
    }
    return undefined
  }, [open])

  // Escape and the backdrop both fire `cancel`/`close` on the element itself rather than
  // going through our button, so the state has to be reconciled from the DOM event.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return undefined
    const onClose = () => setOpen(null)
    dialog.addEventListener('close', onClose)
    return () => dialog.removeEventListener('close', onClose)
  }, [])

  const photo = open == null ? null : PHOTOS[open]

  return (
    <>
      <ul className="gallery">
        {PHOTOS.map((item, index) => (
          <li className="gallery__item" key={item.src}>
            <button
              type="button"
              className="gallery__button"
              aria-label={t('photos.open')}
              onClick={(event) => {
                openerRef.current = event.currentTarget
                setOpen(index)
              }}
            >
              <img
                className="gallery__img"
                src={photoUrl(item.src)}
                alt={pick(item.alt)}
                width={item.w}
                height={item.h}
                loading="lazy"
                decoding="async"
              />
            </button>
          </li>
        ))}
      </ul>

      <dialog className="lightbox on-photo" ref={dialogRef} aria-label={t('photos.open')}>
        <button type="button" className="lightbox__close" onClick={close} aria-label={t('photos.close')}>
          <CloseIcon />
        </button>
        {photo ? (
          <>
            <img
              className="lightbox__img"
              src={photoUrl(photo.src)}
              alt={pick(photo.alt)}
              width={photo.w}
              height={photo.h}
            />
            {/* The description is the alt text, shown. It describes rather than captions —
                see content.js — so printing it is useful to a sighted reader too, and it
                means there is exactly one string to keep true per photograph. */}
            <p className="lightbox__caption">{pick(photo.alt)}</p>
          </>
        ) : null}
      </dialog>
    </>
  )
}
