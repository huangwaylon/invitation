/**
 * Every drawing on this page. Inline SVG, no icon dependency: a package would be a
 * bundle cost and a CSP decision for what amounts to forty paths.
 *
 * THE HOUSE STYLE, inherited from the sibling planning app so the two sites are drawn by
 * the same hand: a 24×24 box, `fill: none`, `stroke: currentColor` at 1.75, round caps and
 * joins, sized in `em` so a glyph inherits the type scale around it rather than carrying
 * its own. Every one is `aria-hidden` and none is ever the only label — each sits beside a
 * heading or inside a control with a real accessible name.
 *
 * TWO WEIGHTS, and the difference is meaning. `base` is the 1.75 stroke used for anything
 * that labels something. `hair` is 1.25 and used ONLY by the flora at the bottom of this
 * file, which label nothing — they are the ferns you notice on a second read, and drawing
 * them at the same weight as a section heading's glyph would make the page shout.
 */

const base = {
  width: '1.25em',
  height: '1.25em',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
}

/** The flora weight. Lighter, so decoration stays behind the words. */
const hair = { ...base, strokeWidth: 1.25 }

/* ======================================================================
   THE MARK
   ====================================================================== */

/**
 * Two peaks. THE COUPLE'S OWN MARK, and not invented here — it is lifted unchanged from
 * the sibling planning app, whose comment explains it best: "These two hike, and a
 * ridgeline is both theirs and — without making a joke of it — two things side by side."
 *
 * The path is byte-identical to that app's `PeaksIcon` on purpose. It is also what
 * `index.html`'s inline favicon draws and what `scripts/make-icons.js` rasterises for the
 * Home Screen tile, so all four must agree. A leaf or any other notched fan is not
 * available at this size: at a 1.75 stroke in a 24 box, a notch deep enough to read turns
 * the silhouette into a heart, which is the one thing this mark must not be.
 */
export function PeaksIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M2.5 18.5 8.6 8l3.8 6.2L15.8 9l5.7 9.5Z" />
    </svg>
  )
}

/* ======================================================================
   THE DAY — one glyph per row of the schedule
   ====================================================================== */

/**
 * A ridge tent. The day-camping mark.
 *
 * NOT CURRENTLY ON THE PAGE — the schedule opens at the ceremony now, with no arrival row for this
 * to sit beside. It stays in the set because it is the couple's own subject and the obvious glyph
 * the moment a "come early and sit on the grass" row exists. `Glyph` returns nothing for a name
 * content.js does not use, so an unused entry costs a reader nothing.
 */
export function TentIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.8v2" />
      <path d="M3.2 18.8 12 5.8l8.8 13Z" />
      {/* The door. Two lines from the apex, which is what separates a tent from a
          triangle — without them this glyph is the peaks mark with one peak. */}
      <path d="M12 5.8 8.7 18.8M12 5.8l3.3 13" />
    </svg>
  )
}

/**
 * Two rings, and a gem on one of them.
 *
 * The gem is load-bearing: two plain overlapping circles at this size read as a Venn
 * diagram or a chain link. It is also the reason there is no heart anywhere in this icon
 * set — one small unmistakable wedding glyph is enough, and it can be the accurate one.
 */
export function RingsIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="9.1" cy="13.6" r="4.6" />
      <circle cx="14.9" cy="13.6" r="4.6" />
      <path d="M14.9 9 16.2 6.7 17.5 9" />
    </svg>
  )
}

/** A picnic basket. Lunch, on one long table. */
export function BasketIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M8.4 10.2a3.6 3.6 0 0 1 7.2 0" />
      <path d="M3.6 10.2h16.8l-1.4 8.2a1.6 1.6 0 0 1-1.6 1.3H6.6A1.6 1.6 0 0 1 5 18.4Z" />
      {/* The weave. Two lines, not a grid: a grid at 20px fills in to a grey block. */}
      <path d="M9.6 13v4.4M14.4 13v4.4" />
    </svg>
  )
}

/** A camp kettle, steaming. The slow middle of the afternoon. */
export function KettleIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M9.4 7.4c0-1.2 1.2-1.5 1.2-2.7M13.2 7.4c0-1.2 1.2-1.5 1.2-2.7" />
      <path d="M8.6 11.2a3.4 3.4 0 0 1 6.8 0" />
      <path d="M6 11.2h11v4.6A3.6 3.6 0 0 1 13.4 19.4h-3.8A3.6 3.6 0 0 1 6 15.8Z" />
      <path d="M6 12.6 3.4 10.8" />
    </svg>
  )
}

