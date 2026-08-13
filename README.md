# Invitation

A wedding invitation for Waylon and Asuka. One page, three languages, fifteen guests, no
backend — a static site on GitHub Pages that makes no network request after it loads.

It is deliberately a sibling of the [`wedding`](../wedding) planning board and shares its
neutrals, its icon style, its accessibility floors and its deploy shape. Where it departs from
that app it says so, with the reason, next to the code that departs.

**It is live before it is finished, on purpose:** <https://huangwaylon.github.io/invitation/>.
`src/content.js` still holds placeholder details I invented so the page would render, and while
it does, the page carries a yellow DRAFT banner saying so. That banner is the only thing standing
between a placeholder address and a guest — see [Before you send it](#before-you-send-it).

The URL is `noindex`, so it will not appear in search results for anybody's name or for the
venue. Anyone with the link opens it normally.

## The idea

The invitation is a **trail**. One dashed path runs the whole length of the page and every
section is a waypoint on it — a disc with a line-art glyph, a heading, and as few words as the
thing needs. Ten waypoints from the summit at the top to the closing note at the bottom:

| | |
| --- | --- |
| The day | seven rows: arrive, ceremony, lunch, coffee, a walk, lanterns, home |
| Where | the venue, the address, and links into Maps and Google Maps |
| Getting there | train, car, plane, and where to stay |
| What to wear, what to bring | the dress code and a four-item day-camp kit |
| How we got here | four stops, 2019 to now |
| Photographs | a grid and a native-`<dialog>` lightbox — **absent until you add photos** |
| Good to know | five `<details>` rows, closed by default |
| The fifteen | everybody's name, written out — **absent until you add them** |
| The closing | the calendar file, and how to reach you |

Two of those render only when there is something to put in them. A gallery of placeholder
rectangles and a guest list of nobody are both worse than the section simply not being there,
so `App.jsx` drops them and the trail closes up, plants and all.

## Everything about the day lives in one file

[`src/content.js`](src/content.js). Nothing else in the app hardcodes a date, a place, a time
or a name. Each translated field is written once, in all three languages, with a helper:

```js
title: text('The ceremony', '挙式', '婚禮儀式')
```

These are **not translations of each other and must not be**. The gift note is the clearest
case: ご祝儀, 紅包 and "your presence is the present" are three different customs, not one
sentence three times.

The file has to stay pure data — no imports, no `import.meta`, no browser globals — because
`vite.config.js` imports it in Node to generate the calendar files and `check-content.js`
imports it to validate them.

## Before you send it

`npm run check:content` prints exactly what is outstanding, with line numbers. **It is not
enforced in CI** — that was a deliberate choice so the site could go up early and be looked at on
a real phone. What that costs is that nothing mechanical stops a half-finished invitation from
being shared, so the yellow DRAFT banner on the page is doing that job alone. Do not remove it
before the content is real.

1. **Replace every value marked `// DRAFT` in `src/content.js`, and delete the marker.** The
   markers *are* the checklist — there is no second list to keep in sync. Roughly 30 of them:
   the date and times, the couple's names in kanji and Chinese, the venue and its address, the
   travel and lodging paragraphs, and the four story entries. The prose that is voice rather
   than fact — the FAQ answers, the kit list, the closing line — is written and yours to keep
   or rewrite.
2. **Add the fifteen** to `GUESTS`, however they would like to be named. Until then that
   waypoint does not render.
3. **Add photographs**, optionally: drop files in `public/photos/`, then list each one in
   `PHOTOS` with its real pixel `w`/`h` and a per-language `alt` that *describes* rather than
   captions. The dimensions are what stop the page reflowing as images land.
4. **Set a hero photograph**, optionally: `HERO.src`, relative to `public/`. Then uncomment the
   preload in `index.html` and match the filename. Without one the hero is a drawn dashed card
   with the couple's mark set into its top edge like a seal — that is the default, not a
   fallback, and it is finished.
5. **Fill in `CONTACT`** — an email, a LINE ID, whatever is true. Each row hides itself when
   empty.
6. **Set `DRAFT = false`** at the top of `content.js`. The yellow banner disappears and
   `check:content` goes green.

## Running it

```sh
npm install
npm run dev             # http://localhost:5173/invitation/
npm test                # 125 tests, no jsdom
npm run check:content   # what is still placeholder in content.js (not enforced in CI)
npm run contrast        # re-measure the palette; paste the numbers into tokens.css
npm run icons           # regenerate the Home Screen PNGs from the peaks mark
npm run preview:static  # static HTML per language and per phone width, no server needed
npm run build
```

`npm run preview:static` writes `scripts/preview-<locale>.html` plus a set at 320, 390 and 430
px wide. They are self-contained, open straight from disk, and are how this design was reviewed
— a headless browser cannot be given a viewport narrower than 500px on macOS, so each width is
rendered inside an iframe, which has a viewport of its own and so resolves `vw` units correctly.

## Decisions worth knowing about

**There is no RSVP, and that is a decision.** At fifteen guests the couple already knows who is
coming; a form would be ceremony for its own sake, and on a static page it would mean either a
third-party embed or a backend. The one action on the page is the calendar file.

**The calendar file is generated at build time, one per language.** A `data:text/calendar` href
is blocked by every browser as a top-level navigation and a `blob:` URL would need the CSP
widened, so a plugin in `vite.config.js` emits real files into `dist/calendar/`. One per
language because a calendar client has no locale context: whatever text the file carries is
what the guest sees in their calendar forever. See [`src/lib/ics.js`](src/lib/ics.js), which
also explains why the times are UTC instants rather than a bare `TZID`, and why the folding is
measured in octets — in Japanese and Chinese one character is three bytes, and a 75-character
fold produces lines a parser will truncate.

**There is no embedded map.** An iframe would mean widening the CSP and loading third-party
JavaScript into an invitation, to show a static picture of a map that every guest's own map app
draws better, with their own traffic and their own saved home address. Two links do it for
nothing.

**No web fonts, and no third-party JavaScript at all.** `script-src 'self'` and
`font-src 'self'` in the CSP, and no analytics, no font loader, no map embed, no widget. The
type is a system serif stack (Iowan Old Style → Palatino → Georgia) with Hiragino Mincho and
Songti TC behind it. This is the one rule the sibling app is knowingly broken: it bans serif and
display faces outright, for a good reason that does not transfer — nothing here is a number
anybody has to parse, and an invitation set in the system UI sans reads like a calendar event.

**The three-language font stacks are scoped to `html[lang]`, and that is load-bearing.** Han
unification gives Japanese and Traditional Chinese the same codepoints for characters that are
*drawn differently* — 直, 骨, 次, 者. A single stack listing `Hiragino Sans` before `PingFang TC`
renders the Chinese page in Japanese letterforms, which to a Taiwanese reader is subtly and
persistently wrong. `i18n/index.js` writes `lang` onto `<html>` before the first paint for the
same reason.

`zh-Hant`, not `zh` and not `zh-TW`: what matters to these guests is the script, not the region.
Anything assuming a locale tag is two letters is wrong here, which is why `negotiateLocale` is
hand-written rather than copied from the sibling app — that version does `tag.split('-')[0]` and
would land every Chinese-preferring browser on English.

**The scroll reveal is opt-in, never opt-out.** The CSS that hides an unrevealed waypoint is
scoped to a `data-reveal="on"` attribute that React writes only when `IntersectionObserver`
exists and the reader has not asked for reduced motion. No JavaScript, an old engine, reduced
motion, or a test rendering to static markup all give the same result: a fully visible
invitation. Doing it the other way round is how a page ends up blank because one bundle failed
to parse.

**Every colour was measured, not chosen.** `npm run contrast` prints the report and
`test/contrast.test.js` fails the build; the numbers are pasted next to the values in
[`tokens.css`](src/styles/tokens.css). The dashed trail, the waypoint rings and the flora sit
*below* 3:1 legitimately — all three are `aria-hidden` decoration, and a reader who cannot see
any of it gets the same headings in the same order. The tests assert a ceiling on them as well
as a floor, so if the trail ever clears 3:1 somebody has started using it to mean something.

## Deploying

Push to `main`. The workflow runs the tests, builds, and publishes to Pages at `/invitation/`.

**The Pages source must be "GitHub Actions", not "Deploy from a branch".** It is already set that
way. Branch mode serves the repo root verbatim, which would publish this repo's `index.html` —
the Vite dev entry, pointing at raw unbundled JSX — and the result is a blank page with a console
error. The only way to make branch mode work would be committing `dist/` into the repo.

For a custom domain, build with `VITE_BASE=/` and add a `CNAME`. Note that `public/robots.txt`
only starts taking effect at that point; read the comment in it.

### Keeping it out of search

`index.html` carries `<meta name="robots" content="noindex, nofollow">`, and that tag is the
whole mechanism — the repo is public, so the URL is reachable by anyone, and this page will carry
a street address, a date and fifteen names. Delete the tag to make the invitation searchable.
