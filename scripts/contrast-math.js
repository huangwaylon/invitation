/**
 * WCAG relative-luminance maths, alone in a file so it can be imported without
 * running anything.
 *
 * `check-contrast.js` prints a report the moment it is imported, which is right for a
 * CLI and wrong for `test/contrast.test.js` — that test wants the two functions and
 * none of the output. Splitting them is cheaper than a `process.argv` guard and leaves
 * no way to get it wrong.
 */

function srgb(hex) {
  const clean = hex.replace('#', '')
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255)
}

/** WCAG 2.x relative luminance. The 0.03928 threshold and 2.4 exponent are the spec's. */
function luminance(hex) {
  const [r, g, b] = srgb(hex).map((channel) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  )
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** The contrast ratio between two opaque colours. Order does not matter. */
export function contrast(a, b) {
  const la = luminance(a)
  const lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/**
 * Composite `colour` at `alpha` over an opaque `base`, so a scrim's worst case can be
 * MEASURED rather than guessed. Straight alpha in sRGB — which is what the browser
 * actually does when it paints one layer over another, gamma and all.
 */
export function over(base, colour, alpha) {
  const b = srgb(base)
  const c = srgb(colour)
  const mixed = b.map((channel, i) => channel * (1 - alpha) + c[i] * alpha)
  const hex = mixed.map((channel) =>
    Math.round(channel * 255)
      .toString(16)
      .padStart(2, '0'),
  )
  return `#${hex.join('')}`
}
