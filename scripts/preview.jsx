/**
 * Writes a self-contained HTML file per language, for looking at the design without a server.
 *
 *   npm run preview:static
 *   open scripts/preview-en.html
 *
 * Why this exists rather than `vite preview`: a static file can be opened straight from disk,
 * screenshotted by a headless browser in one command, and committed as a review artifact. The
 * sibling planning app keeps the same harness for the same reason.
 *
 * WHAT IT DOES AND DOES NOT COVER. It renders the real `App` with the real stylesheets, so
 * layout, type, colour and the whole trail are exactly what ships. It has no JavaScript, so
 * the language switch, the copy button and the lightbox do not respond — and the scroll reveal
 * is off, which is not a limitation but the point: with the reveal disabled every waypoint is
 * visible, and that is precisely the state this file needs to show.
 *
 * The CSP meta tag from index.html is deliberately NOT reproduced here: under `file://` the
 * 'self' origin is opaque and Chrome refuses the inlined stylesheet, which would render a page
 * of unstyled text and look like the design had broken.
 */

import { writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'

import App from '../src/App.jsx'
import { SUPPORTED } from '../src/i18n/catalogs.js'
import { setLocale } from '../src/i18n/index.js'

/* Same order as main.jsx, because the import order IS the cascade. */
const STYLES = ['tokens.css', 'base.css', 'trail.css', 'app.css']
  .map((name) => readFileSync(join('src', 'styles', name), 'utf8'))
  .join('\n')

/**
 * The phone widths worth looking at. 320 is the floor the design has to hold — iPhone SE, and
 * the width every clamp() in tokens.css was tuned against; 390 is the common iPhone; 430 is a
 * Pro Max, where the job is to not look sparse.
 */
const WIDTHS = [320, 390, 430]

/**
 * Rewrite `public/` asset paths so they resolve from `scripts/`.
 *
 * The app builds image URLs from `import.meta.env.BASE_URL`, which is `/` under vite-node — so the
 * markup asks for `/photos/x.jpg`, an absolute path that under `file://` means the root of the disk.
 * A `<base href>` cannot help, because absolute paths ignore it. Without this the harness showed
 * broken-image icons where the photographs go, which is exactly the part of the page it is least
 * able to check by any other means.
 */
const BASE = import.meta.env?.BASE_URL ?? '/'

function localiseAssets(html) {
  // The prefix is READ from the app's own base rather than spelled out. vite-node honours
  // vite.config.js, so BASE_URL here is '/invitation/' — hardcoding either that or a bare '/' is
  // how this quietly breaks the day the repository is renamed or a custom domain is added.
  return html.replaceAll(`="${BASE}`, '="../public/')
}

for (const locale of SUPPORTED) {
  setLocale(locale)
  const body = localiseAssets(renderToStaticMarkup(<App />))
  const path = join('scripts', `preview-${locale}.html`)
  writeFileSync(
    path,
    `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Preview — ${locale}</title>
<style>
${STYLES}
</style>
</head>
<body>${body}</body>
</html>
`,
  )
  console.log(path)
}

/**
 * A harness that puts the same page in three fixed-width iframes side by side.
 *
 * IT HAS TO BE AN IFRAME, and that is not a stylistic choice. macOS enforces a minimum window
 * width of 500px, so a headless browser cannot be given a 390px viewport at all — every
 * `--window-size=390` request comes back as 500. Simply constraining a wrapper div to 390px
 * would not do either: `--fs-display`, `--trail-x`, `--trail-node-size`, `--trail-gutter` and
 * `--space-trail` are all `vw`-based, and `vw` resolves against the VIEWPORT, so a narrow div
 * inside a wide window renders phone-width columns at desktop-width type and trail geometry —
 * which is exactly the thing this harness exists to check, rendered wrong.
 *
 * An iframe has its own viewport, so `vw` resolves against its width and the render is
 * faithful.
 */
/**
 * How tall to make the frames. Generous on purpose: an iframe CLIPS rather than scrolls into a
 * screenshot, so a frame shorter than the page silently truncates the review — which it did, once
 * the photographs pushed the page past 4,600px, and the missing guest list looked like a bug in the
 * app rather than in the harness.
 */
const FRAME_HEIGHT = 7000

function frame(locale, width) {
  return `<iframe src="preview-${locale}.html" width="${width}" height="${FRAME_HEIGHT}" style="border:0;display:block"></iframe>`
}

/* One harness per width and per language, each holding a single frame at the top left.
   Separate files rather than one page of columns, because a headless screenshot's image width
   is the window width and macOS floors a real window at 500px — so a 320px column inside a
   1220px page comes out either cropped or unreadably small. One frame per file keeps each
   capture at the phone's own width, where it can actually be read. */
for (const locale of SUPPORTED) {
  for (const width of WIDTHS) {
    const path = join('scripts', `preview-${locale}-${width}.html`)
    writeFileSync(
      path,
      `<!doctype html>
<html lang="en">
<head><meta charset="UTF-8"><title>${locale} at ${width}</title></head>
<body style="margin:0;background:#fff">${frame(locale, width)}</body>
</html>
`,
    )
  }
}
console.log(`scripts/preview-<locale>-{${WIDTHS.join(',')}}.html`)

/* And one page of columns for looking at in a real browser, where none of the above applies. */
const columns = WIDTHS.map(
  (width) => `  <figure style="margin:0">
    <figcaption style="font:600 12px system-ui;padding:6px 0;color:#333">${width}px</figcaption>
    <div style="border:1px solid #ccc">${frame('en', width)}</div>
  </figure>`,
).join('\n')

const harness = join('scripts', 'preview-widths.html')
writeFileSync(
  harness,
  `<!doctype html>
<html lang="en">
<head><meta charset="UTF-8"><title>Preview — widths</title></head>
<body style="margin:0;padding:8px;background:#e8e8e8">
<div style="display:flex;gap:12px;align-items:flex-start">
${columns}
</div>
</body>
</html>
`,
)
console.log(harness)

