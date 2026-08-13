/**
 * What is still a placeholder in src/content.js.
 *
 *   npm run check:content
 *
 * IT IS NOT A DEPLOY GATE. It was, and the workflow step that ran it was removed deliberately so
 * the site could go up before its details were final. So this script reports; it does not prevent.
 * The thing that actually warns a reader is the DRAFT banner the page renders while
 * `DRAFT = true`, which is why removing that banner early is called out as an invariant in
 * CLAUDE.md.
 *
 * THE CHECKLIST IS THE `// DRAFT` COMMENTS THEMSELVES. Each one marks a value that was invented or
 * left out, and this script reports while any of them is still in the file — so the workflow is:
 * replace the value, delete the comment, and when the last one is gone set `DRAFT = false`. There
 * is no separate list to keep in sync, because a separate list would go stale the first time
 * somebody added a field.
 *
 * Structural checks live here too, but the ones needing JSX — that every `icon:` name
 * resolves to a real glyph — are in test/content.test.js, which can import through Vite.
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import {
  BRING,
  CLOSING,
  COUPLE,
  DAY,
  DRAFT,
  FAQ,
  GUESTS,
  PHOTOS,
  SCHEDULE,
  STORY,
  TRAVEL,
  VENUE,
} from '../src/content.js'
import { SUPPORTED } from '../src/i18n/catalogs.js'
import { isValidDay, isValidTime } from '../src/lib/time.js'

const problems = []

function fail(message) {
  problems.push(message)
}

/* ---- 1. The draft markers --------------------------------------------- */

const CONTENT_PATH = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'content.js')
const source = readFileSync(CONTENT_PATH, 'utf8')
const remaining = source
  .split('\n')
  .map((line, index) => ({ line: index + 1, text: line, trimmed: line.trim() }))
  .filter(({ text, trimmed }) => {
    if (!text.includes('// DRAFT')) return false
    // The file's own header comment explains the convention, and a continuation line inside
    // a block comment starts with `*`. Those mentions are prose about markers, not markers.
    if (trimmed.startsWith('*') || trimmed.startsWith('/*')) return false
    // The flag itself has its own finding below; listing it here as well reports one thing
    // twice and makes the count wrong.
    if (trimmed.startsWith('export const DRAFT')) return false
    return true
  })

if (remaining.length) {
  fail(
    `${remaining.length} field${remaining.length === 1 ? '' : 's'} still marked // DRAFT in src/content.js:\n` +
      remaining.map(({ line, text }) => `      line ${String(line).padStart(3)}  ${text.trim()}`).join('\n'),
  )
}

if (DRAFT) {
  fail('src/content.js still has DRAFT = true. Set it to false once every field above is real.')
}

/* ---- 2. Every translated field carries all three languages ------------ */

/**
 * A `text()` object is recognised by having exactly the supported locale keys. Walking the
 * whole export tree rather than listing fields by hand means a field added later is checked
 * without anybody remembering to add it here.
 */
function isTextObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const keys = Object.keys(value)
  return keys.length === SUPPORTED.length && SUPPORTED.every((locale) => locale in value)
}

function walk(value, path) {
  if (isTextObject(value)) {
    for (const locale of SUPPORTED) {
      const resolved = value[locale]
      const empty = Array.isArray(resolved)
        ? resolved.filter((line) => String(line).trim()).length === 0
        : !String(resolved ?? '').trim()
      // CONTACT.other is the one field allowed to be blank in every language: it is free
      // text for a LINE ID or a phone number and an empty one just hides the row.
      if (empty && !path.startsWith('CONTACT.other')) {
        fail(`${path} has no ${locale} text.`)
      }
    }
    return
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, `${path}[${index}]`))
    return
  }
  if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) walk(item, `${path}.${key}`)
  }
}

for (const [name, value] of Object.entries({
  COUPLE,
  SCHEDULE,
  VENUE,
  TRAVEL,
  BRING,
  STORY,
  PHOTOS,
  FAQ,
  CLOSING,
})) {
  walk(value, name)
}

/* ---- 3. The day ------------------------------------------------------- */

if (!isValidDay(DAY.date)) fail(`DAY.date is not a real calendar day: ${JSON.stringify(DAY.date)}`)
if (!isValidTime(DAY.start)) fail(`DAY.start is not HH:MM: ${JSON.stringify(DAY.start)}`)
if (!isValidTime(DAY.end)) fail(`DAY.end is not HH:MM: ${JSON.stringify(DAY.end)}`)

try {
  new Intl.DateTimeFormat('en', { timeZone: DAY.timezone })
} catch {
  fail(`DAY.timezone is not an IANA zone: ${JSON.stringify(DAY.timezone)}`)
}

for (const [index, row] of SCHEDULE.entries()) {
  // null is legal and means "no time given" — see content.js. Anything else must parse.
  if (row.at != null && !isValidTime(row.at)) {
    fail(`SCHEDULE[${index}].at is neither null nor HH:MM: ${JSON.stringify(row.at)}`)
  }
}

/* ---- 4. The venue and the guests -------------------------------------- */

if (!String(VENUE.mapQuery ?? '').trim()) {
  fail('VENUE.mapQuery is empty, so both map links would search for nothing.')
}

if (!GUESTS.length) {
  fail('GUESTS is empty, so the guest list section will not render. Add the fifteen, or delete this check if that is deliberate.')
}

for (const [index, photo] of PHOTOS.entries()) {
  if (!photo.src) fail(`PHOTOS[${index}] has no src.`)
  // Without real dimensions the gallery cannot reserve space and the page reflows as each
  // photograph lands, which on a phone jerks the text somebody is reading up the screen.
  if (!Number.isFinite(photo.w) || !Number.isFinite(photo.h)) {
    fail(`PHOTOS[${index}] needs numeric w and h in real pixels.`)
  }
}

/* ---- Report ----------------------------------------------------------- */

if (problems.length) {
  console.error(`\ncheck:content — ${problems.length} problem${problems.length === 1 ? '' : 's'}\n`)
  for (const problem of problems) console.error(`  ✗ ${problem}`)
  // NOT "nothing will be deployed until these are resolved" — that was true when this script
  // gated the workflow and is a lie now that it does not. The site publishes regardless; what
  // stands between a placeholder and a guest is the DRAFT banner on the page.
  console.error('\nThe site still deploys. The DRAFT banner on the page is what warns a reader.\n')
  process.exitCode = 1
} else {
  console.log('\ncheck:content — every field is filled in and structurally sound.\n')
}
