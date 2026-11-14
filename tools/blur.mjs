// Ekran rasmlaridagi shaxsiy ma'lumotlarni (ism, ID, yuz surati) xiralashtiradi.
// node tools/blur.mjs  →  public/img/real/<nom>-safe.png
import { execFile } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { browserBin } from '../server/covers.js'

// xiralashtirilgan nusxa saytga (public), asl rasm esa gitga tushmaydigan private/ papkada turadi
const REAL = resolve(import.meta.dirname, '../public/img/real')
const PRIVATE = resolve(import.meta.dirname, '../private/real')
const srcOf = (f) => (existsSync(join(PRIVATE, f)) ? join(PRIVATE, f) : join(REAL, f))
// [x, y, w, h] — rasmning asl o'lchamidagi piksellar
const JOBS = [
  { src: 'kk-live.jpg', w: 1600, h: 1000, rects: [[60, 262, 380, 738]] },
  { src: 'kk-students.jpg', w: 1600, h: 1000, rects: [[60, 648, 490, 352]] },
  { src: 'lms-risk.jpg', w: 1920, h: 1200, rects: [[372, 905, 560, 295]] },
  { src: 'kk-night.jpg', w: 1600, h: 1000, rects: [[66, 786, 520, 214], [842, 786, 520, 214]] },
  // UniScore: tepadagi foydalanuvchi ismi + xodimlar ismlari (ball/foiz bilan)
  { src: 'kpi-program.jpg', w: 2400, h: 1500, rects: [[2070, 15, 290, 85], [770, 826, 185, 40], [462, 1202, 820, 46]] },
  { src: 'kpi-stats.jpg', w: 2400, h: 1500, rects: [[2070, 15, 290, 85], [500, 1300, 700, 200]] },
  { src: 'kpi-reports.jpg', w: 2400, h: 1500, rects: [[2070, 15, 290, 85], [550, 990, 550, 510]] },
  { src: 'kpi-steps.jpg', w: 2720, h: 1700, rects: [[2275, 28, 380, 115]] },
  { src: 'kpi-entry.jpg', w: 2720, h: 1700, rects: [[2275, 28, 380, 115]] },
  { src: 'kpi-person.jpg', w: 2720, h: 1700, rects: [[2275, 28, 380, 115], [565, 18, 680, 70], [565, 235, 810, 120]] },
  { src: 'kpi-ranking.jpg', w: 2720, h: 1700, rects: [[2275, 28, 380, 115], [735, 1305, 370, 395]] },
  { src: 'kpi-mobile.jpg', w: 1170, h: 2532, rects: [[50, 575, 820, 70], [900, 45, 125, 120]] },
  // UniVision: kamera kadrlari — yengil (5-6px: xona ko'rinadi, yuz tanilmaydi), ismlar — kuchli
  { src: 'uv-mosaic.webp', w: 1905, h: 908, rects: [[268, 150, 1615, 758, 5, 0], [18, 852, 222, 40]] },
  { src: 'uv-common.webp', w: 1902, h: 903, rects: [[18, 848, 222, 40]] },
  {
    src: 'uv-rooms.webp', w: 1901, h: 905,
    rects: [[292, 70, 1568, 218, 5, 0], [292, 653, 1568, 252, 5, 0], [312, 512, 130, 22], [707, 512, 110, 22], [1102, 512, 100, 22], [1497, 512, 100, 22], [18, 852, 222, 40]],
  },
  {
    src: 'uv-room.webp', w: 1901, h: 900,
    rects: [[280, 172, 1053, 594, 6, 0], [1405, 350, 130, 26], [1400, 731, 125, 20], [1400, 825, 125, 20], [18, 848, 222, 40]],
  },
  {
    src: 'uv-feedback.png', w: 1901, h: 905,
    rects: [[278, 722, 50, 150, 4, 0], [730, 735, 110, 130], [1668, 708, 120, 185], [18, 852, 222, 40]],
  },
  // Namdu MQB: xodimlar ismi va emaili, dashboarddagi admin ismi
  { src: 'mqb-staff.png', w: 1920, h: 911, rects: [[500, 548, 615, 363]] },
  { src: 'mqb-dashboard.png', w: 1920, h: 911, rects: [[543, 156, 395, 36]] },
  // Raqamli kutubxona (arm.namdu.uz): tepadagi foydalanuvchi ismi/surati + kitobxon va xodimlar ma'lumotlari
  ...[
    ['lib-landing.webp', 1907, 943, []],
    ['lib-books.webp', 1914, 944, []],
    ['lib-transfers.webp', 1915, 945, []],
    ['lib-writeoff.webp', 1914, 948, []],
    ['lib-visits.webp', 1916, 950, []],
    ['lib-reports.webp', 1914, 950, []],
    ['lib-roles.webp', 1911, 946, []],
    ['lib-dashboard.webp', 1912, 948, [[345, 132, 590, 110], [1265, 862, 600, 86]]],
    ['lib-branches.webp', 1916, 944, [[380, 596, 1405, 112], [380, 925, 1405, 19]]],
    ['lib-give.webp', 1910, 946, [[380, 532, 670, 414]]],
    ['lib-return.webp', 1911, 950, [[380, 606, 670, 344]]],
    ['lib-loans.webp', 1910, 950, [[912, 715, 330, 235]]],
    ['lib-users.png', 1916, 946, [[372, 488, 250, 458]]],
  ].map(([src, w, h, extra]) => ({ src, w, h, rects: [[1580, 14, 300, 70], ...extra] })),
  // UniDoc (unidoc.namdu.uz): tepadagi profil + o'qituvchi, mudir va tasdiqlovchilar ismlari
  ...[
    ['ud-home.webp', 1914, 943, []],
    ['ud-stats.png', 1913, 946, []],
    ['ud-ai.png', 1916, 945, []],
    ['ud-users.png', 1914, 947, [[412, 360, 770, 587]]],
    ['ud-docs.png', 1908, 948, [[965, 340, 175, 608], [1320, 330, 345, 618]]],
    ['ud-catalog.png', 1911, 949, [[1180, 350, 250, 599]]],
    ['ud-plans.png', 1918, 948, [[1012, 345, 300, 603]]],
    ['ud-workplans.png', 1913, 943, [[388, 405, 460, 538]]],
  ].map(([src, w, h, extra]) => ({ src, w, h, rects: [[1485, 10, 280, 66], ...extra] })),
  { src: 'ud-schedule.jpg', w: 1568, h: 772, rects: [[1220, 10, 220, 52]] },
  {
    src: 'ud-workplan.jpg', w: 1568, h: 772,
    rects: [[1220, 10, 220, 52], [298, 38, 310, 20], [352, 103, 240, 22], [1240, 404, 225, 18], [735, 596, 330, 36]],
  },
]
// node tools/blur.mjs uv-  →  faqat nomi shu bilan boshlanadigan rasmlar
const only = process.argv[2]

