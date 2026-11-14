// Barcha muqovalarni specs.mjs bo'yicha qayta yasaydi: node tools/covers/make.mjs
import { mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { renderCover } from '../../server/covers.js'
import { specs } from './specs.mjs'

const ROOT = resolve(import.meta.dirname, '../..')
const REAL = join(ROOT, 'public/img/real')
const OUT = join(ROOT, 'public/img/cover')
mkdirSync(OUT, { recursive: true })
// node tools/covers/make.mjs uv  →  faqat nomi shu bilan boshlanadiganlari
const only = process.argv[2]
for (const s of specs.filter((x) => !only || x.out.startsWith(only))) {
  const src = s.src ? [].concat(s.src).map((f) => join(REAL, f)) : undefined
  await renderCover({ ...s, src: s.kind === 'phones' ? src : src?.[0] }, join(OUT, s.out + '.png'))
  console.log('✓', s.out)
}
