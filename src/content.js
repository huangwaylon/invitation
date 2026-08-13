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
 * DRAFT. The couple, the date, the ceremony time and the venue are REAL. Everything still
 * marked `// DRAFT` is something I do not know, and have either left out or written a
 * plausible version of: the street address, the schedule around the ceremony, the travel
 * specifics, the story, the guest list. Replace each one and delete its marker; when the
 * last one is gone, set DRAFT = false and the banner on the page disappears.
 *
 * `npm run check:content` lists what is outstanding, with line numbers. It is NOT a deploy
 * gate — the site publishes either way — so that banner is the only thing standing between a
 * placeholder and a guest. Note that nothing here invents a street number: an address that is
 * incomplete is recoverable, and one that is confidently wrong is not.
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
 * The couple, per locale, so a Japanese guest reads 明佳 and everyone else reads Asuka.
 *
 * The Chinese column here is the same two characters as the Japanese: 明佳 is written
 * identically in Traditional Chinese, so there is nothing to convert. Not every name is that
 * lucky — the venue's below is not.
 */
export const COUPLE = {
  one: text('Waylon', 'ウェイロン', '偉倫'), // DRAFT — both CJK renderings are still guesses.
  two: text('Asuka', '明佳', '明佳'),
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
  /** 8 October 2027 is a FRIDAY. Deliberate for fifteen people; worth one second look anyway. */
  date: '2027-10-08',
  /** IANA zone of the VENUE. Decides what "today" means for the countdown. */
  timezone: 'Asia/Tokyo',
  /**
   * 'HH:MM' 24-hour wall clock in `timezone`, formatted per locale at render.
   *
   * `start` is the CEREMONY, and it is also what the calendar file uses for DTSTART. The page
   * asks guests to arrive from half ten; if you would rather their calendars said 10:30, change
   * it here and the .ics follows.
   */
  start: '11:00',
  end: '18:00', // DRAFT — how late the day actually runs.
}

/**
 * The schedule. One entry per row, in order, and the trail reads top to bottom.
 *
 * `icon` names a glyph in `components/icons.jsx`. An unknown name renders no glyph
 * rather than a fallback one — a wrong picture is worse than none.
 *
 * `at` is 'HH:MM' or null. Null prints no time at all, which is the honest way to say
 * "somewhere in the afternoon" — a made-up 15:30 becomes a promise.
 *
 * ONLY THE CEREMONY IS CONFIRMED. Everything around it is a plausible shape for a lunch
 * reception starting at eleven, written so the page reads properly — the times are mine, not
 * yours. Sunset in Mito in early October is about a quarter past five, which is what the lantern
 * row is timed against.
 */
