# NamDU IT Park — portfolio va taqdimot sayti

Namangan davlat universiteti IT Park tomonidan yaratilgan tizimlar (LMS, Keldi-Ketti, UniScore, UniVision,
Namdu MQB, Raqamli kutubxona, UniDoc) taqdimoti. Har bir loyiha sahifasi — animatsiyali slayder.
Yorug' va qorong'i mavzu (headerdagi quyosh/oy tugmasi).

- **Sayt:** React 18 + Vite
- **Server:** Node.js + Express — API, admin panel (`/admin`) va tayyor saytni beradi
- **Baza:** `server/data/db.json` (JSON fayl), yuklangan rasmlar — `server/uploads/`

Loyiha hozircha **o'z kompyuterda** ishga tushiriladi va lokal tarmoq orqali ko'rsatiladi.

## Birinchi marta (bir martalik)

Kerak: [Node.js 20+](https://nodejs.org) (LTS).

```bash
npm install
copy server\.env.example server\.env
```

`server/.env` faylini oching va `ADMIN_PASSWORD` (admin panel paroli) hamda `ADMIN_SECRET` ni yozing.
`ADMIN_SECRET` uchun tasodifiy satr: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## 1-usul: taqdimot / namoyish — `start-demo.cmd`

`start-demo.cmd` fayliga **ikki marta bosing**. U saytni yig'adi (build) va 8080-portda ishga tushiradi,
oynada ochiladigan manzillarni ko'rsatadi:

- shu kompyuterda: `http://localhost:8080`
- tarmoqdagi boshqa kompyuterlardan: `http://<kompyuter-IP>:8080`
- admin panel: manzil oxiriga `/admin`

Oyna ochiq turgan paytda sayt ishlaydi; oynani yopsangiz yoki `Ctrl+C` bossangiz — to'xtaydi.

**Boshqa kompyuterlardan ochilishi uchun** Windows Firewall'da 8080-portga bir marta ruxsat bering
(PowerShell — administrator sifatida):

```bash
New-NetFirewallRule -DisplayName "NamDU portfolio 8080" -Direction Inbound -Protocol TCP -LocalPort 8080 -Action Allow -Profile Private,Domain
```

Taqdimot kuni: kompyuter uxlab qolmasin (Параметры → Система → Питание → «Никогда»),
kompyuter IP'si o'zgarishi mumkin — to'g'ri manzil har safar `start-demo.cmd` oynasida ko'rinadi.

## 2-usul: dasturlash (kodni o'zgartirish)

```bash
npm run dev
```

`http://localhost:5180` — kod o'zgarishi brauzerda darhol ko'rinadi (Vite), admin: `/admin`.
Bu rejim faqat shu kompyuter uchun. `npm run dev` va `start-demo.cmd` ni **bir vaqtda ishlatmang** —
ikkalasi bitta bazaga (`db.json`) yozadi.

## Ma'lumotlar va zaxira

- Loyihalar, jamoa, sozlamalar — `server/data/db.json`; admin panel orqali tahrirlanadi.
- Admin panel har o'zgarishda `server/data/backups/` ga avtomatik nusxa oladi (oxirgi 30 tasi).
- Gitda boshlang'ich nusxa `server/data/db.seed.json` turadi: `db.json` bo'lmasa, undan yaratiladi.
  `db.json` va yuklangan rasmlar (`server/uploads/`) gitga tushmaydi — ularni vaqti-vaqti bilan
  alohida nusxalab qo'ying.

## Muhim: shaxsiy ma'lumotlar

Skrinshotlardagi talaba/xodim ismlari, yuzlari va ID'lari xiralashtirilgan (`public/img/real/*-safe.png`).
Asl rasmlar `private/` papkada turadi va **gitga tushmaydi**. Yangi skrinshot qo'shishdan oldin
shaxsiy ma'lumotlarni xiralashtiring: `node tools/blur.mjs <nom-prefiksi>`.

## Keyinchalik serverga chiqarish

Server tayyorlangan: `npm run build && npm start` (yoki PM2: `ecosystem.config.cjs`),
port va manzil `server/.env` dagi `API_PORT` / `HOST` bilan beriladi.
