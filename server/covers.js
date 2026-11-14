// Muqova generatori: ekran rasmini rangli fon ustidagi qurilma (noutbuk / telefon / brauzer)
// ichiga joylaydi yoki tipografik poster chizadi. Headless Edge/Chrome PNG qilib saqlaydi.
import { execFile } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const BROWSERS = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
]
export const browserBin = () => process.env.CHROME_BIN || BROWSERS.find(existsSync)

const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

const CSS = `
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;overflow:hidden}
body{display:grid;place-items:center;font-family:Geist,system-ui,sans-serif;position:relative}
body::before{content:'';position:absolute;inset:0;background:
 radial-gradient(70% 60% at 30% 20%,rgba(255,255,255,.16),transparent 70%),
 radial-gradient(80% 70% at 80% 100%,rgba(0,0,0,.22),transparent 70%)}
.shot{display:block;width:100%;height:100%;object-fit:cover;object-position:top left}
.laptop{position:relative;width:var(--w);filter:drop-shadow(0 40px 50px rgba(0,0,0,.35))}
.laptop .lid{background:#0d0d0f;border-radius:22px 22px 0 0;padding:16px 16px 22px;border:2px solid #2a2a2e}
.laptop .scr{aspect-ratio:16/10;overflow:hidden;border-radius:4px;background:#111}
.laptop .base{height:26px;margin:0 -7%;background:linear-gradient(#e6e6ea,#a9a9ae 60%,#7d7d82);border-radius:0 0 26px 26px;position:relative}
.laptop .base::after{content:'';position:absolute;left:42%;right:42%;top:0;height:9px;background:#9a9aa0;border-radius:0 0 10px 10px}
.phone{position:relative;height:var(--h);aspect-ratio:9/19.3;background:#111;border-radius:calc(var(--h)*.075);padding:calc(var(--h)*.016);
 box-shadow:0 0 0 3px #3a3a3e,0 50px 70px rgba(0,0,0,.35)}
.phone .scr{width:100%;height:100%;overflow:hidden;border-radius:calc(var(--h)*.06);background:#fff}
.phone .island{position:absolute;top:calc(var(--h)*.03);left:50%;width:30%;height:calc(var(--h)*.032);transform:translateX(-50%);background:#000;border-radius:99px;z-index:2}
.browser{width:var(--w);border-radius:14px;overflow:hidden;background:#fff;box-shadow:0 40px 80px rgba(0,0,0,.35)}
.browser .bar{height:44px;background:#ececef;display:flex;align-items:center;gap:9px;padding:0 18px}
.browser .bar i{width:13px;height:13px;border-radius:50%;background:#d0d0d4}
.browser .bar b{margin-left:18px;flex:1;max-width:46%;height:24px;border-radius:7px;background:#fff;font:400 13px/24px Geist,sans-serif;color:#6b6b72;padding:0 12px;white-space:nowrap;overflow:hidden}
.browser .scr{aspect-ratio:var(--ar,16/10);overflow:hidden}
.poster{position:relative;width:76%;height:76%;padding:7%;display:flex;flex-direction:column;justify-content:space-between;
 background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.22);box-shadow:0 40px 80px rgba(0,0,0,.25);color:var(--ink)}
.poster h1{font-weight:900;font-size:var(--fs);line-height:.86;letter-spacing:-.06em}
.poster p{font-family:'Geist Mono',monospace;font-size:26px;text-transform:uppercase;letter-spacing:.06em;opacity:.8;line-height:1.5}
.poster small{font-family:'Geist Mono',monospace;font-size:22px;text-transform:uppercase;letter-spacing:.06em;opacity:.65}
.pair{display:flex;gap:6%;align-items:center;justify-content:center;width:100%}
`

// spec: { kind, w, h, bg, src (fayl yo'li yoki yo'llar massivi), scale, url, ar, ink, kicker, title, lines, fs }
function html(spec) {
  const src = (f) => pathToFileURL(f).href
  const s = spec
  let body = ''
  if (s.kind === 'laptop')
    body = `<div class="laptop" style="--w:${s.scale || 80}%"><div class="lid"><div class="scr"><img class="shot" src="${src(s.src)}"></div></div><div class="base"></div></div>`
  else if (s.kind === 'phone')
    body = `<div class="phone" style="--h:${s.scale || 84}vh"><div class="island"></div><div class="scr"><img class="shot" src="${src(s.src)}"></div></div>`
  else if (s.kind === 'phones')
    body = `<div class="pair">${[].concat(s.src)
      .map((f) => `<div class="phone" style="--h:${s.scale || 78}vh"><div class="island"></div><div class="scr"><img class="shot" src="${src(f)}"></div></div>`)
      .join('')}</div>`
  else if (s.kind === 'browser')
    body = `<div class="browser" style="--w:${s.scale || 86}%;--ar:${s.ar || '16/10'}"><div class="bar"><i></i><i></i><i></i><b>${esc(s.url)}</b></div><div class="scr"><img class="shot" src="${src(s.src)}"></div></div>`
  else {
    // sarlavha posterga sig'ishi uchun eng uzun qatorga qarab shrift o'lchami
    const longest = Math.max(1, ...String(s.title || '').split(/\n/).map((l) => l.length))
    const fit = Math.round(Math.min(190, (0.62 * (s.w || 1200)) / (longest * 0.56)))
    body = `<div class="poster" style="--ink:${esc(s.ink || '#fff')};--fs:${Number(s.fs) || fit}px"><small>${esc(s.kicker)}</small><h1>${esc(s.title).replace(/\n/g, '<br>')}</h1><p>${(s.lines || []).map(esc).join('<br>')}</p></div>`
  }
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;700;900&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>${CSS} body{background:${esc(s.bg || '#1c1b21')}}</style></head><body>${body}</body></html>`
}

const run = (bin, args) =>
  new Promise((ok, fail) => execFile(bin, args, { timeout: 60000 }, (e) => (e && e.killed ? fail(e) : ok())))

let queue = Promise.resolve()

// Bitta muqova chizadi va `outFile` ga yozadi. Navbat bilan ishlaydi (bir vaqtda bitta brauzer).
export function renderCover(spec, outFile) {
  const job = queue.then(async () => {
    const bin = browserBin()
    if (!bin) throw new Error('Edge yoki Chrome topilmadi (CHROME_BIN o‘rnating)')
    const tmp = join(tmpdir(), 'namdu-covers')
    mkdirSync(tmp, { recursive: true })
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
    const page = join(tmp, id + '.html')
    const png = join(tmp, id + '.png')
    writeFileSync(page, html(spec))
    await run(bin, [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      `--user-data-dir=${join(tmp, 'profile')}`,
      `--window-size=${spec.w || 1200},${spec.h || 1200}`,
      '--virtual-time-budget=4000',
      `--screenshot=${png}`,
      pathToFileURL(page).href,
    ])
    // Edge faylni jarayon tugagach yozishi mumkin — barqaror bo'lishini kutamiz
    let last = -1
    for (let i = 0; i < 100; i++) {
      await new Promise((r) => setTimeout(r, 200))
      if (!existsSync(png)) continue
      const size = statSync(png).size
      if (size > 0 && size === last) break
      last = size
    }
    if (!existsSync(png)) throw new Error('Rasm chizilmadi')
    writeFileSync(outFile, readFileSync(png))
    rmSync(png, { force: true })
    rmSync(page, { force: true })
    return outFile
  })
  queue = job.catch(() => {})
  return job
}
