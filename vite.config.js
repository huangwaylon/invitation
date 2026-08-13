import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * The calendar files, generated at build time — one per language.
 *
 * WHY A PLUGIN AND NOT A BLOB IN THE BROWSER. The obvious implementation builds the .ics
 * text at runtime and hands it to an anchor as a `data:` or `blob:` URL. A
 * `data:text/calendar` href is blocked by every browser as a top-level navigation, and a
 * `blob:` URL would need `default-src 'self'` in index.html widened to allow it. A file
 * emitted into dist/ needs neither, works with JavaScript disabled, and is cacheable.
 *
 * ONE FILE PER LANGUAGE, because a calendar client has no locale context: whatever text the
 * file carries is what the guest sees in their calendar forever. A Japanese guest who taps
 * "カレンダーに追加" should not find an English event in it.
 *
 * The dynamic imports are what keep `src/content.js` and `src/lib/ics.js` honest about being
 * pure Node-safe data — if either ever reaches for `document` or `import.meta.env`, the build
 * fails here rather than shipping something subtly wrong.
 */
function calendarFiles() {
  /** Shared by the build hook and the dev middleware, so the two cannot disagree. */
  async function render(locale) {
    const { buildIcs } = await import('./src/lib/ics.js')
    return buildIcs(locale)
  }

  async function locales() {
    const { SUPPORTED } = await import('./src/i18n/catalogs.js')
    return SUPPORTED
  }

  return {
    name: 'invitation-calendar',

    async generateBundle() {
      const { icsPath } = await import('./src/lib/ics.js')
      for (const locale of await locales()) {
        const source = await render(locale)
        // `buildIcs` returns null when content.js has no real date yet. Emit nothing rather
        // than a file describing Invalid Date — `Closing.jsx` gates its button on the same
        // three fields, so no link is rendered either and nothing 404s.
        if (!source) continue
        this.emitFile({ type: 'asset', fileName: icsPath(locale), source })
      }
    },

    /**
     * `generateBundle` only runs for `vite build`, so without this the calendar button 404s
     * under `npm run dev` — which is exactly the kind of thing that gets discovered after
     * the invitation has been sent.
     */
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const { icsPath } = await import('./src/lib/ics.js')
        const url = (request.url ?? '').split('?')[0]
        for (const locale of await locales()) {
          if (!url.endsWith(icsPath(locale))) continue
          const source = await render(locale)
          if (!source) break
          response.setHeader('Content-Type', 'text/calendar; charset=utf-8')
          response.end(source)
          return
        }
        next()
      })
    },
  }
}

export default defineConfig({
  // GitHub Pages serves project sites from /<repo>/, so the bundle needs a base path matching
  // the repository name. Override with VITE_BASE=/ for a custom domain.
  base: process.env.VITE_BASE ?? '/invitation/',
  plugins: [react(), calendarFiles()],
  test: {
    /**
     * `node`, not jsdom, and no jsdom dependency anywhere. Every component here renders from
     * props and content.js with no DOM measurement, so `renderToStaticMarkup` exercises the
     * real output; the three places that do touch the DOM — the clipboard, the lightbox
     * dialog, the reveal observer — are all guarded on feature detection and take the
     * absent-API branch under Node, which is a branch worth having covered anyway.
     */
    environment: 'node',
    include: ['test/**/*.test.{js,jsx}'],
  },
})
