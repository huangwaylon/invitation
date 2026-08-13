/**
 * EVERY FACT ABOUT THE DAY LIVES HERE. Nothing else in the app hardcodes a date, a
 * place, a time or a name — components read this file and render whatever is in it.
 *
 * WHY ONE FILE. There is no backend and no spreadsheet: this is a static page for
 * fifteen people. So the alternative to one content module is facts sprinkled through
 * a dozen JSX files, where changing the ceremony time means grepping. Keep it here.
 *
 * THIS FILE MUST STAY PURE DATA — plain exports, no imports, no `import.meta`, no
 * browser globals. `vite.config.js` imports it in Node to generate the .ics at build
 * time, and `scripts/check-content.js` imports it too. A browser-only reference here
 * breaks both.
 *
 * ---------------------------------------------------------------------------
 * DRAFT. Everything below marked `// DRAFT` is a placeholder I invented so the page
 * renders and can be looked at. Replace each one, then set DRAFT = false. Until then
 * `npm run check:content` fails and the deploy workflow refuses to publish — which is
 * the point: fifteen people should not receive a plausible-looking wrong address.
 * README.md carries the checklist.
 * ---------------------------------------------------------------------------
 */

export const DRAFT = true // DRAFT — set false once every field below is real.

/**
 * A translated string. Three arguments, always in this order, and NONE of them
 * optional: a missing Japanese line would silently fall back to English mid-page,
 * which reads as a bug rather than as a choice. `test/content.test.js` enforces it.
 *
 * These are not translations of each other and must not be. The gift note is the
 * clearest case — ご祝儀 and 紅包 and "your presence is the present" are three
 * different customs, not one sentence in three languages.
 */
export const text = (en, ja, zh) => ({ en, ja, 'zh-Hant': zh })

/**
 * The couple, per locale, so a Japanese guest can read 明日香 and everyone else reads
 * Asuka. Latin in all three slots is a fine answer — fill in kanji only if you want it.
 */
export const COUPLE = {
  one: text('Waylon', 'ウェイロン', '偉倫'), // DRAFT — the CJK renderings are guesses.
  two: text('Asuka', '明日香', '明日香'), // DRAFT — 明日香 / あすか / アスカ, your call.
  /** Whose name comes first. Not alphabetised, not gendered — just a decision. */
  order: ['one', 'two'],
}

/**
 * The day itself.
 *
 * `date` is a WALL-CLOCK CALENDAR DAY — 'YYYY-MM-DD', no time, no zone, no Z. The
 * countdown resolves "today" in `timezone` and subtracts, so it flips at midnight at
 * the venue rather than at midnight wherever the guest is standing. A guest reading
 * this in California must not be told "2 days" while Tokyo is already on the 1.
 *
 * NEVER `new Date(date)` on this string: that parses as UTC midnight and renders as
 * the previous day for anybody west of Greenwich. `lib/time.js` is the only place
 * allowed to turn it into a Date.
 */
export const DAY = {
  date: '2027-05-15', // DRAFT — a Saturday.
  /** IANA zone of the VENUE. Decides what "today" means for the countdown. */
  timezone: 'Asia/Tokyo',
  /** 'HH:MM' 24-hour wall clock in `timezone`. Formatted per locale at render. */
  start: '11:00', // DRAFT
  end: '19:00', // DRAFT
}

/**
 * The schedule. One entry per waypoint on the trail, in order.
 *
 * `icon` names a glyph in `components/icons.jsx`. An unknown name renders no glyph
 * rather than a fallback one — a wrong picture is worse than none.
 *
 * `at` is 'HH:MM' or null. Null prints no time at all, which is the honest way to say
 * "somewhere in the afternoon" — a made-up 15:30 becomes a promise.
 */