export const SCHEDULE = [
  {
    at: '10:30', // DRAFT
    icon: 'tent',
    title: text('Arrive & wander', '集合・散策', '抵達・散步'),
    note: text(
      'Come from half past ten. There is coffee, there are chairs in the shade, and nobody is being seated in rows.',
      '十時半からお越しいただけます。コーヒーと木陰の椅子をご用意しています。席順はありません。',
      '十點半後即可入場。備有咖啡與樹蔭下的座位，不需照順序入座。',
    ),
  },
  {
    at: '11:00',
    icon: 'rings',
    title: text('The ceremony', '挙式', '婚禮儀式'),
    note: text(
      'Outside in the garden, and short — about twenty minutes. If it rains we move indoors and nothing else changes.',
      '庭で行う、二十分ほどの短い式です。雨天の場合は屋内に移りますが、それ以外は変わりません。',
      '在庭園中舉行，大約二十分鐘。若遇雨天則移至室內，其餘一切照舊。',
    ),
  },
  {
    at: '11:45', // DRAFT
    icon: 'basket',
    title: text('Long lunch', '会食', '午宴'),
    note: text(
      'One long table, and as long as we can make it last. Tell us in advance about anything you cannot eat and we will simply make sure there is something for you.',
      '長いテーブルをひとつ、できるだけゆっくりと。お召し上がりになれないものがあれば、事前にお知らせください。',
      '一張長桌，盡量慢慢地吃。若有任何飲食禁忌，請提前告訴我們。',
    ),
  },
  {
    at: '13:30', // DRAFT
    icon: 'kettle',
    title: text('Coffee, cake, cards', 'コーヒーとケーキ', '咖啡、蛋糕、紙牌'),
    note: text(
      'The slow middle of the day. Blankets out on the grass, shoes off, a hand of cards if you want one.',
      '一日のいちばんのんびりした時間です。芝生にブランケットを広げて、靴を脱いで、トランプでも。',
      '一天中最悠閒的時光。在草地上攤開毯子、脫掉鞋子，想玩牌也可以。',
    ),
  },
  {
    at: '14:45', // DRAFT — and check how close Kairakuen actually is on foot.
    icon: 'pine',
    title: text('A short walk', '散歩', '散步'),
    note: text(
      'Kairakuen is a few minutes away and the paths are flat. October is the easy half of the year for it — entirely optional, and the reason we keep mentioning your shoes.',
      '偕楽園は数分の距離で、道は平坦です。十月はいちばん歩きやすい季節です。任意ですが、靴のことを繰り返しお伝えしている理由です。',
      '偕樂園就在幾分鐘外，路面平緩。十月正是最好走的季節——純屬自由參加，也是我們一直提醒您留意鞋子的原因。',
    ),
  },
  {
    at: '17:00', // DRAFT
    icon: 'lantern',
    title: text('Lanterns & last drinks', 'ランタンと乾杯', '燈火與最後一杯'),
    note: text(
      'The sun is behind the trees by about a quarter past five, and it gets cold faster than you expect. Bring the extra layer you were going to leave in the car.',
      '五時過ぎには日が木立の向こうに沈み、思ったより早く冷えてきます。車に置いていこうとした一枚を、ぜひお持ちください。',
      '五點過後太陽就落到樹後，會比想像中更快變冷。原本想留在車上的那件外套，請帶著。',
    ),
  },
  {
    at: '18:00', // DRAFT
    icon: 'moon',
    title: text('Home', 'お開き', '散會'),
    note: text(
      'There are limited expresses back towards Tokyo well into the evening. We will be the two people waving.',
      '東京方面への特急は夜まで走っています。手を振っている二人が私たちです。',
      '往東京方向的特急列車到晚間都還有班次。揮手的那兩個人就是我們。',
    ),
  },
]

/**
 * Where.
 *
 * NOTE WHAT THE THREE COLUMNS OF `name` ARE DOING. 偕楽園 uses the Japanese shinjitai 楽, whose
 * Traditional Chinese form is 樂 — and 水戸 likewise becomes 水戶. So the Chinese column is not a
 * copy of the Japanese one, and a Taiwanese guest would notice at a glance if it were. This is
 * the concrete case behind the "not translations of each other" rule at the top of the file.
 */
export const VENUE = {
  name: text('Geihinkan Kairakuen Bettei', '迎賓館 偕楽園 別邸', '迎賓館 偕樂園 別邸'),
  /** One line under the name. Where it is, in words, for somebody who does not know. */
  area: text('Mito, Ibaraki', '茨城県水戸市', '茨城縣水戶市'),
  /**
   * The postal address as it should be READ, one line per array entry. Not one string with
   * commas: Japanese and Chinese addresses run largest-unit-first and break in different places
   * than an English one, so each locale gets its own lines.
   *
   * DELIBERATELY INCOMPLETE RATHER THAN INVENTED. There is no street number here because I do
   * not have one, and a plausible wrong address sends fifteen travelling people to the wrong
   * gate. Everything here is true; add the 〒 and the 番地, then delete the marker.
   */
  address: text(
    ['Geihinkan Kairakuen Bettei', 'Mito, Ibaraki', 'Japan'],
    ['茨城県水戸市', '迎賓館 偕楽園 別邸'],
    ['日本 茨城縣水戶市', '迎賓館 偕樂園 別邸'],
  ), // DRAFT — add the postcode and the street address.
  /**
   * What both map links search for. In Japanese, because that is what resolves to a Japanese
   * venue's own record in Apple Maps and Google Maps — an English transliteration frequently
   * finds nothing at all. Tap both buttons once and confirm they land on the right building.
   */
  mapQuery: '迎賓館 偕楽園別邸 茨城県水戸市',
  /** Optional. Empty string hides the row. */
  phone: '', // DRAFT — the venue's number, for the day itself.
}

