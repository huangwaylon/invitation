/**
 * All fifteen, set in the serif, one to a line, in the groups content.js puts them in.
 *
 * Not a grid of cards, not avatars, not a table. Fifteen people is small enough that the warmest
 * thing this page can do is write them all out — which is the same reason there is no seating chart
 * anywhere in this app: with one long table, the plan is that people sit down.
 *
 * THE GROUPS CARRY NO HEADINGS, deliberately. A label per group would mean inventing a relationship
 * for each one, and getting "Waylon's side" wrong on a wedding invitation is worse than leaving the
 * clusters to speak for themselves. So each group is its own `<ul>` with a gap between them — which
 * also gives a screen reader five short lists rather than one list of fifteen, matching what a
 * sighted reader sees.
 */

import { GUESTS } from '../content.js'

export default function Guests() {
  return (
    <div className="guests">
      {GUESTS.map((group, groupIndex) => (
        // Indices as keys: nothing here reorders or animates, and two people may legitimately be
        // listed identically ("Grandma" twice, for two different grandmothers).
        <ul className="guests__group" key={groupIndex}>
          {group.map((name, index) => (
            <li className="guests__row" key={index}>
              <span>{name}</span>
            </li>
          ))}
        </ul>
      ))}
    </div>
  )
}
