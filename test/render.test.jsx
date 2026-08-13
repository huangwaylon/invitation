/**
 * Renders the whole invitation to static markup, in all three languages.
 *
 * `renderToStaticMarkup` under vitest's `node` environment, with no jsdom anywhere. Every
 * component here renders from content.js and props with no DOM measurement, so the static
 * output IS the real output — and the three places that do touch the DOM (the clipboard, the
 * lightbox dialog, the reveal observer) are all guarded on feature detection and take the
 * absent-API branch here, which is a branch worth covering anyway.
 */

import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import App from '../src/App.jsx'
import { CLOSING, GUESTS, PHOTOS, SCHEDULE, VENUE } from '../src/content.js'
import { CATALOGS, SUPPORTED } from '../src/i18n/catalogs.js'
import { pick } from '../src/lib/pick.js'
import { setLocale } from '../src/i18n/index.js'

function render(locale) {
  setLocale(locale)
  return renderToStaticMarkup(<App />)
}

/**
 * Content strings go through React's own escaping on the way into the markup, so an assertion
 * against the raw string fails on any copy containing an ampersand — "Arrive & wander",
 * "Waylon & Asuka", "Sun & bugs". Escaping the expectation rather than loosening the assertion
 * keeps it exact.
 */
function escaped(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

describe('the page, in every language', () => {
  for (const locale of SUPPORTED) {
    describe(locale, () => {
      const html = render(locale)

      it('renders every section heading', () => {
        for (const key of Object.keys(CATALOGS[locale]).filter((k) => k.startsWith('section.'))) {
          const heading = CATALOGS[locale][key]
          // The gallery heading is absent when content.js has no photographs, and the guest
          // list heading when it has no guests — both are supported states.
          if (key === 'section.photos' && !PHOTOS.length) continue
          if (key === 'section.guests' && !GUESTS.length) continue
          expect(html, key).toContain(escaped(heading))
        }
      })

      it('renders the venue and the closing line in this language', () => {
        expect(html).toContain(escaped(pick(locale, VENUE.name)))
        expect(html).toContain(escaped(pick(locale, CLOSING)))
      })

      it('renders every schedule row', () => {
        for (const row of SCHEDULE) expect(html).toContain(escaped(pick(locale, row.title)))
      })

      /* The failure mode a `text()` object reaches the DOM as. Worth an explicit assertion
         because it renders as visible garbage rather than as an error. */
      it('never prints [object Object]', () => {
        expect(html).not.toContain('[object Object]')
      })

      it('never prints an unresolved i18n key', () => {
        // A missing key falls back to the key itself, which always contains a dot and never a
        // space — so any `>section.` or `>countdown.` in the output is a lookup that failed.
        expect(html).not.toMatch(/>(section|countdown|venue|bring|photos|calendar|contact|footer|hero|lang|skip)\./)
      })

      it('never prints an unsubstituted placeholder', () => {
        expect(html).not.toMatch(/\{(count|name)\}/)
      })

      it('marks the language switch option for this locale as current, and only that one', () => {
        expect((html.match(/aria-current="true"/g) ?? []).length).toBe(1)
      })
    })
  }
})

describe('structure', () => {
  const html = render('en')

  it('has exactly one h1', () => {
    expect((html.match(/<h1/g) ?? []).length).toBe(1)
  })

  it('names both people in the h1, with the ampersand kept in the accessible name', () => {
    const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html)?.[1] ?? ''
    expect(h1).toContain('Waylon')
    expect(h1).toContain('Asuka')
    expect(h1).toContain('&amp;')
  })

  /**
   * Six, not eight: the gallery and the guest-list waypoints are conditional on content.js
   * having photographs and guests, and both are empty until somebody fills them in. Derived
   * from the same conditions the app uses rather than hardcoded, so adding photographs later
   * does not turn this red.
   */
  const expectedWaypoints = 6 + (PHOTOS.length ? 1 : 0) + (GUESTS.length ? 1 : 0)

  it('gives every waypoint a heading it points at with aria-labelledby', () => {
    const labelled = [...html.matchAll(/aria-labelledby="([^"]+)"/g)].map((match) => match[1])
    expect(labelled).toHaveLength(expectedWaypoints)
    for (const id of labelled) expect(html, id).toContain(`id="${id}"`)
  })

  it('opens with the skip link, pointing at a focusable main', () => {
    expect(html.indexOf('class="skip"')).toBeGreaterThan(-1)
    expect(html).toContain('href="#invitation"')
    expect(html).toContain('id="invitation"')
    // A skip link aimed at a non-focusable element moves the scroll but not the focus.
    expect(html).toMatch(/id="invitation"[^>]*tabindex="-1"|tabindex="-1"[^>]*id="invitation"/)
  })

  /**
   * The reveal is opt-in: the CSS that hides an unrevealed waypoint is scoped to
   * `[data-reveal="on"]`, and here — no window, no IntersectionObserver — the attribute must be
   * absent so every waypoint renders visible. This is the assertion that stops a refactor from
   * shipping a blank invitation to anyone whose bundle failed to run.
   */
  it('does not enable the reveal without a browser, so nothing is hidden', () => {
    // The attribute is the mechanism: the CSS that hides an unrevealed waypoint is scoped to
    // it, so its absence alone guarantees a visible page.
    expect(html).not.toContain('data-reveal')
    // And the components agree, rather than merely not contradicting the CSS — `useReveal`
    // decides this during render, so every waypoint here is already marked visible.
    expect((html.match(/class="wp is-visible"/g) ?? []).length).toBe(expectedWaypoints)
    expect(html).not.toMatch(/class="wp"[^-]/)
  })

  it('hides every decorative glyph from the accessibility tree', () => {
    // Every <svg> in the output comes from icons.jsx, and every one of those sets aria-hidden.
    const svgs = html.match(/<svg[^>]*>/g) ?? []
    expect(svgs.length).toBeGreaterThan(10)
    for (const svg of svgs) expect(svg, svg).toContain('aria-hidden="true"')
  })

  it('renders the drawn hero when content.js has no photograph', () => {
    expect(html).toContain('hero__frame')
    expect(html).not.toContain('hero__img')
  })

  it('offers the calendar file for the current language', () => {
    expect(html).toContain('calendar/wedding-en.ics')
    expect(html).toContain('download="wedding-en.ics"')
  })

  it('renders no RSVP form, because there is deliberately no backend', () => {
    expect(html).not.toContain('<form')
    expect(html).not.toContain('<input')
  })

  it('never links out without noopener', () => {
    for (const anchor of html.match(/<a [^>]*href="https?:[^>]*>/g) ?? []) {
      expect(anchor, anchor).toContain('noopener')
    }
  })
})

describe('switching language', () => {
  it('changes the rendered text, which is what proves the catalogs are wired up', () => {
    const en = render('en')
    const ja = render('ja')
    const zh = render('zh-Hant')
    expect(en).not.toBe(ja)
    expect(ja).not.toBe(zh)
    expect(ja).toContain(escaped(CATALOGS.ja['section.where']))
    expect(zh).toContain(escaped(CATALOGS['zh-Hant']['section.where']))
  })

  it('keeps the same number of waypoints in every language', () => {
    const counts = SUPPORTED.map((locale) => (render(locale).match(/class="wp /g) ?? []).length)
    expect(new Set(counts).size).toBe(1)
  })
})
