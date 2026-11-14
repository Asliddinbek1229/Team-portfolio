import { useCallback, useEffect, useRef, useState } from 'react'

const DELAY = 3000 // har bir kartadan keyingisiga o'tish oralig'i (ms)
const COPIES = 4 // cheksiz aylanish uchun ro'yxat nusxalari

// Jamoa kartalari: rangli suratlar, o'zi avtomatik suriladi, oxiriga yetganda boshidan uzluksiz davom etadi.
// Sichqoncha ustida turganda yoki qo'l bilan surilayotganda to'xtaydi; ←/→ tugmalar va swipe bilan ham boshqariladi.
export default function TeamCarousel({ team }) {
  const n = team.length
  const loop = n > 1
  const items = loop ? Array.from({ length: COPIES }, () => team).flat() : team
  const [i, setI] = useState(loop ? n : 0)
  const [anim, setAnim] = useState(true)
  const [step, setStep] = useState(0)
  const [paused, setPaused] = useState(false)
  const trackRef = useRef(null)
  const drag = useRef(null)
  const reduce = useRef(false)

  // karta kengligi + oraliq — ekran o'lchami o'zgarsa qayta o'lchanadi
  useEffect(() => {
    reduce.current = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const el = trackRef.current
    if (!el) return
    const measure = () => {
      const a = el.children[0]
      const b = el.children[1]
      if (a) setStep(b ? b.offsetLeft - a.offsetLeft : a.offsetWidth)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [n])

  const go = useCallback((d) => {
    setAnim(true)
    setI((v) => v + d)
  }, [])

  // avtomatik o'tish
  useEffect(() => {
    if (!loop || paused || reduce.current) return
    const t = setInterval(() => !document.hidden && go(1), DELAY)
    return () => clearInterval(t)
  }, [loop, paused, go, i])

  // o'rtadagi nusxadan chiqib ketsa — animatsiyasiz o'sha joyning teng nusxasiga sakraydi (ko'zga sezilmaydi)
  const settle = () => {
    if (!loop) return
    if (i >= 2 * n || i < n) {
      setAnim(false)
      setI((v) => ((((v - n) % n) + n) % n) + n)
    }
  }
  useEffect(() => {
    if (anim) return
    let r2 = 0
    const r1 = requestAnimationFrame(() => (r2 = requestAnimationFrame(() => setAnim(true))))
    return () => {
      cancelAnimationFrame(r1)
      cancelAnimationFrame(r2)
    }
  }, [anim])

  const down = (e) => {
    if (!loop) return
    drag.current = { x: e.clientX, dx: 0 }
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {}
  }
  const move = (e) => {
    if (!drag.current) return
    drag.current.dx = e.clientX - drag.current.x
    if (trackRef.current) {
      trackRef.current.style.transition = 'none'
      trackRef.current.style.transform = `translate3d(${-i * step + drag.current.dx}px,0,0)`
    }
  }
  const up = () => {
    const d = drag.current
    drag.current = null
    if (!d) return
    if (trackRef.current) {
      trackRef.current.style.transition = ''
      trackRef.current.style.transform = ''
    }
    if (Math.abs(d.dx) > 40) go(d.dx < 0 ? Math.max(1, Math.round(-d.dx / step)) : -Math.max(1, Math.round(d.dx / step)))
  }

  const cur = loop ? (((i - n) % n) + n) % n : 0

  return (
    <div
      className="tc"
      onPointerEnter={(e) => e.pointerType === 'mouse' && setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="tc-view" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        <div
          ref={trackRef}
          className={'tc-track' + (anim ? '' : ' no-anim')}
          style={{ transform: `translate3d(${-i * step}px,0,0)` }}
          onTransitionEnd={(e) => e.target === trackRef.current && settle()}
        >
          {items.map((m, k) => (
            <div className={'member' + (loop && k === i ? ' on' : '')} key={k} aria-hidden={loop && (k < n || k >= 2 * n) ? true : undefined}>
              {m.photo && <img src={m.photo} alt={m.name} draggable={false} />}
              <div className="member-txt">
                <h4>{m.name}</h4>
                <span className="mono">{m.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {loop && (
        <div className="tc-ctrl">
          <button type="button" className="tc-btn" aria-label="Oldingi" onClick={() => go(-1)}>
            ←
          </button>
          <div className="tc-dots">
            {team.map((m, k) => (
              <button
                type="button"
                key={m.id || k}
                className={'tc-dot' + (k === cur ? ' on' : '')}
                aria-label={m.name}
                onClick={() => go(k - cur)}
              >
                {k === cur && !paused && <i key={i} style={{ animationDuration: DELAY + 'ms' }} />}
              </button>
            ))}
          </div>
          <span className="tc-count mono">
            {String(cur + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
          </span>
          <button type="button" className="tc-btn" aria-label="Keyingi" onClick={() => go(1)}>
            →
          </button>
        </div>
      )}
    </div>
  )
}