/**
 * Getting there and staying over.
 *
 * `icon` again names a glyph. Each entry is a heading and a short paragraph — no nested
 * structure, because a guest reading this on a phone in a station wants three sentences, not a
 * table.
 */
export const TRAVEL = [
  {
    icon: 'train',
    title: text('By train', '電車で', '搭電車'),
    note: text(
      'The Hitachi and Tokiwa limited expresses run from Shinagawa, Tokyo and Ueno to Mito in about eighty minutes, and the venue is a short taxi ride from the station.',
      '特急ひたち・ときわが品川・東京・上野から水戸まで約八十分です。水戸駅からはタクシーでほどなく着きます。',
      '特急「日立」與「常磐」自品川、東京、上野出發，約八十分鐘抵達水戶，再從水戶站搭計程車即可。',
    ), // DRAFT — confirm the journey time, and whether you are meeting a particular arrival.
  },
  {
    icon: 'car',
    title: text('By car', '車で', '自行開車'),
    note: text(
      'The Joban Expressway as far as Mito, and there is parking on site.',
      '常磐自動車道で水戸まで。駐車場は敷地内にあります。',
      '走常磐自動車道到水戶，現場設有停車場。',
    ), // DRAFT — confirm the parking, and which interchange to leave at.
  },
  {
    icon: 'plane',
    title: text('Flying in', '飛行機で', '搭飛機'),
    note: text(
      'Haneda or Narita, then the Joban line express from Ueno or Tokyo Station. Give yourself the extra hour — it is a proper journey, not a transfer.',
      '羽田または成田から、上野駅か東京駅で常磐線の特急に乗り換えてください。乗り継ぎというより一つの旅程です、余裕をみてお越しください。',
      '從羽田或成田入境，再於上野站或東京站轉乘常磐線特急。請多留一小時——這是一段旅程，不只是轉乘。',
    ), // DRAFT
  },
  {
    icon: 'bed',
    title: text('Staying over', '宿泊', '住宿'),
    note: text(
      'Most people are staying the night near Mito station. Ask us and we will send you what we know.',
      '多くの方が水戸駅周辺に一泊されます。ご希望の方はお声がけください、分かることをお送りします。',
      '多數人會在水戶站附近住一晚。需要的話請告訴我們，我們會把知道的資訊寄給您。',
    ), // DRAFT — a held block of rooms, or a couple of specific recommendations.
  },
]

/**
 * What to wear and what to bring.
 *
 * ONE LIST, NOT TWO. A dress code section and a packing section would say the same thing twice —
 * at an outdoor wedding "what to wear" IS "what to bring" — so the dress code is the paragraph
 * and the kit is the list beneath it.
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
      note: text(
        'Flat, and you will not mind if they get damp.',
        '平らで、少し濡れても気にならないもの。',
        '平底，而且不怕稍微沾濕。',
      ),
    },
    {
      icon: 'jacket',
      label: text('A warm layer', '羽織るもの', '一件保暖外層'),
      note: text(
        'The temperature drops fast once the sun is down. Every year, everyone forgets.',
        '日が沈むと一気に冷えます。毎年、皆さん忘れます。',
        '太陽下山後氣溫驟降。每年大家都忘記。',
      ),
    },
    {
      icon: 'hat',
      label: text('Sun, and maybe rain', '日差しと雨の備え', '防曬與備雨'),
      note: text(
        'A hat for the garden and a folding umbrella — early October can go either way.',
        '庭用の帽子と、折りたたみ傘を。十月初旬はどちらにもなります。',
        '庭園用的帽子，以及一把折傘——十月初的天氣兩種都可能。',
      ),
    },
    {
      icon: 'bottle',
      label: text('A water bottle', '水筒', '水壺'),
      note: text(
        'Useful if you come on the walk.',
        '散歩に出るなら、持っていると安心です。',
        '如果要一起散步，帶著會很方便。',
      ),
    },
  ],
}

/**
 * The story, as a handful of stops rather than a paragraph. `year` prints as-is, so it can be a
 * year, a season, or a dash — it is a label, not a parsed date.
 */