/**
 * A steaming bowl, for the light dinner in town.
 *
 * A bowl rather than a plate-and-cutlery or a wine glass, and the reason is the same one the
 * sibling app gives for its Food category: a bowl reads as a meal to an English, a Japanese and a
 * Taiwanese reader alike, where a knife and fork reads as Western food specifically and a cake
 * reads as dessert. The steam is what stops it being a hat.
 */
export function BowlIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3.4 11.6h17.2a8.6 8.6 0 0 1-17.2 0Z" />
      <path d="M7 20.2h10" />
      <path d="M10 8.6c0-1.4 1.2-1.7 1.2-3.1M14 8.6c0-1.4 1.2-1.7 1.2-3.1" />
    </svg>
  )
}

/** A conifer. The short flat walk through the trees. */
export function PineIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.4 8.4 9h7.2Z" />
      <path d="M12 7.6 6.6 15h10.8Z" />
      <path d="M12 12 4.8 20h14.4Z" />
      <path d="M12 20v1.4" />
    </svg>
  )
}

/** A lantern. What gets lit when the sun goes behind the ridge. */
export function LanternIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M9.6 4.6a2.4 2.4 0 0 1 4.8 0" />
      <path d="M7.4 7h9.2" />
      <path d="M8.4 7h7.2l.8 8.6H7.6Z" />
      <path d="M6.8 15.6h10.4v2.2H6.8z" />
      {/* The flame, which is what stops this being a birdcage. */}
      <path d="M12 9.8c1 1 1.5 1.6 1.5 2.4a1.5 1.5 0 0 1-3 0c0-.8.5-1.4 1.5-2.4Z" />
    </svg>
  )
}

/**
 * A crescent and two small stars. Also not currently used: the day now ends at nine in Togoshi
 * Ginza, and a shotengai at nine is a street full of lit signs rather than a night sky, so the
 * lantern carries that row instead.
 */
export function MoonIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M14.6 3.9a8.2 8.2 0 1 0 5.6 10.4A6.8 6.8 0 0 1 14.6 3.9Z" />
      <path d="M18.4 4.6v2.2M17.3 5.7h2.2" />
    </svg>
  )
}

/* ======================================================================
   THE SECTIONS — one glyph per waypoint heading
   ====================================================================== */

/** The sun. The day itself. */
export function SunIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3.4v2.2M12 18.4v2.2M3.4 12h2.2M18.4 12h2.2" />
      <path d="m6.2 6.2 1.5 1.5M16.3 16.3l1.5 1.5M17.8 6.2l-1.5 1.5M7.7 16.3l-1.5 1.5" />
    </svg>
  )
}

/** A map pin. Where. */
export function PinIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21.2s6.6-6.3 6.6-10.6a6.6 6.6 0 1 0-13.2 0C5.4 14.9 12 21.2 12 21.2Z" />
      <circle cx="12" cy="10.6" r="2.4" />
    </svg>
  )
}

/** A compass. Getting there. */
export function CompassIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M15.2 8.8l-2 4.4-4.4 2 2-4.4Z" />
    </svg>
  )
}

/** A backpack. What to wear, what to bring. */
export function BackpackIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M8.4 7.6V6a3.6 3.6 0 0 1 7.2 0v1.6" />
      <path d="M6.6 7.6h10.8a1.4 1.4 0 0 1 1.4 1.4v9.6a1.4 1.4 0 0 1-1.4 1.4H6.6a1.4 1.4 0 0 1-1.4-1.4V9a1.4 1.4 0 0 1 1.4-1.4Z" />
      <path d="M9 13.4h6v3.4H9z" />
    </svg>
  )
}

/** A camera. Photographs. Carried over from the sibling app's `Photo` category. */
export function CameraIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 8.5h2.7l1.5-2.2h6.6l1.5 2.2h2.7a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="13.5" r="3.4" />
    </svg>
  )
}

/** A question. Good to know. */
export function QuestionIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M9.5 9.4a2.6 2.6 0 0 1 5.1.9c0 1.8-2.6 2-2.6 3.7" />
      <circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

/**
 * Two people. The fifteen.
 *
 * Carried over unchanged from the sibling app's `Guests` category, where the comment
 * notes the second figure is drawn as a partial rather than a full second body — two
 * complete figures side by side at this size collide into one blob.
 */
