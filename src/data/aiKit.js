// AI yozgan HTML/CSS kod uchun: dizayn to'plami (iframe ichiga qo'shiladi), iframe hujjati,
// AI promti va kodni tekshirish/tozalash.

// ───────── iframe ichidagi dizayn to'plami ─────────
export const KIT_CSS = `
:root{--bg:#0b0a0f;--fg:#f3f3f1;--mute:#8e8d94;--dim:#67666c;--line:rgba(255,255,255,.14);--card:#17161b;--card2:#1c1b21;--accent:#9fd7ff;
--sans:'Geist',system-ui,sans-serif;--mono:'Geist Mono',ui-monospace,monospace;--ease:cubic-bezier(.22,.31,0,1);color-scheme:dark}
*,*::before,*::after{box-sizing:border-box}
html,body{margin:0;padding:0;height:auto!important;min-height:0!important;background:transparent;color:var(--fg);font-family:var(--sans);
-webkit-font-smoothing:antialiased;font-size:16px;line-height:1.45;overflow-x:hidden}
#g-root{display:flow-root}
img,video,svg,canvas{max-width:100%}
img{display:block}
a{color:inherit}
h1,h2,h3,h4,p,ul,ol,figure,blockquote,dl,dd{margin:0}
.g-section{padding:72px 0}
.g-section.tight{padding:32px 0}
.g-mono{font-family:var(--mono);text-transform:uppercase;letter-spacing:.05em;font-size:10px;color:var(--mute)}
.g-h1{font-size:clamp(44px,5.4vw,84px);font-weight:700;letter-spacing:-.05em;line-height:.95}
.g-h2{font-size:clamp(30px,2.6vw,42px);font-weight:700;letter-spacing:-.05em;line-height:1.02}
.g-h3{font-size:clamp(22px,1.7vw,28px);font-weight:700;letter-spacing:-.045em;line-height:1.05}
.g-lead{font-size:18.5px;font-weight:500;line-height:1.33;max-width:620px}
.g-text{font-size:15px;line-height:1.5;color:var(--mute);max-width:620px}
.g-big{font-size:clamp(44px,4.4vw,72px);font-weight:700;letter-spacing:-.055em;line-height:1}
.g-grad{background:linear-gradient(90deg,#f3f3f1 0%,#c9c6ff 22%,#7b74ff 48%,#9c6cf5 62%,#4cc2e6 92%);-webkit-background-clip:text;background-clip:text;color:transparent}
.g-split{display:grid;grid-template-columns:1fr 1fr;gap:40px}
.g-grid-2,.g-grid-3,.g-grid-4{display:grid;gap:20px}
.g-grid-2{grid-template-columns:repeat(2,1fr)}
.g-grid-3{grid-template-columns:repeat(3,1fr)}
.g-grid-4{grid-template-columns:repeat(4,1fr)}
.g-grid-tight{gap:8px}
.g-card{background:var(--card);border-radius:3px;padding:22px 22px 26px;display:flex;flex-direction:column;gap:10px}
.g-card-img{aspect-ratio:16/10;overflow:hidden;background:var(--card2);margin:-22px -22px 6px}
.g-card-img img{width:100%;height:100%;object-fit:cover}
.g-pic{border-radius:4px;overflow:hidden;background:var(--card2)}
.g-pic img{width:100%;height:100%;object-fit:cover}
.g-pic.r16x9{aspect-ratio:16/9}.g-pic.r4x3{aspect-ratio:4/3}.g-pic.r1x1{aspect-ratio:1}.g-pic.r3x4{aspect-ratio:3/4}
.g-caption{margin-top:8px;font-family:var(--mono);text-transform:uppercase;letter-spacing:.05em;font-size:9.5px;color:var(--mute)}
.g-table{display:grid;grid-template-columns:132px 1fr;row-gap:12px;align-items:baseline}
.g-table dt{font-family:var(--mono);text-transform:uppercase;letter-spacing:.05em;font-size:9.5px;color:var(--mute)}
.g-table dd{font-size:14.5px}
.g-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:20px;border-top:1px solid var(--line);padding-top:28px}
.g-stats span{display:block;margin-top:10px;font-family:var(--mono);text-transform:uppercase;letter-spacing:.05em;font-size:10px;color:var(--mute)}
.g-line{border:0;border-top:1px solid var(--line);margin:0}
.g-list{list-style:none;padding:0;display:grid;gap:10px}
.g-list li{position:relative;padding-left:16px}
.g-list li::before{content:'';position:absolute;left:0;top:.55em;width:6px;height:6px;background:#bbb}
.g-tag{display:inline-block;font-family:var(--mono);text-transform:uppercase;letter-spacing:.05em;font-size:10px;padding:5px 8px;border:1px solid var(--line);border-radius:99px;color:var(--mute)}
.g-btn{display:inline-flex;gap:6px;align-items:center;height:42px;padding:0 22px;font-family:var(--mono);text-transform:uppercase;letter-spacing:.05em;font-size:13px;font-weight:500;
background:var(--fg);color:var(--bg);text-decoration:none;border:0;cursor:pointer}
.g-btn::before{content:'[';opacity:.55}.g-btn::after{content:']';opacity:.55}
.g-btn.ghost{background:transparent;color:var(--fg)}
.g-accent{color:var(--p,var(--accent))}
.g-bg-accent{background:var(--p,var(--accent))}
@keyframes gFadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.g-reveal{animation:gFadeUp .9s var(--ease) both}
@media (max-width:900px){.g-split,.g-grid-2{grid-template-columns:1fr}.g-grid-3,.g-grid-4{grid-template-columns:1fr 1fr}.g-section{padding:48px 0}}
@media (max-width:560px){.g-grid-3,.g-grid-4{grid-template-columns:1fr}.g-table{grid-template-columns:110px 1fr}}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
`