const run = (bin, args) => new Promise((ok) => execFile(bin, args, { timeout: 60000 }, () => ok()))
const tmp = join(tmpdir(), 'namdu-blur')
mkdirSync(tmp, { recursive: true })
const bin = browserBin()

for (const j of JOBS.filter((x) => !only || x.src.startsWith(only))) {
  // [x, y, w, h, blur=14, radius=10]
  const boxes = j.rects
    .map(
      ([x, y, w, h, b = 14, r = 10]) =>
        `<i style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;backdrop-filter:blur(${b}px)${b < 10 ? '' : ' saturate(.6)'};-webkit-backdrop-filter:blur(${b}px);border-radius:${r}px;${b < 10 ? 'background:none' : ''}"></i>`,
    )
    .join('')
  const html = `<!doctype html><html><head><style>
html,body{margin:0;width:${j.w}px;height:${j.h}px;overflow:hidden;background:#000}
img{position:absolute;inset:0;width:${j.w}px;height:${j.h}px}
i{position:absolute;backdrop-filter:blur(14px) saturate(.6);-webkit-backdrop-filter:blur(14px);background:rgba(10,12,20,.18);border-radius:10px}
</style></head><body><img src="${pathToFileURL(srcOf(j.src)).href}">${boxes}</body></html>`
  const page = join(tmp, j.src + '.html')
  const out = join(tmp, j.src + '.png')
  writeFileSync(page, html)
  if (existsSync(out)) rmSync(out)
  await run(bin, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', `--user-data-dir=${join(tmp, 'p')}`,
    `--window-size=${j.w},${j.h}`, '--virtual-time-budget=2000', `--screenshot=${out}`, pathToFileURL(page).href])
  let last = -1
  for (let k = 0; k < 100; k++) {
    await new Promise((r) => setTimeout(r, 200))
    if (!existsSync(out)) continue
    const s = statSync(out).size
    if (s > 0 && s === last) break
    last = s
  }
  const dest = join(REAL, j.src.replace(/\.(jpg|webp|png)$/, '-safe.png'))
  if (dest === srcOf(j.src)) throw new Error('Asl fayl ustiga yozilmaydi: ' + j.src)
  writeFileSync(dest, readFileSync(out))
  console.log('✓', dest)
}
