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

- **The path is GENERATED, in `lib/trailPath.js`, from the measured positions of the waypoint discs.**
  It was a tiled SVG background and that is repetition by definition — identical loops at even
  intervals. Do not put it back in CSS: a tile cannot know where the discs are, cannot avoid repeating,
  and has to fit the narrowest column the page ever has, which is what squashed the loops into ovals.
- **`data-trail-stop` is the contract between the CSS layout and the generated curve.** Every disc
  carries it and so does the summit mark; `TrailPath` finds them and threads the curve through their
  centres. An attribute rather than a class, so restyling cannot silently detach the path.
- **`useLayoutEffect`, not `useEffect`.** The first render draws an estimated path; a layout effect
  replaces it with the measured one before the browser paints. With `useEffect` the reader sees the
  estimate for a frame and watches it snap.
- **CENTRIPETAL Catmull-Rom, never uniform.** The uniform form is parameterised by knot index and a
  loop is six knots a few pixels apart between crests a hundred apart, so it overshoots into a cusp at
  every loop. Centripetal (α=½) provably cannot cusp within a segment, which is what makes "no sharp
  points" structural. `test/trail.test.js` asserts C1 at every junction.
- **A loop needs 2r of width, so the usable radius on a side is HALF its reach.** Capping it at the
  reach let the curve draw to x=65 in a 49-wide box, where an SVG clips it to a flat edge. The left
  side has the page's own padding behind it and roughly twice the room of the right, which is why
  `.trail__drawing` has a negative `left` and why the loops are weighted toward that side.
- **THE WAVES ARE HELD BELOW THEIR AVAILABLE REACH — 0.42 to 0.68 — TO BALANCE THE LOOPS.** The two
  gestures share the same width but do not read at the same scale: a crest at the full reach is a sweep
  spread over 200px of height, while a loop at the full reach is a circle of that diameter. At the
  original 0.62–1.0 the meander dominated and the loops read as ornaments hung off it. A loop cannot
  grow to match, being capped at half the reach, so the waves give way. `test/trail.test.js` asserts
  the median loop diameter against the wave's PEAK-TO-PEAK — comparing it against a single crest,
  which is half a wave, makes the ratio look twice as bad as it is.
- **Variety between consecutive loops is STRUCTURAL, not probabilistic.** `lastLoopSide` and
  `lastLoopScale` carry across spans: the side mostly alternates and the size is pushed at least a
  quarter of the range from the previous one. Probability that is right on average was wrong on the
  page in front of me twice — once with all six loops down the left, once with three on the narrow side
  within half a pixel of each other.
- **Seed per span with a HASH, never `seed + span * stride`.** mulberry32 advances by a fixed constant
  and hashes, so seeds a fixed stride apart give correlated first outputs — and every early draw here is
  a decision. The symptom was every loop on a page landing on the same side within 3px of the same
  size: the exact repetition this generator exists to prevent, reached by another route. Per-span
  seeding at all is what keeps a FAQ row opening from redrawing the whole trail.
- **The plants are section-closing ornaments in the TEXT column, not undergrowth in the gutter.** They
  looked better in the gutter and the gutter is the only place a loop can be round; the two could not
  share it. Moving them back means shrinking the loops.
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

## The fifteen

- **GUESTS is an array of GROUPS and includes the couple.** Fifteen was always the whole party, not
  the guest count, so the two of them are the first group. `Guests.jsx` renders each group as its own
  `<ul>` with a wider gap between them.
- **The groups carry no headings, deliberately.** Labelling them would mean inventing a relationship
  per cluster ("Waylon's side"), and getting one wrong on a wedding invitation is worse than leaving
  the shape to speak. Do not add labels without being told what they are.
- **Anything reading "Grandpa 1" must not ship.** Those five are the user's own placeholders,
  carried through verbatim and marked, and they are the single most embarrassing thing on the page if
  it goes out as-is.

## Gotchas

- **NEVER RUN A BARE `npm install`.** This repo is developed on a machine where
  `NPM_CONFIG_REGISTRY` points at an internal Apple mirror, and a bare install bakes that host
  into all 149 `resolved` URLs in `package-lock.json`. It works perfectly locally and fails on a
  GitHub runner, which cannot reach those hosts — and npm reports it uselessly. A repo `.npmrc`
  cannot prevent it, because npm ranks env vars higher. Use:

      npm install --registry=https://registry.npmjs.org

  `test/lockfile.test.js` fails the build on a non-public `resolved` URL. It is ported from the
  sibling app, which learned this the same way. The first deploy of this repo failed on exactly
  this.

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
