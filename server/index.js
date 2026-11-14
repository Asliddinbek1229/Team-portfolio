// NamDU IT Park portfolio — API server.
// Kontent `server/data/db.json` da, yuklangan rasmlar `server/uploads` da saqlanadi.
// Ishga tushirish: npm run dev (Vite + server birga) yoki npm start (production).
import express from 'express'
import multer from 'multer'
import crypto from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync, copyFileSync } from 'node:fs'
import { dirname, extname, join, resolve, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { renderCover } from './covers.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')
const DATA = join(HERE, 'data')
const DB = join(DATA, 'db.json')
const SEED = join(DATA, 'db.seed.json')
const UPLOADS = join(HERE, 'uploads')
const PUBLIC = join(ROOT, 'public')
const DIST = join(ROOT, 'dist')
mkdirSync(UPLOADS, { recursive: true })
mkdirSync(join(DATA, 'backups'), { recursive: true })
// Birinchi ishga tushishda ishchi baza gitdagi boshlang'ich nusxadan yaratiladi.
// Keyin db.json faqat admin orqali o'zgaradi va git pull uni ustidan yozmaydi.
if (!existsSync(DB) && existsSync(SEED)) {
  copyFileSync(SEED, DB)
  console.log('db.json boshlang‘ich nusxadan (db.seed.json) yaratildi')
}

// ---- .env ----
const envFile = join(HERE, '.env')
if (existsSync(envFile))
  for (const line of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line)
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
  }
const PASSWORD = process.env.ADMIN_PASSWORD || ''
const SECRET = process.env.ADMIN_SECRET || crypto.createHash('sha256').update('namdu:' + PASSWORD).digest('hex')
const PORT = Number(process.env.API_PORT || 5181)
const HOST = process.env.HOST || '0.0.0.0' // serverda IP orqali ochilishi uchun barcha interfeyslarda tinglaydi
if (!PASSWORD) console.warn('⚠  ADMIN_PASSWORD o‘rnatilmagan (server/.env) — admin panelga kirib bo‘lmaydi')

// ---- baza ----
const COLLECTIONS = ['projects', 'team', 'posts']
const read = () => JSON.parse(readFileSync(DB, 'utf8'))
let backupAt = 0
function write(db) {
  // har 10 daqiqada bitta zaxira nusxa
  if (Date.now() - backupAt > 10 * 60 * 1000 && existsSync(DB)) {
    backupAt = Date.now()
    const stamp = new Date().toISOString().replace(/[:.]/g, '-')
    copyFileSync(DB, join(DATA, 'backups', `db-${stamp}.json`))
    const all = readdirSync(join(DATA, 'backups')).sort()
    all.slice(0, Math.max(0, all.length - 30)).forEach((f) => rmSync(join(DATA, 'backups', f)))
  }
  db.updatedAt = new Date().toISOString()
  const tmp = DB + '.tmp'
  writeFileSync(tmp, JSON.stringify(db, null, 2))
  renameSync(tmp, DB)
  return db
}
const newId = () => crypto.randomBytes(6).toString('hex')
const slugify = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/[ʻʼ‘’'`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'loyiha'

// ---- autentifikatsiya (HMAC imzoli token, 7 kun) ----
const sign = (payload) => crypto.createHmac('sha256', SECRET).update(payload).digest('base64url')
function issue() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + 7 * 864e5 })).toString('base64url')
  return payload + '.' + sign(payload)
}
function verify(token) {
  if (!token || !token.includes('.')) return false
  const [payload, sig] = token.split('.')
  const good = sign(payload)
  if (sig.length !== good.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good))) return false
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString()).exp > Date.now()
  } catch {
    return false
  }
}
const auth = (req, res, next) => {
  const t = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (!verify(t)) return res.status(401).json({ error: 'Avtorizatsiya talab qilinadi' })
  next()
}
const attempts = new Map()

