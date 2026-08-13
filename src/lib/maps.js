/**
 * The two map links.
 *
 * A SEARCH QUERY, NOT COORDINATES. Coordinates drop a pin on a point, which sounds more
 * precise and is worse: the pin has no name, "Directions" from it reads as an address
 * nobody recognises, and if the venue's own entrance is 200m up a track then the pin is
 * confidently wrong. A named search resolves to the venue's own record, with its opening
 * hours and its real driving approach.
 *
 * Both are plain links, so no CSP directive applies — `connect-src` governs fetches and
 * `frame-src` governs embeds; a top-level anchor navigation is governed by neither. That
 * is the main reason there is no embedded map iframe on this page: an iframe would mean
 * widening the CSP and loading third-party JavaScript into an invitation, to show a
 * picture of a map that every guest's own map app draws better.
 */

/** Apple Maps. Opens the native app on iOS and Maps on macOS, the web app elsewhere. */
export function appleMapsUrl(query) {
  return `https://maps.apple.com/?q=${encodeURIComponent(query)}`
}

/**
 * Google Maps, via the documented universal URL rather than a `/maps/place/...` path.
 * `api=1` is what guarantees the format stays supported and that it hands off to the
 * native app when one is installed.
 */
export function googleMapsUrl(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}