export const SCHEDULE = [
  {
    at: '11:00', // DRAFT
    icon: 'tent',
    title: text('Arrive & wander', '集合・散策', '抵達・散步'),
    note: text(
      'Come whenever suits. There is coffee, there are chairs in the shade, and nobody is being seated in rows.',
      'お好きな時間にお越しください。コーヒーと木陰の椅子をご用意しています。席順はありません。',
      '請隨意前來。備有咖啡與樹蔭下的座位，不需照順序入座。',
    ),
  },
  {
    at: '12:00', // DRAFT
    icon: 'rings',
    title: text('The ceremony', '挙式', '婚禮儀式'),
    note: text(
      'Outside, on the grass, and short — about twenty minutes. If it rains we move under the pavilion and nothing else changes.',
      '芝生の上で、二十分ほどの短い式です。雨天の場合はパビリオンに移動しますが、それ以外は変わりません。',
      '在草地上舉行，大約二十分鐘。若遇雨天則移至涼亭，其餘一切照舊。',
    ),
  },
  {
    at: '12:45', // DRAFT
    icon: 'basket',
    title: text('Long lunch', '会食', '午宴'),
    note: text(
      'Set out on one long table under the trees. Tell us in advance about anything you cannot eat and we will simply make sure there is something for you.',
      '木陰の長いテーブルに料理を並べます。お召し上がりになれないものがあれば、事前にお知らせください。',
      '在樹下的長桌上擺開。若有任何飲食禁忌，請提前告訴我們。',
    ),
  },
  {
    at: '15:00', // DRAFT
    icon: 'kettle',
    title: text('Coffee, cake, cards', 'コーヒーとケーキ', '咖啡、蛋糕、紙牌'),
    note: text(
      'The slow middle of the day. Blankets out, shoes off, a hand of cards if you want one.',
      '一日のいちばんのんびりした時間です。ブランケットを広げて、靴を脱いで、トランプでも。',
      '一天中最悠閒的時光。攤開毯子、脫掉鞋子，想玩牌也可以。',
    ),
  },
  {
    at: '16:30', // DRAFT
    icon: 'pine',
    title: text('A short walk', '散歩', '散步'),
    note: text(
      'Forty minutes on a flat loop, entirely optional, and the reason we keep mentioning your shoes.',
      '平坦な道を四十分ほど。任意ですが、靴のことを繰り返しお伝えしている理由です。',
      '平緩的環形步道，約四十分鐘。純屬自由參加，也是我們一直提醒您留意鞋子的原因。',
    ),
  },
  {
    at: '18:00', // DRAFT
    icon: 'lantern',
    title: text('Lanterns & last drinks', 'ランタンと乾杯', '燈火與最後一杯'),
    note: text(
      'It gets genuinely cold once the sun is behind the ridge. Bring the extra layer you were going to leave in the car.',
      '日が尾根に隠れると本当に冷えます。車に置いていこうとした一枚を、ぜひお持ちください。',
      '太陽落到山脊後會真的變冷。原本想留在車上的那件外套，請帶著。',
    ),
  },
  {
    at: '19:00', // DRAFT
    icon: 'moon',
    title: text('Home', 'お開き', '散會'),
    note: text(
      'Last shuttle down at seven. We will be the two people waving.',
      '最終の送迎は十九時です。手を振っている二人が私たちです。',
      '最後一班接送於十九點發車。揮手的那兩個人就是我們。',
    ),
  },
]

/** Where. `mapQuery` is a plain search string — `lib/maps.js` builds both map links. */
export const VENUE = {
  name: text('Hakuba Highland Garden', '白馬ハイランドガーデン', '白馬高原花園'), // DRAFT
  /** One line under the name. Where it is, in words, for somebody who does not know. */
  area: text('Hakuba, Nagano', '長野県白馬村', '長野縣白馬村'), // DRAFT
  /**
   * The postal address as it should be READ, one line per array entry. Not one string
   * with commas: Japanese and Chinese addresses run largest-unit-first and break in
   * different places than an English one, so each locale gets its own lines.
   */
  address: text(
    ['Hakuba Highland Garden', '1234 Hokujo, Hakuba-mura', 'Kitaazumi-gun, Nagano 399-9301', 'Japan'],
    ['〒399-9301', '長野県北安曇郡白馬村北城1234', '白馬ハイランドガーデン'],
    ['〒399-9301', '日本 長野縣北安曇郡白馬村北城1234', '白馬高原花園'],
  ), // DRAFT — every line.
  /** What both map links search for. Keep it unambiguous; a bare venue name may not be. */
  mapQuery: 'Hakuba Highland Garden, Hakuba, Nagano, Japan', // DRAFT
  /** Optional. Empty string hides the row. */
  phone: '', // DRAFT — the venue's number, for the day itself.
}

