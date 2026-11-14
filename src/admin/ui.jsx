import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { api, uploadFiles } from './api'

// ───────── toast ─────────
const ToastCtx = createContext(() => {})
export function ToastHost({ children }) {
  const [items, setItems] = useState([])
  const push = useCallback((text, kind = 'ok') => {
    const id = Math.random()
    setItems((x) => [...x, { id, text, kind }])
    setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), kind === 'err' ? 6000 : 2600)
  }, [])
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="a-toasts" role="status">
        {items.map((t) => (
          <div key={t.id} className={'a-toast ' + t.kind}>
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}
export const useToast = () => useContext(ToastCtx)

// ───────── tasdiqlash oynasi ─────────
const ConfirmCtx = createContext(async () => false)
export function ConfirmHost({ children }) {
  const [q, setQ] = useState(null)
  const ask = useCallback((text, { ok = 'O‘chirish', danger = true } = {}) => new Promise((resolve) => setQ({ text, ok, danger, resolve })), [])
  const close = (v) => {
    q?.resolve(v)
    setQ(null)
  }
  return (
    <ConfirmCtx.Provider value={ask}>
      {children}
      {q && (
        <div className="a-modal-bg" onClick={() => close(false)}>
          <div className="a-modal a-confirm" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <p>{q.text}</p>
            <div className="a-row end">
              <button className="a-btn ghost" onClick={() => close(false)} autoFocus>
                Bekor qilish
              </button>
              <button className={'a-btn ' + (q.danger ? 'danger' : 'primary')} onClick={() => close(true)}>
                {q.ok}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmCtx.Provider>
  )
}
export const useConfirm = () => useContext(ConfirmCtx)

// ───────── maydonlar ─────────
export function Field({ label, hint, children, wide }) {
  return (
    <label className={'a-field' + (wide ? ' wide' : '')}>
      <span className="a-label">{label}</span>
      {children}
      {hint && <span className="a-hint">{hint}</span>}
    </label>
  )
}

export function Text({ value, onChange, area, rows = 3, ...rest }) {
  const C = area ? 'textarea' : 'input'
  return <C className="a-input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} rows={area ? rows : undefined} {...rest} />
}

export function Toggle({ value, onChange, label }) {
  return (
    <button type="button" className={'a-switch' + (value ? ' on' : '')} onClick={() => onChange(!value)} aria-pressed={!!value}>
      <i />
      <span>{label}</span>
    </button>
  )
}

export function ColorInput({ value, onChange }) {
  return (
    <div className="a-color">
      <input type="color" value={/^#[0-9a-f]{6}$/i.test(value || '') ? value : '#1c1b21'} onChange={(e) => onChange(e.target.value)} />
      <input className="a-input mono" value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="#1f3c66" />
    </div>
  )
}

// Teglar: Enter bilan qo'shiladi, × bilan o'chiriladi, sudrab tartiblanadi
export function Tags({ value = [], onChange, placeholder = 'Yozing va Enter bosing' }) {
  const [draft, setDraft] = useState('')
  const drag = useRef(null)
  const add = () => {
    const v = draft.trim()
    if (!v) return
    onChange([...value, v])
    setDraft('')
  }
  return (
    <div className="a-tags">
      {value.map((t, i) => (
        <span
          key={t + i}
          className="a-tag"
          draggable
          onDragStart={() => (drag.current = i)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            const from = drag.current
            if (from == null || from === i) return
            const next = [...value]
            const [m] = next.splice(from, 1)
            next.splice(i, 0, m)
            onChange(next)
          }}
        >
          {t}
          <button type="button" onClick={() => onChange(value.filter((_, k) => k !== i))} aria-label="O‘chirish">
            ×
          </button>
        </span>
      ))}
      <input
        className="a-tag-input"
        value={draft}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            add()
          }
          if (e.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1))
        }}
        onBlur={add}
      />
    </div>
  )
}

// Jadval qatorlari: [[a, b], ...]
export function Rows({ value = [], onChange, cols }) {
  const set = (i, k, v) => onChange(value.map((r, n) => (n === i ? r.map((c, m) => (m === k ? v : c)) : r)))
  return (
    <div className="a-rows">
      {value.map((r, i) => (
        <div className="a-rows-line" key={i}>
          {cols.map((c, k) => (
            <input key={k} className="a-input" placeholder={c} value={r[k] ?? ''} onChange={(e) => set(i, k, e.target.value)} />
          ))}
          <button type="button" className="a-icon" onClick={() => i > 0 && onChange(move(value, i, i - 1))} title="Yuqoriga">
            ↑
          </button>
          <button type="button" className="a-icon" onClick={() => onChange(value.filter((_, n) => n !== i))} title="O‘chirish">
            ×
          </button>
        </div>
      ))}
      <button type="button" className="a-btn ghost sm" onClick={() => onChange([...value, cols.map(() => '')])}>
        + Qator qo‘shish
      </button>
    </div>
  )
}