// ---- app ----
const app = express()
app.disable('x-powered-by')
// Universitet proxy'si (ichki tarmoqdagi openresty/nginx) orqali kelganda mijozning haqiqiy IP'si
// X-Forwarded-For dan olinadi — login urinishlarini cheklash har bir foydalanuvchiga alohida ishlashi uchun.
app.set('trust proxy', 'loopback, uniquelocal')
app.use(express.json({ limit: '2mb' }))
app.use('/uploads', express.static(UPLOADS, { maxAge: '7d' }))

app.get('/api/content', (_req, res) => {
  const db = read()
  res.json({ ...db, projects: db.projects.filter((p) => !p.hidden) })
})

app.post('/api/login', (req, res) => {
  const ip = req.ip
  const a = attempts.get(ip) || { n: 0, until: 0 }
  if (a.until > Date.now()) return res.status(429).json({ error: 'Ko‘p urinish. Birozdan keyin qayta urining.' })
  const pw = String(req.body?.password || '')
  const ok =
    PASSWORD &&
    pw.length === PASSWORD.length &&
    crypto.timingSafeEqual(Buffer.from(pw), Buffer.from(PASSWORD))
  if (!ok) {
    a.n++
    if (a.n >= 5) {
      a.until = Date.now() + 5 * 60 * 1000
      a.n = 0
    }
    attempts.set(ip, a)
    return res.status(401).json({ error: 'Parol noto‘g‘ri' })
  }
  attempts.delete(ip)
  res.json({ token: issue() })
})

const admin = express.Router()
admin.use(auth)

admin.get('/content', (_req, res) => res.json(read()))

admin.put('/settings', (req, res) => {
  const db = read()
  db.settings = { ...db.settings, ...(req.body || {}) }
  res.json(write(db).settings)
})

const col = (req, res) => {
  if (!COLLECTIONS.includes(req.params.col)) {
    res.status(404).json({ error: 'Noma’lum bo‘lim' })
    return null
  }
  return req.params.col
}

admin.post('/:col(projects|team|posts)', (req, res) => {
  const c = col(req, res)
  if (!c) return
  const db = read()
  const item = { ...req.body, id: newId() }
  if (c === 'projects') {
    item.slug = uniqueSlug(db, item.slug || item.name)
  }
  const at = req.query.at === 'start' ? 0 : db[c].length
  db[c].splice(at, 0, item)
  write(db)
  res.json(item)
})

admin.put('/:col(projects|team|posts)/order', (req, res) => {
  const c = col(req, res)
  if (!c) return
  const db = read()
  const ids = Array.isArray(req.body?.ids) ? req.body.ids : []
  const byId = new Map(db[c].map((x) => [x.id, x]))
  const sorted = ids.map((id) => byId.get(id)).filter(Boolean)
  db[c].forEach((x) => !ids.includes(x.id) && sorted.push(x))
  db[c] = sorted
  write(db)
  res.json(db[c].map((x) => x.id))
})

admin.put('/:col(projects|team|posts)/:id', (req, res) => {
  const c = col(req, res)
  if (!c) return
  const db = read()
  const i = db[c].findIndex((x) => x.id === req.params.id)
  if (i < 0) return res.status(404).json({ error: 'Topilmadi' })
  const next = { ...db[c][i], ...req.body, id: db[c][i].id }
  if (c === 'projects') next.slug = uniqueSlug(db, next.slug || next.name, next.id)
  db[c][i] = next
  write(db)
  res.json(next)
})

admin.delete('/:col(projects|team|posts)/:id', (req, res) => {
  const c = col(req, res)
  if (!c) return
  const db = read()
  const before = db[c].length
  db[c] = db[c].filter((x) => x.id !== req.params.id)
  if (db[c].length === before) return res.status(404).json({ error: 'Topilmadi' })
  write(db)
  res.json({ ok: true })
})

function uniqueSlug(db, wanted, selfId) {
  const base = slugify(wanted)
  let s = base
  let n = 2
  while (db.projects.some((p) => p.slug === s && p.id !== selfId)) s = `${base}-${n++}`
  return s
}

