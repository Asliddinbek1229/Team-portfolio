import { useEffect, useMemo, useState } from 'react'
import { uploadFiles } from './api'
import { MediaPicker, useToast } from './ui'

// Koddagi rasm manzillarini topadi: <img src>, srcset, poster, CSS url(...)
export function findImageRefs(code) {
  const out = new Set()
  const add = (u) => {
    const s = String(u || '').trim().replace(/^['"]|['"]$/g, '')
    if (!s || s.startsWith('data:') || s.startsWith('#') || /^(about|javascript):/i.test(s)) return
    out.add(s)
  }
  for (const m of code.matchAll(/<(?:img|source|video)\b[^>]*?\b(?:src|poster)\s*=\s*["']([^"']+)["']/gi)) add(m[1])
  for (const m of code.matchAll(/\bsrcset\s*=\s*["']([^"']+)["']/gi)) m[1].split(',').forEach((part) => add(part.trim().split(/\s+/)[0]))
  for (const m of code.matchAll(/url\(\s*([^)]+?)\s*\)/gi)) if (!/fonts\.(googleapis|gstatic)/.test(m[1])) add(m[1])
  return [...out]
}

const baseName = (u) =>
  decodeURIComponent(String(u).split(/[?#]/)[0].split('/').pop() || '')
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/, '')
    .replace(/-[0-9a-f]{12}$/, '') // serverda qo'shilgan id
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const resolve = (u) => {
  try {
    return new URL(u, window.location.origin + '/').href
  } catch {
    return ''
  }
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
// faqat to'liq manzilni almashtiradi (qo'shtirnoq, qavs, vergul yoki bo'shliq bilan chegaralangan)
export const replaceRef = (code, from, to) =>
  code.replace(new RegExp(`(["'(\\s,])` + escapeRe(from) + `(?=["')\\s,])`, 'g'), (_, pre) => pre + to)

function useStatus(refs) {
  const [status, setStatus] = useState({})
  const key = refs.join('\n')
  useEffect(() => {
    let dead = false
    setStatus({})
    refs.forEach((r) => {
      const img = new Image()
      img.onload = () => !dead && setStatus((s) => ({ ...s, [r]: 'ok' }))
      img.onerror = () => !dead && setStatus((s) => ({ ...s, [r]: 'missing' }))
      img.src = resolve(r)
    })
    return () => {
      dead = true
    }
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps
  return status
}

// Kod ichidagi rasmlar ro'yxati: holati, yuklash va bog'lash
export default function ImageLinker({ code, onChange }) {
  const refs = useMemo(() => findImageRefs(code || ''), [code])
  const status = useStatus(refs)
  const [pickFor, setPickFor] = useState(null)
  const [busy, setBusy] = useState(false)
  const toast = useToast()
  if (!refs.length) return null
  const missing = refs.filter((r) => status[r] === 'missing')
  const okCount = refs.filter((r) => status[r] === 'ok').length

  // Bir nechta faylni yuklab, nomi bo'yicha (bo'lmasa — tartib bo'yicha) yo'q rasmlarga bog'laydi
  const uploadMany = async (files, onlyRef) => {
    if (!files?.length) return
    setBusy(true)
    try {
      const list = [...files]
      const res = await uploadFiles(list)
      let next = code
      const todo = onlyRef ? [onlyRef] : [...missing]
      const pairs = res.map((r, i) => ({ url: r.url, name: baseName(list[i].name) }))
      let linked = 0
      // 1) nom bo'yicha
      for (const ref of [...todo]) {
        const hit = pairs.find((p) => !p.used && p.name && p.name === baseName(ref))
        if (hit) {
          next = replaceRef(next, ref, hit.url)
          hit.used = true
          todo.splice(todo.indexOf(ref), 1)
          linked++
        }
      }
      // 2) qolganlari tartib bo'yicha
      for (const ref of todo) {
        const hit = pairs.find((p) => !p.used)
        if (!hit) break
        next = replaceRef(next, ref, hit.url)
        hit.used = true
        linked++
      }
      onChange(next)
      toast(`${res.length} ta rasm yuklandi, ${linked} tasi bog‘landi`)
    } catch (e) {
      toast(e.message, 'err')
    }
    setBusy(false)
  }

  return (
    <div className={'a-linker' + (missing.length ? ' has-missing' : '')}>
      <div className="a-row between">
        <span className="a-label">
          Koddagi rasmlar · {okCount}/{refs.length} topildi
        </span>
        {missing.length > 0 && (
          <label className="a-btn primary sm">
            {busy ? 'Yuklanmoqda…' : `Yo‘q rasmlarni yuklash (${missing.length})`}
            <input type="file" accept="image/*" multiple hidden onChange={(e) => uploadMany(e.target.files)} />
          </label>
        )}
      </div>
      {missing.length > 0 && (
        <p className="a-hint">
          AI’ga biriktirgan rasmlaringizni shu yerga yuklang — fayl nomi mos kelsa o‘zi bog‘lanadi, aks holda tartib bo‘yicha. Yoki har birini alohida
          tanlang.
        </p>
      )}
      <div className="a-linker-list">
        {refs.map((r) => (
          <div key={r} className={'a-linker-row ' + (status[r] || 'wait')}>
            <span className="a-linker-thumb">{status[r] === 'ok' ? <img src={resolve(r)} alt="" /> : status[r] === 'missing' ? '✕' : '…'}</span>
            <code title={r}>{r}</code>
            <span className="a-row">
              <label className="a-btn ghost sm">
                Yuklash
                <input type="file" accept="image/*" hidden onChange={(e) => uploadMany(e.target.files, r)} />
              </label>
              <button type="button" className="a-btn ghost sm" onClick={() => setPickFor(r)}>
                Media’dan
              </button>
            </span>
          </div>
        ))}
      </div>
      <MediaPicker
        open={pickFor !== null}
        onClose={() => setPickFor(null)}
        onPick={(url) => {
          onChange(replaceRef(code, pickFor, url))
          toast('Rasm bog‘landi')
        }}
      />
    </div>
  )
}