export function GuestsIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="9.5" cy="8.5" r="3.25" />
      <path d="M4 19.5c0-3 2.5-5.25 5.5-5.25s5.5 2.25 5.5 5.25" />
      <path d="M16 6.4a3.25 3.25 0 0 1 0 6.2M17.2 14.6c1.9.7 2.8 2.5 2.8 4.9" />
    </svg>
  )
}

/* ======================================================================
   WHAT TO BRING
   ====================================================================== */

/**
 * A hiking boot.
 *
 * A LOW SHOE WAS DRAWN HERE FIRST AND IT DID NOT WORK. A shoe in profile occupies only the
 * bottom third of the 24 box — everything above the ankle is empty — so at the 17px this glyph
 * actually renders at, it came out a third the visual size of the train and the bed beside it
 * and read as an unidentifiable mound. The boot's shaft is what fills the box, and it is the
 * better metaphor for this couple anyway.
 */
export function BootIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M8 4.4h4.6v7.4l5.6 2.4a3.2 3.2 0 0 1 2 2.9v2.7H8Z" />
      <path d="M8 8h4.6M8 10.4h4.6" />
    </svg>
  )
}

/** A fleece. The layer everybody leaves in the car. */
export function JacketIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M9.2 5.4 12 8l2.8-2.6" />
      <path d="M9.2 5.4 5.6 7.4 6.7 13l1.5-.5v7.1h7.6v-7.1l1.5.5 1.1-5.6-3.6-2" />
      <path d="M12 8v11.6" />
    </svg>
  )
}

/** A sun hat. Sun, and the mosquitoes at dusk. */
export function HatIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3.4 16.2h17.2" />
      <path d="M7.4 16.2V11.4a4.6 4.6 0 0 1 9.2 0v4.8" />
      <path d="M7.4 13.4h9.2" />
    </svg>
  )
}

/** A water bottle. There is a refill tap by the pavilion. */
export function BottleIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M10.2 3.6h3.6v3h-3.6z" />
      <path d="M9.4 6.6h5.2v12.4a1.6 1.6 0 0 1-1.6 1.6h-2A1.6 1.6 0 0 1 9.4 19Z" />
      <path d="M9.4 11.2h5.2" />
    </svg>
  )
}

/* ======================================================================
   GETTING THERE
   ====================================================================== */

/** A bullet train, nose-on. The Shinkansen to Nagano. */
export function TrainIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M5.2 17V10c0-3.3 3-5.6 6.8-5.6S18.8 6.7 18.8 10v7a1.6 1.6 0 0 1-1.6 1.6H6.8A1.6 1.6 0 0 1 5.2 17Z" />
      <path d="M6.6 11.2h10.8" />
      <path d="M8.6 15h1.6M13.8 15h1.6" />
      <path d="M8.4 18.6 7 21.2M15.6 18.6l1.4 2.6" />
    </svg>
  )
}

/** A car. The last kilometre is unpaved but flat. */
export function CarIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6.4 12.4 8.2 7.8A1.6 1.6 0 0 1 9.7 6.8h4.6a1.6 1.6 0 0 1 1.5 1l1.8 4.6" />
      <path d="M4.6 12.4h14.8a1.2 1.2 0 0 1 1.2 1.2v3.2H3.4v-3.2a1.2 1.2 0 0 1 1.2-1.2Z" />
      <circle cx="7.4" cy="16.8" r="1.8" />
      <circle cx="16.6" cy="16.8" r="1.8" />
    </svg>
  )
}

/**
 * A paper plane. Flying in.
 *
 * Carried over from the sibling app, where it marks the Honeymoon category — a paper
 * plane rather than an airliner, which at this stroke weight is a fuselage with two grey
 * lumps on it.
 */
export function PlaneIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M21.5 3.5 2.5 11.9l7.7 2.5 2.4 7.6Z" />
      <path d="M21.5 3.5 10.2 14.4" />
    </svg>
  )
}

/** A bed. Staying over. */
export function BedIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3.4 18.4v-6.6a1.8 1.8 0 0 1 1.8-1.8h13.6a1.8 1.8 0 0 1 1.8 1.8v6.6" />
      <path d="M3.4 15h17.2" />
      <path d="M3.4 8v10.4M20.6 18.4V8" />
      <path d="M6.6 12.6h3.2" />
    </svg>
  )
}

/* ======================================================================
   CHROME — the handful of glyphs that sit inside controls
   ====================================================================== */

export function CloseIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

