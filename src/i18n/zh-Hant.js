/**
 * Traditional Chinese catalog (繁體中文), for the Taiwanese side of the guest list. Same
 * keys as `en.js`, enforced by `test/i18n.test.js`.
 *
 * TAIWAN USAGE, NOT HONG KONG AND NOT CONVERTED SIMPLIFIED. 地點 rather than 地方, 資訊
 * rather than 信息, 影片/照片 rather than 視頻/圖片, and full-width punctuation 、。（） with
 * no space around it. A catalog produced by running the Simplified text through a
 * character converter gets every glyph right and the word choice wrong, which is the
 * tell a Taiwanese reader notices immediately.
 *
 * Chinese has ONE cardinal plural category, so a pluralised value is `{ other }` alone —
 * same as `ja.js`, and for the same reason.
 */
export default {
  'app.title': '婚禮邀請',

  'skip.toContent': '跳至內容',

  'lang.label': '語言',

  'hero.eyebrow': '請來和我們一起過這一天',
  'hero.dateTbc': '日期尚未確定',

  'countdown.days': { other: '還有 {count} 天' },
  'countdown.today': '就是今天',
  'countdown.past': { other: '{count} 天前' },

  'section.day': '當天的安排',
  'section.where': '地點',
  'section.travel': '交通與住宿',
  'section.bring': '穿著與攜帶',
  'section.story': '我們的故事',
  'section.photos': '照片',
  'section.faq': '一些說明',
  'section.guests': '十五個人',

  'venue.openApple': '用地圖開啟',
  'venue.openGoogle': '用 Google 地圖開啟',
  'venue.copyAddress': '複製地址',
  'venue.copied': '已複製地址',
  'venue.phone': '當天的會場電話',

  'bring.dress': '穿著',
  'bring.kit': '建議帶著的東西',

  'photos.open': '放大檢視',
  'photos.close': '關閉',

  'calendar.add': '加入行事曆',
  'calendar.hint': '會下載一個行事曆檔案，不會傳送任何資料給我們。',
  'contact.title': '任何問題都歡迎問',
  'contact.email': '寄信給我們',

  'footer.madeWith': '我們兩個人做的',
}