// ---- media ----
const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOADS,
    filename: (_req, file, cb) => {
      const ext = (extname(file.originalname) || '.png').toLowerCase().replace(/[^.a-z0-9]/g, '')
      const name = slugify(basename(file.originalname, extname(file.originalname))).slice(0, 40)
      cb(null, `${name}-${newId()}${ext}`)
    },
  }),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, /^image\/(png|jpe?g|webp|gif|svg\+xml)$/.test(file.mimetype)),
})

admin.post('/upload', upload.array('files', 20), (req, res) => {
  res.json((req.files || []).map((f) => ({ url: '/uploads/' + f.filename, name: f.filename, size: f.size })))
})

function listMedia() {
  const out = []
  const walk = (dir, urlBase, source) => {
    if (!existsSync(dir)) return
    for (const f of readdirSync(dir)) {
      const p = join(dir, f)
      const st = statSync(p)
      if (st.isDirectory()) walk(p, urlBase + f + '/', source)
      else if (/\.(png|jpe?g|webp|gif|svg)$/i.test(f)) out.push({ url: urlBase + f, name: f, size: st.size, mtime: st.mtimeMs, source })
    }
  }
  walk(UPLOADS, '/uploads/', 'upload')
  walk(join(PUBLIC, 'img'), '/img/', 'public')
  return out.sort((a, b) => b.mtime - a.mtime)
}
admin.get('/media', (_req, res) => res.json(listMedia()))

admin.delete('/media', (req, res) => {
  const url = String(req.query.url || '')
  if (!url.startsWith('/uploads/') || url.includes('..')) return res.status(400).json({ error: 'Faqat yuklangan fayllarni o‘chirish mumkin' })
  rmSync(join(UPLOADS, url.slice('/uploads/'.length)), { force: true })
  res.json({ ok: true })
})

// URL (/uploads/.. yoki /img/..) -> diskdagi fayl
function localFile(url) {
  const u = String(url || '').split('?')[0]
  if (u.includes('..')) return null
  if (u.startsWith('/uploads/')) return join(UPLOADS, u.slice(9))
  if (u.startsWith('/')) return join(PUBLIC, u.slice(1))
  return null
}

admin.post('/cover', async (req, res) => {
  try {
    const s = { ...req.body }
    const srcs = [].concat(s.src || []).filter(Boolean)
    if (s.kind !== 'poster') {
      if (!srcs.length) return res.status(400).json({ error: 'Ekran rasmini tanlang' })
      const files = srcs.map(localFile)
      if (files.some((f) => !f || !existsSync(f))) return res.status(400).json({ error: 'Rasm topilmadi' })
      s.src = s.kind === 'phones' ? files : files[0]
    }
    s.w = Math.min(2400, Math.max(400, Number(s.w) || 1200))
    s.h = Math.min(2400, Math.max(400, Number(s.h) || 1200))
    mkdirSync(join(UPLOADS, 'covers'), { recursive: true })
    const name = `covers/${slugify(s.name || s.kind)}-${newId()}.png`
    await renderCover(s, join(UPLOADS, name))
    res.json({ url: '/uploads/' + name })
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) })
  }
})

admin.get('/backups', (_req, res) => res.json(readdirSync(join(DATA, 'backups')).sort().reverse()))
admin.post('/backups/:name/restore', (req, res) => {
  const f = join(DATA, 'backups', basename(req.params.name))
  if (!existsSync(f)) return res.status(404).json({ error: 'Topilmadi' })
  const db = JSON.parse(readFileSync(f, 'utf8'))
  backupAt = 0
  res.json(write(db))
})

app.use('/api/admin', admin)
app.use('/api', (_req, res) => res.status(404).json({ error: 'Topilmadi' }))
app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: err.message || 'Server xatosi' })
})

// production: tayyor frontendni ham beradi
if (existsSync(DIST)) {
  app.use(express.static(DIST))
  app.get('*', (_req, res) => res.sendFile(join(DIST, 'index.html')))
}

app.listen(PORT, HOST, () => console.log(`Server: http://${HOST === '0.0.0.0' ? 'SERVER_IP' : HOST}:${PORT}` + (existsSync(DIST) ? '  (sayt + admin + API)' : '  (faqat API — avval npm run build)')))