export function CopyIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M9 8.6h9.4a.6.6 0 0 1 .6.6v9.8a.6.6 0 0 1-.6.6H9a.6.6 0 0 1-.6-.6V9.2a.6.6 0 0 1 .6-.6Z" />
      <path d="M15.4 8.6V5.8a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v9.4a1 1 0 0 0 1 1h2.4" />
    </svg>
  )
}

/** Confirmation, after the address has been copied. */
export function CheckIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="m5 12.6 4.6 4.6L19 7.4" />
    </svg>
  )
}

/** The disclosure arrow on a FAQ row. Rotated by CSS when the row is open. */
export function ChevronDownIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="m6 9.6 6 6 6-6" />
    </svg>
  )
}

/** Add to calendar. A page with a plus on it, not a date — the date is beside it. */
export function CalendarIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4.6 6.6h14.8v12.8H4.6z" />
      <path d="M4.6 10.4h14.8" />
      <path d="M8.6 4.6v3.6M15.4 4.6v3.6" />
      <path d="M12 12.8v4M10 14.8h4" />
    </svg>
  )
}

export function EnvelopeIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3.5 6.5h17v11h-17z" />
      <path d="m3.5 7.5 8.5 6.2 8.5-6.2" />
    </svg>
  )
}

/* ======================================================================
   THE FLORA — decoration, and nothing else
   ======================================================================
   Drawn at the `hair` weight, painted in --flora (the faintest colour in the palette),
   and every one is aria-hidden with no accessible name anywhere near it. They sit BESIDE
   the trail between waypoints and carry no information at all: a reader who cannot see
   them, or who has images and CSS off entirely, loses nothing but the second read.

   Which is exactly why they are allowed to sit at 1.9:1 contrast. If any of these ever
   starts labelling something, it has to move up to the `base` weight and --ink-3, and
   check-contrast.js needs a new row. */

/** A fern frond. Four pairs of leaflets, tapering. */
export function FernIcon(props) {
  return (
    <svg {...hair} {...props}>
      <path d="M12 21.5V4" />
      <path d="M12 19.2c-1.9 0-3.2-.9-3.7-2.5 1.9-.4 3.2.5 3.7 2.5ZM12 19.2c1.9 0 3.2-.9 3.7-2.5-1.9-.4-3.2.5-3.7 2.5Z" />
      <path d="M12 15.4c-1.7 0-2.9-.8-3.3-2.2 1.7-.4 2.9.4 3.3 2.2ZM12 15.4c1.7 0 2.9-.8 3.3-2.2-1.7-.4-2.9.4-3.3 2.2Z" />
      <path d="M12 11.7c-1.4 0-2.4-.7-2.8-1.9 1.4-.3 2.4.3 2.8 1.9ZM12 11.7c1.4 0 2.4-.7 2.8-1.9-1.4-.3-2.4.3-2.8 1.9Z" />
      <path d="M12 8.2c-1 0-1.8-.5-2.1-1.4 1-.2 1.8.2 2.1 1.4ZM12 8.2c1 0 1.8-.5 2.1-1.4-1-.2-1.8.2-2.1 1.4Z" />
    </svg>
  )
}

/** A wildflower — five petals, a leaf, a stem. */
export function WildflowerIcon(props) {
  return (
    <svg {...hair} {...props}>
      <path d="M12 21.5V11.5" />
      <path d="M12 16.6c-1.7-.2-2.8-1.3-3-3 1.7.2 2.8 1.3 3 3Z" />
      <circle cx="12" cy="5.8" r="1.8" />
      <circle cx="15.1" cy="8" r="1.8" />
      <circle cx="13.9" cy="11.6" r="1.8" />
      <circle cx="10.1" cy="11.6" r="1.8" />
      <circle cx="8.9" cy="8" r="1.8" />
      <circle cx="12" cy="8.8" r="1.2" />
    </svg>
  )
}

/** A mushroom, spotted. */
export function MushroomIcon(props) {
  return (
    <svg {...hair} {...props}>
      <path d="M4.8 11.9c0-4 3.2-6.9 7.2-6.9s7.2 2.9 7.2 6.9Z" />
      <path d="M9.8 11.9v5.4a2.2 2.2 0 0 0 4.4 0v-5.4" />
      <circle cx="9.3" cy="9.1" r="0.9" />
      <circle cx="14.6" cy="8.4" r="0.7" />
    </svg>
  )
}

