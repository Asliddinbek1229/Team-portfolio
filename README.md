# NamDU IT Park — portfolio va taqdimot sayti

Namangan davlat universiteti IT Park tomonidan yaratilgan tizimlar (LMS, Keldi-Ketti, UniScore, UniVision,
Namdu MQB, Raqamli kutubxona, UniDoc) taqdimoti. Har bir loyiha sahifasi — animatsiyali slayder.

- **Sayt:** React 18 + Vite
- **Server:** Node.js + Express — API, admin panel (`/admin`) va tayyor saytni beradi
- **Baza:** `server/data/db.json` (JSON fayl), yuklangan rasmlar — `server/uploads/`

## Mahalliy ishga tushirish

```bash
npm install
cp server/.env.example server/.env   # parolni o'zgartiring
npm run dev                          # http://localhost:5180 , admin: /admin
```

## Universitet serverida ishga tushirish (domensiz, IP orqali)

Talab: Ubuntu/Debian server, **Node.js 20+**, git.

```bash
# 1. Node.js 20 (agar yo'q bo'lsa)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git
sudo npm install -g pm2

# 2. Loyihani olish
git clone <REPO_URL> namdu-portfolio
cd namdu-portfolio
npm ci
npm run build

# 3. Maxfiy sozlamalar
cp server/.env.example server/.env
nano server/.env        # ADMIN_PASSWORD, ADMIN_SECRET, API_PORT ni o'zgartiring

# 4. Doimiy ishga tushirish
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup             # chiqqan buyruqni nusxalab bajaring — server qayta yuklansa ham sayt o'zi yoqiladi

# 5. Portni ochish (ufw ishlatilsa)
sudo ufw allow 8080/tcp
```

Sayt: `http://SERVER_IP:8080` · Admin: `http://SERVER_IP:8080/admin`

Birinchi ishga tushishda `server/data/db.json` gitdagi `db.seed.json` dan avtomatik yaratiladi.
Shundan keyin barcha o'zgarishlar admin panel orqali kiritiladi va `git pull` ularni o'chirmaydi.

### Yangilash

```bash
cd namdu-portfolio
git pull
npm ci
npm run build
pm2 restart namdu-portfolio
```

### Foydali buyruqlar

```bash
pm2 status                      # holat
pm2 logs namdu-portfolio        # loglar
pm2 restart namdu-portfolio     # qayta ishga tushirish
```

### Zaxira nusxa

Serverdagi ma'lumot faqat shu ikki joyda — ularni vaqti-vaqti bilan nusxalab turing:

```bash
tar czf ~/namdu-backup-$(date +%F).tgz server/data/db.json server/uploads
```

Admin panel ham har o'zgarishda `server/data/backups/` ga avtomatik nusxa oladi (oxirgi 30 tasi).

### Domen ulanganda

Domen (masalan `itpark.namdu.uz`) berilgach, oldiga nginx qo'yiladi va HTTPS yoqiladi.
Shunda `API_PORT` ni yopiq qoldirib, faqat 80/443 ochiladi.

## Muhim: shaxsiy ma'lumotlar

Skrinshotlardagi talaba/xodim ismlari, yuzlari va ID'lari xiralashtirilgan (`public/img/real/*-safe.png`).
Asl rasmlar `private/` papkada turadi va **gitga tushmaydi**. Yangi skrinshot qo'shishdan oldin
shaxsiy ma'lumotlarni xiralashtiring: `node tools/blur.mjs <nom-prefiksi>`.
