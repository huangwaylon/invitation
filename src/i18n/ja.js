/**
 * Japanese catalog. Same keys as `en.js`, enforced by `test/i18n.test.js`.
 *
 * REGISTER: 丁寧語 throughout, and 敬語 where the page addresses the guest directly. These
 * are fifteen people the couple actually knows, so this is warm-polite rather than the
 * stiff 招待状 formula — no 拝啓/敬具 frame, no 時下ますますご清栄, because that register on a
 * page whose next line is "bring shoes you do not mind getting damp" would read as a
 * parody of itself.
 *
 * Japanese has ONE cardinal plural category, so a pluralised value here is `{ other }`
 * alone. `Intl.PluralRules('ja').select(1)` returns 'other' and the lookup in index.js
 * falls through to it — do not add a `one` branch to be tidy, it can never be selected.
 */
export default {
  'app.title': '結婚のご案内',

  'skip.toContent': '本文へ',

  'lang.label': '言語',

  'hero.eyebrow': '一日をいっしょに過ごしてください',
  'hero.dateTbc': '日程は調整中です',

  'countdown.days': { other: 'あと{count}日' },
  'countdown.today': '本日です',
  'countdown.past': { other: '{count}日前' },

  'section.day': 'その日のこと',
  'section.where': '会場',
  'section.travel': 'お越しの方法',
  'section.bring': '服装と持ちもの',
  'section.story': 'これまでのこと',
  'section.photos': '写真',
  'section.faq': 'ご案内',
  'section.guests': '十五人',

  'venue.openApple': 'マップで開く',
  'venue.openGoogle': 'Googleマップで開く',
  'venue.copyAddress': '住所をコピー',
  'venue.copied': '住所をコピーしました',
  'venue.phone': '当日の会場連絡先',

  'bring.dress': '服装',
  'bring.kit': 'あると安心なもの',

  'photos.open': '大きく表示',
  'photos.close': '閉じる',

  'calendar.add': 'カレンダーに追加',
  'calendar.hint': 'カレンダーファイルを保存します。こちらには何も送信されません。',
  'contact.title': 'ご不明な点は何でも',
  'contact.email': 'メールを送る',

  'footer.madeWith': '二人で作りました',
}
