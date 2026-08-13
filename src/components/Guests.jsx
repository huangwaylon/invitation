/**
 * The fifteen. A list of names, set in the serif, one to a line.
 *
 * Not a grid of cards, not avatars, not a table. Fifteen people is small enough that the
 * warmest thing this page can do is write them all out — which is the same reason there is
 * no seating chart anywhere in this app: with one long table, the plan is that people sit
 * down.
 *
 * `<ul>` and not `<ol>`: the order in content.js is not a ranking, and a screen reader
 * announcing "item 4 of 15" for a guest list would imply one.
 */

import { GUESTS } from '../content.js'

export default function Guests() {
  return (
    <ul className="guests">
      {GUESTS.map((name, index) => (
        // A name is not a stable key, but nothing here reorders or animates, and two guests
        // may legitimately be listed identically ("The Watanabes" twice for two households).
        <li className="guests__row" key={index}>
          <span>{name}</span>
        </li>
      ))}
    </ul>
  )
}