const FONTS = 'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;900&family=Geist+Mono:wght@400;500;700&display=swap'

// iframe uchun to'liq hujjat. Balandlik postMessage orqali ota sahifaga yuboriladi.
export function buildDoc(code, { id, color = '#9fd7ff', origin = '', preview = false } = {}) {
  const safeColor = /^#[0-9a-f]{3,8}$/i.test(color) ? color : '#9fd7ff'
  return `<!doctype html><html lang="uz"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<base href="${origin}/" target="_top">
<link rel="stylesheet" href="${FONTS}">
<style>${KIT_CSS}:root{--p:${safeColor}}${preview ? BROKEN_PREVIEW : BROKEN_SITE}</style>
</head><body><div id="g-root">${code}</div>
<script>(function(){var r=document.getElementById('g-root'),last=0;
function send(){var h=Math.ceil(r.getBoundingClientRect().height);if(Math.abs(h-last)<1)return;last=h;parent.postMessage({__gobo:'h',id:${JSON.stringify(id || '')},h:h},'*')}
try{new ResizeObserver(send).observe(r)}catch(e){setInterval(send,500)}
addEventListener('load',send);document.fonts&&document.fonts.ready.then(send);setTimeout(send,50);setTimeout(send,600);
function bad(t){t.classList.add('g-broken');t.setAttribute('data-src',t.getAttribute('src')||'');send()}
document.addEventListener('error',function(e){var t=e.target;if(t&&t.tagName==='IMG')bad(t)},true);
document.querySelectorAll('img').forEach(function(i){if(i.complete&&!i.naturalWidth&&i.getAttribute('src'))bad(i)});
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href^="#"]');if(a){e.preventDefault();var t=document.querySelector(a.getAttribute('href'));t&&t.scrollIntoView({behavior:'smooth'})}});
})();</script></body></html>`
}

// Topilmagan rasm: saytda — yashiriladi (buzilgan belgi va alt matn chiqmaydi), admin ko'rinishida — belgilanadi
const BROKEN_SITE = `img.g-broken{visibility:hidden}`
const BROKEN_PREVIEW = `img.g-broken{position:relative;display:block;min-height:120px;width:100%;color:transparent;border:1px dashed #ff7a70;border-radius:4px;
background:repeating-linear-gradient(135deg,rgba(255,122,112,.08) 0 12px,transparent 12px 24px)}
img.g-broken::after{content:'Rasm topilmadi: ' attr(data-src);position:absolute;inset:0;display:grid;place-items:center;padding:12px;text-align:center;
font:500 11px var(--mono);color:#ff9a90;background:#140f12}`

