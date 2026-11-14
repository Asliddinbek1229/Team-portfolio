import { useState } from 'react'
import { useAdmin } from './AdminApp'
import { ColorInput, Field, MediaPicker, Text, useToast } from './ui'

export const SIZES = {
  cover: { w: 1200, h: 1200, label: 'Muqova (kvadrat)' },
  wide: { w: 1400, h: 1050, label: 'Keng (4:3)' },
  full: { w: 1600, h: 900, label: 'To‘liq kenglik (16:9)' },
  half: { w: 1200, h: 1000, label: 'Yarim (6:5)' },
}
const KINDS = [
  ['laptop', 'Noutbuk'],
  ['browser', 'Brauzer oynasi'],
  ['phone', 'Telefon'],
  ['phones', 'Ikki telefon'],
  ['poster', 'Poster (matn)'],
]

// Ekran rasmidan templatedagi uslubdagi rasm yasaydi (server headless brauzerda chizadi)
export default function CoverMaker({ project, onUse, defaultSize = 'cover' }) {
  const { call } = useAdmin()
  const toast = useToast()
  const [s, setS] = useState({
    kind: 'laptop',
    size: defaultSize,
    bg: project?.color || '#1f3c66',
    src: [],
    url: project?.site || '',
    scale: '',
    ink: '#ffffff',
    kicker: project?.site || '',
    title: project?.name || '',
    lines: project?.services ? project.services.split(' · ').slice(0, 2).join('\n') : '',
  })
  const [pick, setPick] = useState(false)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState('')
  const set = (k) => (v) => setS((x) => ({ ...x, [k]: v }))
  const need = s.kind === 'phones' ? 2 : s.kind === 'poster' ? 0 : 1

  const make = async () => {
    setBusy(true)
    setResult('')
    try {
      const size = SIZES[s.size]
      const body = {
        kind: s.kind,
        w: size.w,
        h: size.h,
        bg: s.bg,
        name: project?.slug || 'muqova',
        src: s.kind === 'phones' ? s.src.slice(0, 2) : s.src[0],
        url: s.url,
        scale: s.scale ? Number(s.scale) : undefined,
        ink: s.ink,
        kicker: s.kicker,
        title: s.title,
        lines: s.lines.split('\n').filter(Boolean),
      }
      const r = await call('/cover', { method: 'POST', body })
      setResult(r.url)
    } catch {}
    setBusy(false)
  }

  return (
    <div className="a-maker">
      <div className="a-maker-form">
        <div className="a-seg">
          {KINDS.map(([k, l]) => (
            <button key={k} type="button" className={s.kind === k ? 'on' : ''} onClick={() => set('kind')(k)}>
              {l}
            </button>
          ))}
        </div>
        <div className="a-grid2">
          <Field label="O‘lcham">
            <select className="a-input" value={s.size} onChange={(e) => set('size')(e.target.value)}>
              {Object.entries(SIZES).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label} — {v.w}×{v.h}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Fon rangi">
            <ColorInput value={s.bg} onChange={set('bg')} />
          </Field>
        </div>
        {s.kind !== 'poster' ? (
          <>
            <Field label={need === 2 ? 'Ekran rasmlari (2 ta)' : 'Ekran rasmi'}>
              <div className="a-row wrap">
                {s.src.map((u) => (
                  <img key={u} src={u} alt="" className="a-mini" />
                ))}
                <button type="button" className="a-btn ghost sm" onClick={() => setPick(true)}>
                  {s.src.length ? 'Almashtirish' : 'Tanlash / yuklash'}
                </button>
              </div>
            </Field>
            <div className="a-grid2">
              {s.kind === 'browser' && (
                <Field label="Manzil satri">
                  <Text value={s.url} onChange={set('url')} placeholder="lms.namsu.uz" />
                </Field>
              )}
              <Field label="Qurilma o‘lchami, %" hint="Bo‘sh — standart">
                <Text value={s.scale} onChange={set('scale')} type="number" min="30" max="100" />
              </Field>
            </div>
          </>
        ) : (
          <>
            <div className="a-grid2">
              <Field label="Sarlavha" hint="Yangi qator uchun Enter">
                <Text area rows={2} value={s.title} onChange={set('title')} />
              </Field>
              <Field label="Matn rangi">
                <ColorInput value={s.ink} onChange={set('ink')} />
              </Field>
            </div>
            <div className="a-grid2">
              <Field label="Yuqori yozuv">
                <Text value={s.kicker} onChange={set('kicker')} />
              </Field>
              <Field label="Pastki qatorlar">
                <Text area rows={2} value={s.lines} onChange={set('lines')} />
              </Field>
            </div>
          </>
        )}
        <button type="button" className="a-btn primary" disabled={busy || s.src.length < need} onClick={make}>
          {busy ? 'Chizilmoqda… (5–10 soniya)' : 'Rasm yasash'}
        </button>
      </div>
      <div className="a-maker-out">
        {result ? (
          <>
            <img src={result} alt="" />
            <div className="a-row wrap">
              {onUse &&
                onUse.map(([label, fn]) => (
                  <button
                    key={label}
                    type="button"
                    className="a-btn sm"
                    onClick={() => {
                      fn(result)
                      toast(label + ' ✓')
                    }}
                  >
                    {label}
                  </button>
                ))}
            </div>
          </>
        ) : (
          <div className="a-maker-empty" style={{ background: s.bg, aspectRatio: `${SIZES[s.size].w} / ${SIZES[s.size].h}` }}>
            <span>Natija shu yerda chiqadi</span>
          </div>
        )}
      </div>
      <MediaPicker open={pick} onClose={() => setPick(false)} multiple={need === 2} onPick={(v) => set('src')([].concat(v))} />
    </div>
  )
}
