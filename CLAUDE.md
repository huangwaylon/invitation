# CLAUDE.md

Invariants for this repo. These are the things that **fail silently when broken** — a page that
still renders, still passes a casual look, and is wrong. Everything else is explained in a
comment next to the code it governs; read that first.

## Content

- **`src/content.js` must stay pure data.** No imports, no `import.meta`, no `document`, no
  `window`. `vite.config.js` imports it in Node to emit the calendar files and
  `scripts/check-content.js` imports it to validate them. A browser-only reference breaks both,
  and the build failure will point at the plugin rather than at the real cause.
- **A `text()` field needs all three languages, and they are not translations.** ご祝儀, 紅包 and
  "your presence is the present" are three customs. Writing one sentence three times produces a
  language switch that appears to work and changes nothing; `test/content.test.js` fails when
  more than half the fields are identical to English.
- **`DAY.date` is a wall-clock day and `SCHEDULE[].at` is a wall-clock time.** Never
  `new Date(day)` — that parses as UTC midnight and renders as the day before anywhere west of
  Greenwich, so a guest in California reads the wrong date. `src/lib/time.js` is the only place
  allowed to turn either into a `Date`.
- **`DAY.timezone` is the VENUE's zone, not the device's.** It is what the countdown resolves
  "today" in, so that everybody everywhere is counting down to the same morning.
- **Deleting a `// DRAFT` marker is a claim that the value beside it is real.** `check:content` has
  no other way to know.
- **The DRAFT banner is the only thing keeping a placeholder away from a guest.** `check:content`
  exists but is deliberately NOT run in CI — the site is published before its details are final so
  it can be seen on a real phone — so the banner `App.jsx` renders while `DRAFT = true` is the
  entire remaining defence. Removing it while the content is still placeholder means a guest can be
  sent a confident, plausible, wrong address.
- **`index.html`'s `noindex` meta tag is the whole reason this page is not searchable.**
  `public/robots.txt` is inert on a project page — robots.txt is resolved per origin at
  `/robots.txt` and this site serves from `/invitation/`. Do not delete the meta tag believing the
  robots file covers it; the file's own comment explains why it does not.

## Locales

- **The tags are `en`, `ja`, `zh-Hant`.** One of them has a script subtag. Anything that assumes
  a locale tag is two letters — `tag.slice(0, 2)`, `tag.split('-')[0]` — is wrong here and will
  land every Chinese-preferring browser on English. `negotiateLocale` in `src/i18n/index.js`
  handles it explicitly and `test/i18n.test.js` has the case.
- **`lang` on `<html>` is load-bearing, not cosmetic.** It selects the per-locale CJK font stacks
  in `tokens.css`. Setting the catalog without setting `lang` renders Traditional Chinese in
  Japanese letterforms — same codepoints, different glyphs, and unmistakably wrong to a
  Taiwanese reader. `main.jsx` sets it before the first paint; `App.jsx` keeps it in sync.
- **`ja` and `zh-Hant` have one cardinal plural category.** A `one` branch in either catalog can
  never be selected. It is dead text that reads as live.
- **Never track out CJK.** `--tracking-wide` is zeroed for both CJK locales in `tokens.css`;
  letter-spacing on full-width glyphs reads as a rendering fault, not as elegance.

## The trail

- **All trail geometry derives from `--trail-x`, `--trail-node-size` and `--trail-gutter`.** Put a
  literal pixel value in `trail.css` and the spine and the discs drift apart at some width you
  are not looking at. All three are `clamp()`ed, which is what makes the layout hold at 320px
  with no media query.
- **The spine is a `repeating-linear-gradient`, not `border-left: dashed`.** A dashed border
  derives its dash length from the border width and stretches it to fit the box, so two segments
  of different heights draw visibly different dashes — and this spine is one segment per
  waypoint. The hero's rule shares the same gradient so the two look like one drawing.
- **The reveal is opt-in.** The hidden state is scoped to `[data-reveal="on"]`, written only when
  `IntersectionObserver` exists and reduced motion is not requested, and `useReveal` decides
  visibility *during render* rather than in an effect. Invert this and one failed bundle ships a
  blank invitation. `test/render.test.jsx` asserts it both ways.

## Colour and type

- **Run `npm run contrast` after touching any colour, and paste the numbers into `tokens.css`.**
  `test/contrast.test.js` also asserts them and reads `tokens.css` back to check the hexes match
  what it graded.
- **The trail, the node rings and the flora are allowed below 3:1 because they are decoration.**
  Every one is `aria-hidden` and carries no information. The moment one of them labels something
  it needs `--ink-3`, the `base` stroke weight and a real row in the contrast script — the tests
  assert a *ceiling* on them for exactly this reason.
- **Nothing below 13px, ever.** 12px kanji is mush and 12px Han is worse, and two of the three
  languages are CJK.
- **`--ink-3` cannot be lightened.** It is the lightest ink on the page, used at 13px, and it
  measures 4.53:1 on `--sunken`. One step lighter fails AA; there is a test for that.

## Accessibility

- **Every glyph in `icons.jsx` is `aria-hidden` and never the only label.** `Glyph` renders
  *nothing* for a name it does not recognise rather than substituting a fallback — a wrong
  picture beside a heading is worse than no picture. `test/content.test.js` checks that every
  `icon:` string in `content.js` resolves.
- **`aria-current` carries the language switch's selected state**, not a class, so what is
  painted and what is announced cannot disagree.
- **The hero's ampersand is not `aria-hidden`.** Hiding it makes the accessible name "Waylon
  Asuka" — two people rather than a couple.
- **A live region has to exist before it gains content.** The copy confirmation renders its
  `role="status"` span always and changes its contents; a region inserted at the moment it gains
  content is frequently never announced.

## Security posture

- **No third-party JavaScript, ever.** `script-src 'self'` in `index.html` is possible because
  there is no analytics, no font loader, no map embed and no RSVP widget. Adding any of them is a
  CSP change, and if you are making one, this file and the README are now wrong.
- **`connect-src 'self'` is for the dev server's hot-reload socket only.** The shipped page makes
  no requests at all after load. If a fetch appears, something has changed architecturally.
- **The `.ics` is a build artefact, not a runtime blob.** A `data:` href is blocked as a top-level
  navigation and a `blob:` URL would need the CSP widened. If you find yourself widening it,
  re-read `src/lib/ics.js` first.

## The sibling app

`../wedding` is the planning board. This repo copies its neutrals, its 24×24 / 1.75-stroke icon
style, its `PeaksIcon` mark verbatim, its contrast script and its deploy workflow. Three
deliberate departures, each documented where it happens:

1. **Serif display type**, which that app bans. Its reason was about a number people have to
   read; there is no such number here.
2. **Sage rather than indigo.** Its default had to be separable from green and red at 8px because
   colour there encodes state. Nothing here has a state.
3. **`negotiateLocale` rewritten**, because its version discards the script subtag.

`PeaksIcon`'s path appears in four places — `icons.jsx`, the inline favicon in `index.html`,
`scripts/make-icons.js`, and the hero's seal. They must not drift.