export const STORY = [
  {
    year: '2019', // DRAFT
    title: text('A wrong turn', '道を間違えて', '走錯了路'),
    note: text(
      'We met on a trail neither of us was supposed to be on, both holding the same badly folded map.',
      '本来歩くはずのなかった登山道で、二人とも同じ折り方の下手な地図を持っていました。',
      '我們在一條原本都不該走的步道上相遇，手裡拿著同一��摺得亂七八糟的地圖。',
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
    year: '2027',
    title: text('This bit', 'そして、この日', '而現在'),
    note: text(
      'Fifteen of you, one long table, and a garden in Mito in October. That is the whole plan.',
      '十五人の皆さんと、一つの長いテーブルと、十月の水戸の庭。それが計画のすべてです。',
      '十五位親友、一張長桌，以及十月水戶的一座庭園。這就是全部的計畫。',
    ),
  },
]

/**
 * The one photograph at the top of the page, or none.
 *
 * NONE IS THE DEFAULT, and the hero it produces is a drawn one — a dashed card with the couple's
 * mark set into its top edge — not a broken-image box. That variant has to stand on its own,
 * because it is what the page looks like until somebody picks a photograph.
 *
 * `src` is relative to `public/`. The alt text is intentionally empty and should stay that way:
 * the <h1> directly beneath names the couple, so describing the photograph as well says the same
 * thing twice to a screen reader.
 */
export const HERO = {
  src: '', // DRAFT — e.g. 'hero.jpg', dropped into public/
}

/**
 * The gallery. EMPTY IS A VALID STATE and the section simply does not render — a gallery of
 * placeholder rectangles is worse than no gallery.
 *
 * `src` is relative to `public/photos/`. Every entry needs `w`/`h` in real pixels: they set the
 * CSS aspect-ratio so the page does not reflow as images land, which on a phone means the text
 * you were reading does not jump.
 *
 * `alt` is per-locale and must DESCRIBE, not caption — "the two of us on a ridge at dawn", not
 * "our favourite photo".
 */
export const PHOTOS = [
  // DRAFT — drop files into public/photos/ and describe them here. For example:
  // { src: 'garden.jpg', w: 1600, h: 1067, alt: text('The two of us in the garden', '庭に立つ二人', '站在庭園裡的兩人') },
]

/**
 * Everybody who is coming. EMPTY IS VALID and hides the section.
 *
 * Fifteen people is small enough that naming them is the warmest thing the page can do, and it is
 * also why there is no seating chart anywhere in this app: with one long table, the plan is that
 * people sit down.
 */
export const GUESTS = [
  // DRAFT — the fifteen, however they would like to be named. Plain strings:
  // 'Kenji & Mika', 'Auntie Su-lin', 'The Watanabes (all four)',
]

/**
 * Questions worth answering before somebody has to ask. `<details>` rows, closed by default, so
 * the page stays short for the fourteen people who do not need them.
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
      'Everything moves indoors and the day carries on. Only the walk is cancelled.',
      'すべて屋内に移り、そのまま続けます。中止になるのは散歩だけです。',
      '一切移到室內進行，行程照常。只有散步會取消。',
    ),
  },
  {
    q: text('Gifts', 'ご祝儀について', '禮金與禮物'),
    a: text(
      'Please do not. You are travelling a long way to stand in a garden with us and that is comfortably enough. If you truly want to bring something, bring a photograph you took.',
      'どうぞお気遣いなく。遠方から足をお運びいただくだけで十分です。もし何かお持ちいただけるなら、ご祝儀ではなく、あなたが撮った一枚の写真を。',
      '請不必費心。您願意遠道而來陪我們站在一座庭園裡，這樣就非常足夠了。若真想帶點什��，就帶一張您親手拍的照片吧。',
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

/**
 * The last thing on the page, after the trail runs out.
 *
 * The path metaphor rather than a mountain one: the trail on this page ends in a garden in Mito,
 * and an earlier draft signed off with 山で — "see you in the mountains" — which was lovely, and
 * about a venue that does not exist.
 */
export const CLOSING = text(
  'See you on the path.',
  'それでは、庭の小道で。',
  '那麼，庭園小徑上見。',
)