// ───────── kodni tekshirish va tozalash ─────────
const MAX = 400 * 1024

export function normalizeCode(input) {
  const errors = []
  const warnings = []
  let src = String(input || '').trim()
  if (!src) return { code: '', errors: ['Kod bo‘sh'], warnings }

  // ```html ... ``` bloklarini ochish (bir nechta bo'lsa — birlashtiriladi)
  const fences = [...src.matchAll(/```[a-z]*\s*\n([\s\S]*?)```/gi)].map((m) => m[1])
  if (fences.length) src = fences.join('\n')

  const doc = new DOMParser().parseFromString(src, 'text/html')
  const parts = []
  let removedExt = 0
  // <head> va <body> dagi uslublar
  doc.querySelectorAll('style').forEach((s) => {
    parts.push(`<style>${s.textContent}</style>`)
    s.remove()
  })
  doc.querySelectorAll('link').forEach((l) => {
    const href = l.getAttribute('href') || ''
    if (/stylesheet/i.test(l.getAttribute('rel') || '') && /^https:\/\/fonts\.googleapis\.com\//.test(href)) parts.push(l.outerHTML)
    else removedExt++
    l.remove()
  })
  doc.querySelectorAll('script').forEach((s) => {
    if (s.getAttribute('src')) {
      removedExt++
      s.remove()
    }
  })
  doc.querySelectorAll('meta,title,base').forEach((m) => m.remove())
  let body = doc.body.innerHTML.trim()
  let code = parts.join('\n') + (parts.length ? '\n' : '') + body

  if (removedExt) warnings.push(`${removedExt} ta tashqi fayl (script/link) olib tashlandi — faqat ichki kod va Google Fonts ruxsat etiladi.`)

  // vh birliklari iframe balandligini cheksiz o'stiradi — px ga aylantiramiz (1vh ≈ 8px)
  let vh = 0
  code = code.replace(/(-?\d*\.?\d+)\s*(?:[dsl])?vh\b/gi, (_, n) => {
    vh++
    return Math.round(parseFloat(n) * 8) + 'px'
  })
  if (vh) warnings.push(`${vh} ta “vh” birligi px ga almashtirildi (iframe ichida vh balandlikni buzadi).`)

  if (/position\s*:\s*fixed/i.test(code)) warnings.push('position: fixed bor — u faqat blok ichida ishlaydi, sahifaga yopishmaydi.')
  if (/\b(width|min-width)\s*:\s*(1[3-9]\d\d|[2-9]\d{3})px/i.test(code)) warnings.push('Juda katta qat’iy kenglik (px) bor — telefonda gorizontal scroll chiqishi mumkin.')
  if (/<iframe/i.test(code) && !/youtube(-nocookie)?\.com\/embed/i.test(code)) warnings.push('Ichida boshqa iframe bor — ishlamasligi mumkin.')
  if (/<script/i.test(code)) warnings.push('Ichki JavaScript bor — u izolyatsiyada ishlaydi, sayt va admin panelga ta’sir qila olmaydi.')
  if (!/[a-z]/i.test(body)) errors.push('HTML qismi topilmadi — faqat CSS yuborilganga o‘xshaydi.')
  if (code.length > MAX) errors.push(`Kod juda katta (${Math.round(code.length / 1024)} KB). Chegara — 400 KB. Rasmlarni base64 qilmang, Media’ga yuklang.`)
  if (/data:image\/[a-z]+;base64,[a-z0-9+/=]{20000,}/i.test(code)) warnings.push('Kod ichida katta base64 rasm bor — Media’ga yuklab, manzilini ishlating.')
  return { code, errors, warnings }
}

// ───────── AI uchun promt ─────────
const KIT_DOC = `
TAYYOR CSS KLASSLAR (sahifada allaqachon bor — qayta e'lon qilmang, shunchaki ishlating):
- .g-section — bo'lim (yuqori/past 72px bo'shliq); .g-section.tight — 32px
- .g-mono — kichik MONO yozuv (10px, KATTA HARF, kulrang) — yorliqlar, kalitlar uchun
- .g-h1 / .g-h2 / .g-h3 — sarlavhalar (Geist 700, harflar zich)
- .g-lead — asosiy oq matn (18.5px, 500);  .g-text — kulrang qo'shimcha matn (15px)
- .g-big — katta raqam (44–72px)
- .g-grad — gradient (oq→binafsha→havorang) matn
- .g-split — 2 ustun (40px oraliq); .g-grid-2 / .g-grid-3 / .g-grid-4 — to'r (20px oraliq), .g-grid-tight — 8px oraliq
- .g-card — karta (fon #17161b, radius 3px, ichki 22px); .g-card-img — karta tepasidagi 16:10 rasm (karta chetiga yopishadi)
- .g-pic + .r16x9 / .r4x3 / .r1x1 / .r3x4 — rasm ramkasi (radius 4px, object-fit: cover); .g-caption — rasm izohi
- .g-table — <dl> kalit–qiymat jadvali (dt — mono kalit, dd — qiymat)
- .g-stats — katta raqamlar qatori (ichida <div><b class="g-big">…</b><span>izoh</span></div>)
- .g-list — kvadrat nuqtali ro'yxat;  .g-tag — kichik yumaloq yorliq;  .g-line — ingichka chiziq
- .g-btn — [ TUGMA ] uslubidagi tugma (qavslar avtomatik), .g-btn.ghost — shaffof variant
- .g-accent / .g-bg-accent — loyihaning asosiy rangi (CSS o'zgaruvchi --p)
- .g-reveal — paydo bo'lish animatsiyasi
CSS O'ZGARUVCHILAR: --bg #0b0a0f, --fg #f3f3f1, --mute #8e8d94, --dim #67666c, --line rgba(255,255,255,.14),
--card #17161b, --card2 #1c1b21, --accent #9fd7ff, --p (loyiha rangi), --sans 'Geist', --mono 'Geist Mono', --ease cubic-bezier(.22,.31,0,1)`

export function buildPrompt({ project = {}, mode = 'section', images = [], notes = '' }) {
  const p = project
  const facts = [
    ['Loyiha nomi', p.name],
    ['Yil', p.year],
    ['Yo‘nalish', p.category],
    ['Shior', p.tagline],
    ['Sayt', p.site],
    ['Texnologiya', p.stack],
    ['Imkoniyatlar', p.services],
    ['Asosiy rang', p.color],
    ['Tavsif', p.intro],
    ['Batafsil', p.story],
    ['Raqamlar', (p.stats || []).map(([a, b]) => `${a} — ${b}`).join('; ')],
    ['Natijalar', (p.kept || []).join('; ')],
  ].filter(([, v]) => v)

  const what =
    mode === 'page'
      ? `Loyihaning TO'LIQ sahifa mazmunini yarating (5–9 ta bo'lim): kirish, asosiy imkoniyatlar, ekran rasmlari, raqamlar, "ilgari → endi" taqqoslash, xulosa. Loyiha nomi va shiori sayt tomonidan sahifa boshida ALLAQACHON chiqariladi — ularni katta sarlavha qilib takrorlamang.`
      : `Loyiha sahifasi uchun BITTA bo'lim (blok) yarating. U boshqa bloklar orasida turadi — atrofida o'z sarlavhasi va mazmuni bo'lsin, sahifa sarlavhasini takrorlamang.`

  return `Siz tajribali UI/frontend dizayner-dasturchisiz. Namangan davlat universiteti (NamDU) IT Park portfoliosi uchun loyiha sahifasi kontentini HTML + CSS ko'rinishida yozib berasiz. Kod tayyor saytga to'g'ridan-to'g'ri qo'yiladi, shuning uchun quyidagi qoidalarga QAT'IY amal qiling.

═══ VAZIFA ═══
${what}

═══ LOYIHA MA'LUMOTLARI ═══
${facts.map(([k, v]) => `${k}: ${v}`).join('\n')}
${notes ? `\nQo'shimcha talablar / ma'lumot:\n${notes}\n` : ''}
═══ RASMLAR ═══
${
  images.length
    ? images.map((im, i) => `IMG_${i + 1}: ${im.url}${im.note ? ` — ${im.note}` : ''}`).join('\n') +
      `\nRasmlarni FAQAT shu manzillar bilan ishlating: <img src="${images[0].url}" alt="…">. Manzilni o'zgartirmang, boshqa rasm o'ylab topmang, tashqi (http) rasm havolalarini ishlatmang. Rasm mazmunini ilova qilingan rasmlarga qarab tushuning. Rasmlar <img> bo'lsin (CSS background-image emas), ramka uchun .g-pic dan foydalaning.`
    : `Agar rasmlarni shu xabarga BIRIKTIRGAN bo'lsam — har birini <img> da AYNAN o'sha fayl nomi bilan ishlating (masalan rasm "dars-tahlili.png" bo'lsa: <img src="dars-tahlili.png" alt="…">). Fayl nomini o'zgartirmang, papka qo'shmang, http havola yozmang — admin panel rasmni shu nom bo'yicha o'zi bog'laydi. Rasmlar <img> bo'lsin (CSS background-image emas). Rasm biriktirilmagan bo'lsa, rasm ishlatmang: tipografiya, raqamlar, kartalar va rangli bloklardan foydalaning. Internetdagi tashqi rasm havolalarini (unsplash, placeholder va h.k.) HECH QACHON ishlatmang.`
}

═══ DIZAYN TIZIMI (saytning umumiy uslubi) ═══
Uslub: qorong'i, minimalistik, "digital studio" (gobo.framer uslubi). Fon deyarli qora (#0b0a0f) va SAYT TOMONIDAN beriladi — blokingizga umumiy fon BERMANG (background: transparent qoldiring). Matn oq (#f3f3f1), ikkinchi darajali matn kulrang (#8e8d94).
Shriftlar: sarlavha va matn — 'Geist' (700 qalin, letter-spacing -0.05em, line-height ~1), kichik yorliqlar — 'Geist Mono' (10–11px, KATTA HARF, letter-spacing .05em, kulrang). Boshqa shrift ishlatmang.
Kompozitsiya: katta sarlavhalar, ko'p bo'sh joy, 20px oraliqli gridlar, ikki ustunli (chapda kichik mono yorliq/jadval, o'ngda matn) bo'limlar. Kartalar — #17161b fon, radius 3px. Rasmlar — radius 4px, object-fit: cover. Soya, gradient-tugma, emoji, yumaloq "bubble" dizayn ISHLATMANG. Rang aksenti sifatida faqat loyiha rangi (var(--p)) va kamdan-kam ishlating.
Bo'limlar orasidagi vertikal masofa 60–90px. Konteyner kengligi sayt tomonidan beriladi (chap/o'ng padding allaqachon bor) — o'zingiz max-width/margin auto bilan markazlashtirmang, 100% kenglikdan foydalaning.
${KIT_DOC}

═══ TEXNIK QOIDALAR (buzilsa kod ishlamaydi) ═══
1. Javobda FAQAT bitta \`\`\`html kod bloki bo'lsin: tepada bitta <style>…</style>, keyin markup. <!doctype>, <html>, <head>, <body> YOZMANG.
2. O'z CSS klasslaringizga "x-" prefiks qo'ying (masalan .x-hero, .x-feature). body, html, *, h1, p kabi umumiy selektorlarga stil BERMANG.
3. vh / vw / dvh birliklarini, position: fixed, height: 100%, min-height: 100vh ni ISHLATMANG — blok balandligi kontentga qarab avtomatik o'lchanadi.
4. Moslashuvchan bo'lsin: 900px va 560px dan tor ekranlar uchun @media qoidalari yozing, gorizontal scroll bo'lmasin, qat'iy px kenglik bermang (max-width: 100% ishlating).
5. JavaScript shart emas. Kerak bo'lsa (tablar, slayder) — faqat oddiy vanilla JS, pastda bitta <script> ichida, tashqi kutubxonalarsiz, xatoga chidamli. Hech qanday tashqi <script src>, <link>, CDN, freymvork (Tailwind, Bootstrap, React) ISHLATMANG.
6. Barcha matnlar o'zbek tilida (lotin yozuvi, oʻ/gʻ uchun ‘ belgisi). Ma'lumotlarni o'ylab topmang — faqat yuqoridagi faktlardan foydalaning; raqam yo'q bo'lsa, raqam yozmang.
7. Rasmlarga alt matn yozing, tugma/havolalarga tushunarli nom bering. Havolalar target="_blank" bo'lsin.
8. Kod 400 KB dan oshmasin, base64 rasm qo'shmang.

Endi kodni yozing.`
}