export const move = (arr, from, to) => {
  const next = [...arr]
  const [m] = next.splice(from, 1)
  next.splice(to, 0, m)
  return next
}

// ───────── media tanlash oynasi ─────────
export function MediaPicker({ open, onClose, onPick, multiple = false }) {
  const [items, setItems] = useState([])
  const [busy, setBusy] = useState(false)
  const [sel, setSel] = useState([])
  const [filter, setFilter] = useState('')
  const toast = useToast()
  const load = useCallback(() => api('/media').then(setItems).catch((e) => toast(e.message, 'err')), [toast])
  useEffect(() => {
    if (open) {
      setSel([])
      load()
    }
  }, [open, load])
  if (!open) return null
  const up = async (files) => {
    if (!files?.length) return
    setBusy(true)
    try {
      const res = await uploadFiles(files)
      await load()
      setSel(multiple ? res.map((r) => r.url) : [res[0].url])
      toast(`${res.length} ta rasm yuklandi`)
    } catch (e) {
      toast(e.message, 'err')
    }
    setBusy(false)
  }
  const shown = items.filter((m) => !filter || m.url.toLowerCase().includes(filter.toLowerCase()))
  const toggle = (url) => setSel((s) => (multiple ? (s.includes(url) ? s.filter((x) => x !== url) : [...s, url]) : [url]))
  return (
    <div className="a-modal-bg" onClick={onClose}>
      <div
        className="a-modal a-picker"
        onClick={(e) => e.stopPropagation()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          up(e.dataTransfer.files)
        }}
      >
        <div className="a-picker-head">
          <h3>Rasm tanlash</h3>
          <input className="a-input" placeholder="Qidirish…" value={filter} onChange={(e) => setFilter(e.target.value)} />
          <label className="a-btn primary">
            {busy ? 'Yuklanmoqda…' : '+ Yuklash'}
            <input type="file" accept="image/*" multiple hidden onChange={(e) => up(e.target.files)} />
          </label>
          <button className="a-icon" onClick={onClose} aria-label="Yopish">
            ×
          </button>
        </div>
        <p className="a-hint">Rasmlarni shu oynaga sudrab tashlashingiz ham mumkin.</p>
        <div className="a-media-grid">
          {shown.map((m) => (
            <button
              key={m.url}
              className={'a-media' + (sel.includes(m.url) ? ' on' : '')}
              onClick={() => toggle(m.url)}
              onDoubleClick={() => {
                onPick(multiple ? [m.url] : m.url)
                onClose()
              }}
              title={m.url}
            >
              <img src={m.url} alt="" loading="lazy" />
              <span>{m.name}</span>
            </button>
          ))}
        </div>
        <div className="a-row end">
          <span className="a-hint">{sel.length ? `${sel.length} ta tanlandi` : 'Rasmni bosing (ikki marta — darhol tanlash)'}</span>
          <button className="a-btn ghost" onClick={onClose}>
            Bekor qilish
          </button>
          <button
            className="a-btn primary"
            disabled={!sel.length}
            onClick={() => {
              onPick(multiple ? sel : sel[0])
              onClose()
            }}
          >
            Tanlash
          </button>
        </div>
      </div>
    </div>
  )
}

// Bitta rasm maydoni (ko'rinish + almashtirish + olib tashlash)
export function ImageField({ value, onChange, ratio = '1 / 1', label = 'Rasm tanlash' }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="a-image">
      <button type="button" className="a-image-box" style={{ aspectRatio: ratio }} onClick={() => setOpen(true)}>
        {value ? <img src={value} alt="" /> : <span>+ {label}</span>}
      </button>
      {value && (
        <div className="a-row">
          <button type="button" className="a-btn ghost sm" onClick={() => setOpen(true)}>
            Almashtirish
          </button>
          <button type="button" className="a-btn ghost sm" onClick={() => onChange('')}>
            Olib tashlash
          </button>
        </div>
      )}
      <MediaPicker open={open} onClose={() => setOpen(false)} onPick={onChange} />
    </div>
  )
}
