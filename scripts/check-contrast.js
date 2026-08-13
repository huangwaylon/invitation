/**
 * Contrast check for the invitation's palette. Not part of the build — run it when a
 * colour changes, paste the numbers next to the values in tokens.css, and fix anything
 * that FAILs.
 *
 *   npm run contrast
 *
 * Ported from the sibling planning app's script and extended for this palette's two
 * additions: the dashed trail, and ink over the hero photograph.
 *
 * WHAT EACH THRESHOLD IS. 4.5:1 is WCAG AA for body text, 3:1 for text at 24px+ or 19px
 * bold, and 3:1 is also the floor for a GRAPHIC that carries information (1.4.11). The
 * trail, the node rings and the flora carry none — they are `aria-hidden` decoration,
 * and a reader who cannot see them gets the same headings in the same order — so they
 * are printed as INFO rather than asserted. INFO still catches a regression; it just
 * does not claim a standard that does not apply.
 */

import { contrast, over } from './contrast-math.js'

const BG = '#faf7f4'
const SURFACE = '#ffffff'
const SUNKEN = '#f3ece7'

const INK = { ink: '#1c1a17', 'ink-2': '#56504a', 'ink-3': '#736a61', 'ink-4': '#8c8377' }

const ACCENT = '#385844'
const ACCENT_HOVER = '#2d4737'
const ACCENT_WASH = '#e8f0ea'
const OCHRE = '#6b4d17'

/**
 * The trail and the flora. Below 3:1 on purpose (see the header), but NOT invisible:
 * the dashed path and the node rings are the only thing holding this layout's shape
 * together, so they are tuned up near 3:1 while the flora stays a whisper behind them.
 */
const DECOR = { trail: '#a68f70', 'trail-node': '#9d8768', flora: '#c2b49c' }

let failures = 0

function row(label, ratio, floor) {
  const value = ratio.toFixed(2)
  if (floor == null) {
    console.log(`  INFO  ${label.padEnd(48)} ${value}`)
    return
  }
  const ok = ratio >= floor
  if (!ok) failures += 1
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${label.padEnd(48)} ${value} (needs ${floor})`)
}

console.log('\nInk on the three surfaces — AA body text, 4.5:1')
for (const [name, hex] of Object.entries(INK)) {
  // ink-4 is placeholder and disabled text only: it never carries information, so it is
  // held to the 3:1 graphic floor rather than 4.5:1. Same carve-out as the sibling app.
  const floor = name === 'ink-4' ? 3 : 4.5
  row(`${name} on bg`, contrast(hex, BG), floor)
  row(`${name} on surface`, contrast(hex, SURFACE), floor)
  row(`${name} on sunken`, contrast(hex, SUNKEN), floor)
}

console.log('\nSage accent — the one hue that carries anything')
row('white on accent', contrast('#ffffff', ACCENT), 4.5)
row('white on accent-hover', contrast('#ffffff', ACCENT_HOVER), 4.5)
row('accent on bg', contrast(ACCENT, BG), 4.5)
row('accent on surface', contrast(ACCENT, SURFACE), 4.5)
row('accent on accent-wash', contrast(ACCENT, ACCENT_WASH), 4.5)
row('accent-wash on bg (a filled chip against paper)', contrast(ACCENT_WASH, BG), null)

console.log('\nOchre — small details, and the one non-sage ink')
row('white on ochre', contrast('#ffffff', OCHRE), 4.5)
row('ochre on bg', contrast(OCHRE, BG), 4.5)
row('ochre on surface', contrast(OCHRE, SURFACE), 4.5)

console.log('\nDecoration — aria-hidden, so INFO not a floor. Visible, not compliant.')
for (const [name, hex] of Object.entries(DECOR)) {
  row(`${name} on bg`, contrast(hex, BG), null)
  row(`${name} on surface`, contrast(hex, SURFACE), null)
}

console.log('\nFocus ring — must clear 3:1 against every surface it can land on')
for (const [name, hex] of Object.entries({
  bg: BG,
  surface: SURFACE,
  sunken: SUNKEN,
  wash: ACCENT_WASH,
})) {
  row(`ring on ${name}`, contrast(ACCENT, hex), 3)
}

/**
 * Over the photograph the background is UNKNOWN, so ink there cannot be measured
 * against a token — it is measured against the worst case the scrim allows, which is a
 * blown-out white sky beneath the gradient's densest stop.
 */
console.log('\nOver the hero photograph — worst case is a white sky under the densest stop')
const DENSE = 0.72
const worst = over('#ffffff', '#181410', DENSE)
row(`white ink over a ${DENSE} scrim on a white sky`, contrast('#ffffff', worst), 4.5)
row('photo-ink-2 (92% white) over the same', contrast(over(worst, '#ffffff', 0.92), worst), null)
// Kept in the output as INFO, not as an assertion: this row is DESIGNED to be too low.
// It exists so that anybody tempted to lighten the scrim sees what it would cost first.
row('the same at a 0.50 scrim — why it is not lighter', contrast('#ffffff', over('#ffffff', '#181410', 0.5)), null)

console.log(failures ? `\n${failures} FAILED\n` : '\nAll floors met.\n')
if (failures) process.exitCode = 1