/**
 * Two birds, mid-flight. Two arcs each is all a bird at this size can afford to be.
 *
 * They are DIFFERENT SIZES and offset vertically, which is the whole difference between this
 * reading as birds and reading as a tilde: two identical arcs at the same baseline are a wavy
 * line, and that is what the first version of this glyph looked like on the page.
 */
export function BirdIcon(props) {
  return (
    <svg {...hair} {...props}>
      <path d="M2.6 11.4c2-2.5 4-2.5 6 0" />
      <path d="M9.6 14.2c2.5-3.1 5-3.1 7.5 0" />
    </svg>
  )
}

/** A snail. The one glyph on the page that is purely a joke, and it earns its place. */
export function SnailIcon(props) {
  return (
    <svg {...hair} {...props}>
      <path d="M4.2 18.4h9.6a5.5 5.5 0 1 0-5.5-5.5" />
      <path d="M8.3 12.9a2.6 2.6 0 1 0 2.6 2.6" />
      <path d="M4.2 18.4c-1.1 0-1.8-.8-1.8-1.9v-2.2" />
      <path d="M2.4 14.3 1.2 12.6M2.4 14.3l1.5-1.7" />
    </svg>
  )
}

/** An acorn. */
export function AcornIcon(props) {
  return (
    <svg {...hair} {...props}>
      <path d="M12 5.2V3.4" />
      <path d="M7.2 9.6a4.8 4.8 0 0 1 9.6 0Z" />
      <path d="M7.2 9.6h9.6l-.6 4.6a4.4 4.4 0 0 1-8.4 0Z" />
    </svg>
  )
}

/** A leaf, with one vein. */
export function LeafIcon(props) {
  return (
    <svg {...hair} {...props}>
      <path d="M4.6 19.4C4.6 11 9.6 5.6 19.4 4.6c1 9.8-4.4 14.8-14.8 14.8Z" />
      <path d="M4.6 19.4 14.2 9.8" />
    </svg>
  )
}

/** A cloud. */
export function CloudIcon(props) {
  return (
    <svg {...hair} {...props}>
      <path d="M7 17.4h10a3.4 3.4 0 0 0 .3-6.8 5 5 0 0 0-9.5.6A3.2 3.2 0 0 0 7 17.4Z" />
    </svg>
  )
}

/* ======================================================================
   THE REGISTRY
   ====================================================================== */

/**
 * Name → glyph, so `content.js` can say `icon: 'kettle'` and stay pure data with no JSX
 * import. Keys are the strings that appear in that file; `test/content.test.js` asserts
 * every one of them resolves, which is what stops a typo from silently dropping a glyph.
 */
export const GLYPHS = {
  peaks: PeaksIcon,
  tent: TentIcon,
  rings: RingsIcon,
  basket: BasketIcon,
  bowl: BowlIcon,
  kettle: KettleIcon,
  pine: PineIcon,
  lantern: LanternIcon,
  moon: MoonIcon,
  sun: SunIcon,
  pin: PinIcon,
  compass: CompassIcon,
  backpack: BackpackIcon,
  camera: CameraIcon,
  question: QuestionIcon,
  guests: GuestsIcon,
  boot: BootIcon,
  jacket: JacketIcon,
  hat: HatIcon,
  bottle: BottleIcon,
  train: TrainIcon,
  car: CarIcon,
  plane: PlaneIcon,
  bed: BedIcon,
  calendar: CalendarIcon,
  envelope: EnvelopeIcon,
}

/**
 * The glyph for a name, or NOTHING AT ALL.
 *
 * Nothing rather than a fallback glyph: a wrong picture beside a heading is worse than no
 * picture, and the heading always carries the meaning on its own. Same courtesy the
 * sibling app's `CategoryIcon` extends for a category it does not recognise.
 */
export function Glyph({ name, ...props }) {
  const Component = GLYPHS[String(name ?? '').trim()]
  return Component ? <Component {...props} /> : null
}

/**
 * The flora, in the order they are scattered down the trail.
 *
 * An ARRAY rather than a map, because the caller indexes into it by waypoint number — the
 * point is that the same waypoint always gets the same plant, so the page does not
 * reshuffle its own decoration between renders or between languages. The snail is
 * deliberately last: it lands beside the closing note.
 */
export const FLORA = [
  FernIcon,
  WildflowerIcon,
  BirdIcon,
  MushroomIcon,
  LeafIcon,
  FernIcon,
  AcornIcon,
  CloudIcon,
  WildflowerIcon,
  SnailIcon,
]
