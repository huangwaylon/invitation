/**
 * The whole invitation, top to bottom.
 *
 * THE SECTION LIST IS DATA, not markup. Ten waypoints declared as an array and mapped, so
 * the trail's index — which decides the plant beside each one and which two skip the reveal
 * — is derived rather than typed out ten times. It is also what makes a section conditional
 * without renumbering anything: with no photographs in content.js the gallery waypoint is
 * simply absent and the ones after it shuffle up, plants and all.
 */

import { useEffect, useMemo, useState } from 'react'
import { DRAFT, GUESTS, PHOTOS, TRAVEL } from './content.js'
import { syncDocumentLocale, useT } from './i18n/index.js'
import { revealEnabled } from './lib/useReveal.js'
import { coupleNames } from './components/Hero.jsx'
import { PeaksIcon } from './components/icons.jsx'
import Bring from './components/Bring.jsx'
import Closing from './components/Closing.jsx'
import DetailRows from './components/DetailRows.jsx'
import Faq from './components/Faq.jsx'
import Gallery from './components/Gallery.jsx'
import Guests from './components/Guests.jsx'
import Hero from './components/Hero.jsx'
import LangSwitch from './components/LangSwitch.jsx'
import Schedule from './components/Schedule.jsx'
import Story from './components/Story.jsx'
import TrailPath from './components/TrailPath.jsx'
import Venue from './components/Venue.jsx'
import Waypoint from './components/Waypoint.jsx'

/**
 * Shown only while content.js still has `DRAFT = true`, and deliberately ugly — the moment
 * this looks designed is the moment somebody ships it.
 *
 * CURRENTLY OFF — `DRAFT` is `false` in content.js while placeholder fields remain, by decision. It
 * is kept rather than deleted because it is one line to switch back on, and it is the only warning
 * this page has: `check:content` reports but does not gate, and the deploy workflow does not run it.
 *
 * Not translated, on purpose. It addresses whoever is editing the file, not a guest.
 */
function DraftBanner() {
  return (
    <p className="draft">
      DRAFT — content.js still has placeholder details. Replace every <code>// DRAFT</code>{' '}
      field, then set <code>DRAFT = false</code>.
    </p>
  )
}

export default function App() {
  const { t, pick, locale } = useT()

  /**
   * Read once, at mount, and never again. The reveal machinery must not change under a
   * running page: flipping this after some waypoints have already revealed would leave the
   * rest permanently hidden, since the CSS that hides them is gated on this attribute while
   * the class that shows them is set by an observer that would no longer be running.
   */
  const [reveal] = useState(revealEnabled)

  /* `lang` on <html> is what selects the per-locale CJK font stacks in tokens.css, so this
     effect is load-bearing rather than cosmetic — without it the Chinese page renders in
     Japanese letterforms. Runs on mount too, since the module's initial detection happens
     before React does anything. */
  useEffect(() => {
    syncDocumentLocale(locale)
  }, [locale])

  /* The title needs the couple's names, which live in content.js — which is why the i18n
     module deliberately does not own it. */
  useEffect(() => {
    const names = coupleNames(pick).join(' & ')
    document.title = names ? `${names} · ${t('app.title')}` : t('app.title')
  }, [locale, pick, t])

  const sections = useMemo(
    () =>
      [
        { id: 'day', icon: 'sun', title: t('section.day'), body: <Schedule /> },
        { id: 'where', icon: 'pin', title: t('section.where'), body: <Venue /> },
        { id: 'travel', icon: 'compass', title: t('section.travel'), body: <DetailRows rows={TRAVEL} /> },
        { id: 'bring', icon: 'backpack', title: t('section.bring'), body: <Bring /> },
        /* The couple's own mark for their own story. It is the only glyph on the page that
           appears twice — here and at the end of the trail — and that repetition is the point. */
        { id: 'story', icon: 'peaks', title: t('section.story'), body: <Story /> },
        /* Absent rather than empty when content.js has no photographs. A gallery of
           placeholder rectangles is worse than no gallery, and the same goes for a guest
           list of nobody. */
        PHOTOS.length ? { id: 'photos', icon: 'camera', title: t('section.photos'), body: <Gallery /> } : null,
        { id: 'faq', icon: 'question', title: t('section.faq'), body: <Faq /> },
        GUESTS.length ? { id: 'guests', icon: 'guests', title: t('section.guests'), body: <Guests /> } : null,
      ].filter(Boolean),
    [t],
  )

  return (
    <>
      {DRAFT ? <DraftBanner /> : null}

      {/* First in the tab order. On a page ten sections long this saves a keyboard user a
          lot of tabbing, and it is the reason <main> carries tabIndex={-1} — a skip link
          pointing at a non-focusable element moves the scroll position but not the focus,
          so the next Tab starts from the top again. */}
      <a className="skip" href="#invitation">
        {t('skip.toContent')}
      </a>

      <div className="page">
        <LangSwitch />
        <Hero />

        <main className="trail" id="invitation" tabIndex={-1} data-reveal={reveal ? 'on' : undefined}>
          {/* FIRST CHILD, and that is paint order rather than preference: both this and each
              waypoint's disc are positioned with no z-index, so the discs punch their holes in the
              curve only because they come later in the document. `stopCount` is every disc plus the
              summit mark at the end. */}
          <TrailPath stopCount={sections.length + 1} />

          {sections.map((section, index) => (
            <Waypoint
              key={section.id}
              id={section.id}
              index={index}
              icon={section.icon}
              title={section.title}
            >
              {section.body}
            </Waypoint>
          ))}

          {/* The full stop. A last run of dashes and the two peaks again, so the path ends
              rather than stopping. */}
          <div className="trail__end is-visible" aria-hidden="true">
            <span className="trail__summit" data-trail-stop>
              <PeaksIcon />
            </span>
          </div>
        </main>

        <Closing />

        <footer className="footer">{t('footer.madeWith')}</footer>
      </div>
    </>
  )
}
