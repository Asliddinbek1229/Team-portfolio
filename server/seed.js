// Boshlang'ich bazani yaratadi (server/data/db.json). Mavjud bazani faqat --force bilan qayta yozadi.
// node server/seed.js [--force]
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import crypto from 'node:crypto'
import { seedProjects } from './seed-projects.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const DB = join(HERE, 'data', 'db.json')
if (existsSync(DB) && !process.argv.includes('--force')) {
  console.log('db.json allaqachon bor — o‘zgartirilmadi (qayta yaratish uchun --force)')
  process.exit(0)
}
mkdirSync(dirname(DB), { recursive: true })
const id = () => crypto.randomBytes(6).toString('hex')

const db = {
  settings: {
    siteTitle: 'NamDU IT Park · Raqamli universitet',
    logo: 'NamDU',
    heroEyebrow: 'IT Park · Namangan',
    heroTitle: 'Raqamli universitetni quramiz',
    heroTitleDim: 'va uning tizimlarini.',
    workIntro: 'Tizimlar, saytlar va botlar',
    studioEyebrow: 'IT Park · Namangan',
    studioTitle: 'Universitet ichidagi IT jamoa.',
    studioLead: 'IT Park universitetning o‘z ehtiyojlari uchun tizim yaratish maqsadida tashkil etilgan.',
    studioText:
      'Bugun jamoada dizaynerlar, dasturchilar va loyiha menejeri bir xonada ishlaydi. Bir vaqtda bir nechta loyiha olamiz — shuning uchun birinchi uchrashuvdagi odamlar ishni o‘zi bajaradi.',
    quote: '“Hisobot so‘rab fakultetlarga xat yozmaymiz. Raqam ertalab tayyor turadi.”',
    quoteAuthor: 'Rektorat, NamDU',
    openRoles: ['Senior Go dasturchi', 'Mahsulot dizayneri'],
    contactIntro: 'Har bir xabarni mas’ul o‘qiydi va ikki ish kunida javob beradi',
    emails: ['itpark@namdu.uz', 'info@namdu.uz'],
    phone: '(69) 227-01-44',
    address: 'Uychi ko‘chasi 316, Namangan',
    telegram: 'https://t.me/',
    instagram: 'https://instagram.com/',
    youtube: 'https://youtube.com/',
    footerTitle: 'Fikringiz bormi?',
    stripDrift: 30,
  },
  projects: seedProjects.map((p) => ({ id: id(), hidden: false, ...p })),
  team: [
    ['Ism Familiya', 'IT Park rahbari'],
    ['Ism Familiya', 'Texnik direktor'],
    ['Ism Familiya', 'Dizayn yetakchisi'],
    ['Ism Familiya', 'Loyiha menejeri'],
    ['Ism Familiya', 'Kreativ dasturchi'],
    ['Ism Familiya', 'Katta dizayner'],
    ['Ism Familiya', 'Backend dasturchi'],
    ['Ism Familiya', 'Motion dizayner'],
    ['Ism Familiya', 'Frontend dasturchi'],
  ].map(([name, role], i) => ({ id: id(), name, role, photo: `/img/team${i + 1}.jpg` })),
  posts: [
    ['Narx', '4 daqiqa', 'Tizim va sayt aslida qancha turadi', 'Loyihalarimiz 3 oydan 6 oygacha davom etadi. Narxga nima kiradi, uni nima oshiradi va qanday nazorat qilinadi.'],
    ['Muddat', '4 daqiqa', 'Tizimni qayta qurish qancha vaqt oladi', 'Vaqt qayerga ketadi, nima sekinlashtiradi va ishga tushirish sanasini qanday kelishamiz.'],
    ['Egalik', '3 daqiqa', 'Ishga tushganda universitetda nima qolishi kerak', 'Akkauntlar, manba kodi va uni o‘zgartirish bilimi — imzo qo‘yishdan oldin tekshiriladigan ro‘yxat.'],
    ['Hamkorlik', '3 daqiqa', 'Jamoani tanlashdan oldin beriladigan to‘qqiz savol', 'Portfolio nima qila olishini ko‘rsatadi. Bu savollar esa qanday ishlashini ko‘rsatadi.'],
    ['Qarorlar', '4 daqiqa', 'Django, Go yoki tayyor platforma: qanday tanlaymiz', 'Uchta yaxshi yo‘l. Kim tahrirlaydi va tizim nima qilishi kerakligiga qarab tanlaymiz.'],
    ['Qarorlar', '3 daqiqa', 'HEMIS integratsiyasi qachon arziydi', 'Ma’lumot bir marta kiritiladi — lekin har doim ham emas. Qanday hal qilamiz.'],
  ].map(([category, read, title, excerpt], i) => ({ id: id(), category, read, title, excerpt, image: `/img/post${i + 1}.jpg`, url: '' })),
  updatedAt: new Date().toISOString(),
}

writeFileSync(DB, JSON.stringify(db, null, 2))
console.log('✓ db.json yaratildi:', db.projects.length, 'loyiha')