/**
 * Getting there and staying over.
 *
 * `icon` again names a glyph. Each entry is a heading and a short paragraph — no
 * nested structure, because a guest reading this on a phone in a station wants three
 * sentences, not a table.
 */
export const TRAVEL = [
  {
    icon: 'train',
    title: text('By train', '電車で', '搭電車'),
    note: text(
      'Hokuriku Shinkansen to Nagano, then the express bus — about 70 minutes. We will meet the 10:05 arrival.',
      '北陸新幹線で長野駅まで、そこから高速バスで約70分です。10:05着に合わせてお迎えにあがります。',
      '搭北陸新幹線至長野站，再轉高速巴士約70分鐘。我們會在10:05抵達的班次接您。',
    ), // DRAFT
  },
  {
    icon: 'car',
    title: text('By car', '車で', '自行開車'),
    note: text(
      'Free parking on site, and the last kilometre is unpaved but flat. Sat-nav gets it right; the venue sign is small.',
      '駐車場は無料です。最後の1kmは未舗装ですが平坦です。カーナビは正確ですが、看板は小さめです。',
      '現場提供免費停車，最後一公里是未鋪面道路但相當平坦。導航能正確帶到，但招牌不大。',
    ), // DRAFT
  },
  {
    icon: 'plane',
    title: text('Flying in', '飛行機で', '搭飛機'),
    note: text(
      'Haneda or Narita, then the Shinkansen from Tokyo Station. Give yourself the extra hour — it is a real journey, not a transfer.',
      '羽田または成田から、東京駅で新幹線に乗り換えてください。乗り継ぎというより一つの旅程です、余裕をみてお越しください。',
      '從羽田或成田入境，再於東京站轉乘新幹線。請多留一小時——這是一段旅程，不只是轉乘。',
    ), // DRAFT
  },
  {
    icon: 'bed',
    title: text('Staying over', '宿泊', '住宿'),
    note: text(
      'Most people are staying two nights in the village. We have held rooms at a small inn ten minutes away — ask us and we will send the details.',
      '多くの方が村内に二泊されます。徒歩十分の小さな旅館に部屋を確保していますので、ご希望の方はお声がけください。',
      '多數人會在村裡住兩晚。我們在步行十分鐘的小旅館保留了房間，需要的話請告訴我們。',
    ), // DRAFT
  },
]

/**
 * What to wear and what to bring.
 *
 * ONE LIST, NOT TWO. A dress code section and a packing section would say the same
 * thing twice — at an outdoor wedding "what to wear" IS "what to bring". The first
 * entry carries the dress code and the rest are the day-camp kit.
 */
export const BRING = {
  dress: text(
    'Garden formal, and we mean the garden part. Anything you would happily wear to a nice lunch outdoors. No black tie, no heels that need a hard floor.',
    'ガーデンフォーマルで、ガーデンのほうを重んじてください。屋外の食事会に着ていける服装で十分です。ブラックタイも、硬い床が必要なヒールも不要です。',
    '花園正裝，重點在「花園」。任何您樂意穿去戶外午餐的衣著都合適。不需要小禮服領結，也別穿需要硬地面的高跟鞋。',
  ),
  kit: [
    {
      icon: 'boot',
      label: text('Shoes for grass', '芝生で歩ける靴', '適合草地的鞋'),
      note: text('Flat, and you will not mind if they get damp.', '平らで、少し濡れても気にならないもの。', '平底，而且不怕稍微沾濕。'),
    },
    {
      icon: 'jacket',
      label: text('A warm layer', '羽織るもの', '一件保暖外層'),
      note: text('The temperature drops fast at sunset. Every year, everyone forgets.', '日没後は一気に冷えます。毎年、皆さん忘れます。', '日落後氣溫驟降。每年大家都忘記。'),
    },
    {
      icon: 'hat',
      label: text('Sun & bugs', '日焼け・虫対策', '防曬與防蟲'),
      note: text('Hat, sunscreen, and something for mosquitoes at dusk.', '帽子、日焼け止め、そして夕暮れの蚊対策を。', '帽子、防曬，以及黃昏時的防蚊用品。'),
    },
    {
      icon: 'bottle',
      label: text('A water bottle', '水筒', '水壺'),
      note: text('There is a refill tap by the pavilion.', 'パビリオン横に給水があります。', '涼亭旁有補水處。'),
    },
  ],
}

