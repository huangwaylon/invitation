/**
 * English catalog — the default, and the fallback for a key another catalog is missing.
 *
 * Flat keys, dot-namespaced by surface. A pluralised value is an object keyed by CLDR
 * category, which is the only case where a value is not a string.
 *
 * WHAT BELONGS HERE: chrome. Section headings, button labels, the countdown. WHAT DOES
 * NOT: anything about this particular wedding — that is `src/content.js`, which holds
 * its own three languages per field. The split is what lets somebody change the
 * ceremony time without opening an i18n file.
 *
 * `test/i18n.test.js` fails on a key nothing references, a referenced key that is
 * missing here, and any key the other two catalogs do not also have.
 */
export default {
  /* The document title. The couple's names come from content.js and are appended by
     `syncDocumentLocale`, so this is only the part after them. */
  'app.title': 'Wedding invitation',

  'skip.toContent': 'Skip to the invitation',

  /* The language switch. `aria-label` on the group; each option labels itself from
     LOCALE_NAMES, so there is no per-language key here. */
  'lang.label': 'Language',

  /* ---- The hero ---------------------------------------------------------- */
  /* Sits above the names. Deliberately not "You are invited": the page IS the
     invitation, and announcing itself is a thing paper does not need to do. */
  'hero.eyebrow': 'Come and spend the day with us',
  'hero.dateTbc': 'Date to be confirmed',

  'countdown.days': { one: '{count} day to go', other: '{count} days to go' },
  'countdown.today': 'Today is the day',
  'countdown.past': { one: 'Yesterday', other: '{count} days ago' },

  /* ---- Section headings — the waypoints, in page order ------------------- */
  'section.day': 'The day',
  'section.where': 'Where',
  'section.travel': 'Getting there',
  'section.bring': 'What to wear, what to bring',
  'section.story': 'How we got here',
  'section.photos': 'Photographs',
  'section.faq': 'Good to know',
  'section.guests': 'The fifteen',

  /* ---- Where ------------------------------------------------------------- */
  'venue.openApple': 'Open in Maps',
  'venue.openGoogle': 'Open in Google Maps',
  'venue.copyAddress': 'Copy the address',
  'venue.copied': 'Address copied',
  'venue.phone': 'The venue, on the day',

  /* ---- What to wear ------------------------------------------------------ */
  'bring.dress': 'Dress',
  'bring.kit': 'Worth having in a bag',

  /* ---- Photographs ------------------------------------------------------- */
  'photos.open': 'View larger',
  'photos.close': 'Close',

  /* ---- Closing ----------------------------------------------------------- */
  'calendar.add': 'Add the day to your calendar',
  /* Says what the button does before it does it, because on iOS a .ics opens a
     system sheet rather than downloading, and an unexplained system sheet is alarming. */
  'calendar.hint': 'Downloads a calendar file. Nothing is sent to us.',
  'contact.title': 'Any question at all',
  'contact.email': 'Email us',

  /* Below everything, in the smallest type on the page. */
  'footer.madeWith': 'Made by the two of us',
}