/**
 * The story, as a handful of stops rather than a paragraph. `year` prints as-is, so
 * it can be a year, a season, or a dash — it is a label, not a parsed date.
 */
export const STORY = [
  {
    year: '2019', // DRAFT
    title: text('A wrong turn', '道を間違えて', '走錯了路'),
    note: text(
      'We met on a trail neither of us was supposed to be on, both holding the same badly folded map.',
      '本来歩くはずのなかった登山道で、二人とも同じ折り方の下手な地図を持っていました。',
      '我們在一條原本都不該走的步道上相遇，手裡拿著同一張摺得亂七八糟的地圖。',
    ), // DRAFT
  },
  {
    year: '2021', // DRAFT
    title: text('The stove incident', 'ストーブ事件', '爐子事件'),
    note: text(
      'First trip with a camp stove. First trip we ate cold rice. We have since become quite good at this.',
      '初めてストーブを持って行った旅。初めて冷や飯を食べた旅。あれから二人とも、だいぶ上手くなりました。',
      '第一次帶爐子出門，也是第一次吃冷飯。從那之後，我們的手藝進步了不少。',
    ), // DRAFT
  },
  {
    year: '2024', // DRAFT
    title: text('Eleven countries in', '十一か国目', '走過十一個國家'),
    note: text(
      'Somewhere between a night bus and a very good bowl of noodles, it became obvious.',
      '夜行バスと、とても美味しい一杯の麺のあいだのどこかで、答えは明らかになりました。',
      '在一班夜車與一碗極好的麵之間，答案已經很明白了。',
    ), // DRAFT
  },
  {
    year: '2027', // DRAFT
    title: text('This bit', 'そして、この日', '而現在'),
    note: text(
      'Fifteen of you, one long table, and a flat loop through the trees. That is the whole plan.',
      '十五人の皆さんと、一つの長いテーブルと、木立をめぐる平坦な道。それが計画のすべてです。',
      '十五位親友、一張長桌，以及一條穿過樹林的平緩步道。這就是全部的計畫。',
    ),
  },
]

/**
 * The one photograph at the top of the page, or none.
 *
 * NONE IS THE DEFAULT, and the hero it produces is a drawn one — a dashed card with the
 * couple's mark set into its top edge — not a broken-image box. That variant has to stand
 * on its own, because it is what the page looks like until somebody picks a photograph.
 *
 * `src` is relative to `public/`. `alt` is intentionally EMPTY and should stay that way:
 * the <h1> directly beneath names the couple, so describing the photograph as well says
 * the same thing twice to a screen reader.
 */
export const HERO = {
  src: '', // DRAFT — e.g. 'hero.jpg', dropped into public/
}

/**
 * The gallery. EMPTY IS A VALID STATE and the section simply does not render — a
 * gallery of placeholder rectangles is worse than no gallery.
 *
 * `src` is relative to `public/photos/`. Every entry needs `w`/`h` in real pixels:
 * they set the CSS aspect-ratio so the page does not reflow as images land, which on
 * a phone means the text you were reading does not jump.
 *
 * `alt` is per-locale and must DESCRIBE, not caption — "the two of us on a ridge at
 * dawn", not "our favourite photo".
 */
export const PHOTOS = [
  // DRAFT — drop files into public/photos/ and describe them here. For example:
  // { src: 'ridge.jpg', w: 1600, h: 1067, alt: text('The two of us on a ridge at dawn', '夜明けの尾根に立つ二人', '黎明時分站在山脊上的兩人') },
]

/**
 * Everybody who is coming. EMPTY IS VALID and hides the section.
 *
 * Fifteen people is small enough that naming them is the warmest thing the page can
 * do, and it is also why there is no seating chart anywhere in this app: with one
 * long table, the plan is that people sit down.
 */
export const GUESTS = [
  // DRAFT — the fifteen, however they would like to be named. Plain strings:
  // 'Kenji & Mika', 'Auntie Su-lin', 'The Watanabes (all four)',
]

/**
 * Questions worth answering before somebody has to ask. `<details>` rows, closed by
 * default, so the page stays short for the fourteen people who do not need them.
 */
export const FAQ = [
  {
    q: text('Are children invited?', '子どもも参加できますか？', '可以帶小孩嗎？'),
    a: text(
      'Yes, and there is a lot of grass to run on. Let us know how many and how old so we can feed them properly.',
      'はい、走り回れる芝生がたくさんあります。人数と年齢をお知らせいただければ、お食事を用意します。',
      '當然可以，這裡有很大片草地可以跑。請告訴我們人數與年齡，好準備他們的餐點。',
    ),
  },
  {
    q: text('What happens if it rains?', '雨が降ったら？', '如果下雨怎麼辦？'),
    a: text(
      'Everything moves under the pavilion, which is covered and heated, and the day carries on. Only the walk is cancelled.',
      'すべてパビリオンに移ります。屋根と暖房がありますので、そのまま続けます。中止になるのは散歩だけです。',
      '一切移到涼亭進行，那裡有屋頂也有暖氣，行程照常。只有散步會取消。',
    ),
  },
  {
    q: text('Gifts', 'ご祝儀について', '禮金與禮物'),
    a: text(
      'Please do not. You are travelling a long way to stand in a field with us and that is comfortably enough. If you truly want to bring something, bring a photograph you took.',
      'どうぞお気遣いなく。遠方から足をお運びいただくだけで十分です。もし何かお持ちいただけるなら、ご祝儀ではなく、あなたが撮った一枚の写真を。',
      '請不必費心。您願意遠道而來陪我們站在一片草地上，這樣就非常足夠了。若真想帶點什麼，就帶一張您親手拍的照片吧。',
    ),
  },
  {
    q: text('Can I bring someone?', '同伴者を連れて行けますか？', '可以帶伴嗎？'),
    a: text(
      'We are at fifteen and that number is the whole idea, so please just ask us first — we would rather say yes on purpose than be surprised.',
      '十五人という人数そのものが今回の趣旨ですので、まずはご相談ください。驚くよりも、きちんとお迎えしたいのです。',
      '我們只邀請十五人，而這個數字本身就是重點，所以請先問我們一聲——我們寧願好好答應，而不是當天才驚訝。',
    ),
  },
  {
    q: text('Photographs', '写真について', '拍照'),
    a: text(
      'Take as many as you like, except during the twenty minutes of the ceremony — for those we would love to look out and see faces rather than phones.',
      'どうぞ自由に撮ってください。ただし挙式の二十分間だけは、画面ではなく皆さんのお顔を見たいので、お控えいただけると嬉しいです。',
      '請盡量拍。只有儀式的那二十分鐘，希望我們望出去看到的是臉，而不是手機。',
    ),
  },
]

/** How to reach the two of us. An empty value hides that row; all empty hides the block. */
export const CONTACT = {
  email: '', // DRAFT — e.g. 'us@example.com'
  /** Free text: LINE ID, phone, 'just message us', whatever is true. */
  other: text('', '', ''), // DRAFT
}

/** The last thing on the page, after the trail runs out. */
export const CLOSING = text(
  'See you on the trail.',
  'それでは、山で。',
  '山上見。',
)
