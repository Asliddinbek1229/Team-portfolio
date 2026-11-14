import { useCallback, useEffect, useRef, useState } from 'react'

// Premium slayder: qo'l bilan surish, klaviatura, to'liq ekran, progress chizig'i,
// har bir slayd faollashganda: sarlavha so'zma-so'z, rasm pardasimon, punktlar ketma-ket,
// raqamlar 0 dan sanab chiqadi.
//
// Slayd: { id, layout, kicker, title, text, points[], images[{src,caption,wide}], url,
//          benefit, items[[raqam, izoh, qo'shimcha]], left, right, rows[[ilgari, endi]] }
// layout: cover | feature | phones | points | stats | compare

const pad = (n) => String(n).padStart(2, '0')

// "15 937", "80.1%", "607 808" → sanab chiqadigan raqam
function CountUp({ value, active, delay = 0 }) {
  const m = /^(\D*?)([\d][\d\s.,]*)(.*)$/.exec(String(value ?? ''))
  const [shown, setShown] = useState(m ? null : value)
  useEffect(() => {
    if (!m) return
    const raw = m[2].replace(/\s/g, '')
    const decimals = (raw.split(/[.,]/)[1] || '').length
    const target = parseFloat(raw.replace(',', '.'))
    const fmt = (v) => {
      const s = v.toFixed(decimals)
      const [a, b] = s.split('.')
      const g = m[2].includes(' ') || target >= 10000 ? a.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : a
      return m[1] + g + (b ? (m[2].includes(',') ? ',' : '.') + b : '') + m[3]
    }
    if (!active) {
      setShown(fmt(0))
      return
    }
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return setShown(fmt(target))
    let raf
    let t0
    const dur = 1400
    const tick = (t) => {
      if (!t0) t0 = t + delay
      const k = Math.min(1, Math.max(0, (t - t0) / dur))
      const e = 1 - Math.pow(1 - k, 4)
      setShown(fmt(target * e))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, active]) // eslint-disable-line react-hooks/exhaustive-deps
  return <>{shown ?? value}</>
}

// Sarlavha: har bir so'z maskadan ko'tariladi
function Title({ text, big }) {
  if (!text) return null
  const words = String(text).split(/\s+/)
  return (
    <h3 className={'deck-title' + (big ? ' big' : '')} aria-label={text}>
      {words.map((w, i) => (
        <span key={i}>
          <span className="w" aria-hidden>
            <span style={{ '--d': `${0.12 + i * 0.045}s` }}>{w}</span>
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </h3>
  )
}

function Shot({ img, url }) {
  const [ar, setAr] = useState(1.6)
  return (
    <figure className="deck-shot" style={{ '--ar': ar }}>
      <div className="deck-shot-bar">
        <i />
        <i />
        <i />
        {url && <b>{url}</b>}
      </div>
      <div className="deck-shot-img">
        <img
          src={img.src}
          alt={img.caption || ''}
          draggable={false}
          onLoad={(e) => {
            const { naturalWidth: w, naturalHeight: h } = e.currentTarget
            if (w && h) setAr(w / h)
          }}
        />
      </div>
    </figure>
  )
}

function Phone({ img, i }) {
  return (
    <figure className="deck-phone" style={{ '--i': i }}>
      <div className="deck-phone-frame">
        <img src={img.src} alt={img.caption || ''} draggable={false} />
      </div>
      {img.caption && <figcaption>{img.caption}</figcaption>}
    </figure>
  )
}

function Kicker({ s, n }) {
  if (!s.kicker) return null
  return (
    <p className="deck-kicker mono a-up" style={{ '--d': '0.05s' }}>
      <b>{pad(n)}</b>
      {s.kicker}
    </p>
  )
}

function Points({ points, from = 0.35 }) {
  if (!points?.length) return null
  return (
    <ul className="deck-points">
      {points.map((p, i) => (
        <li key={i} className="a-up" style={{ '--d': `${from + i * 0.08}s` }}>
          <i>✓</i>
          {p}
        </li>
      ))}
    </ul>
  )
}

function Benefit({ text, delay = 0.6 }) {
  if (!text) return null
  return (
    <div className="deck-benefit a-up" style={{ '--d': `${delay}s` }}>
      <span className="mono">Afzalligi</span>
      <p>{text}</p>
    </div>
  )
}

function Text({ s, n, big }) {
  return (
    <div className="deck-text">
      <Kicker s={s} n={n} />
      <Title text={s.title} big={big} />
      {s.text && (
        <p className="deck-p a-up" style={{ '--d': '0.28s' }}>
          {s.text}
        </p>
      )}
      <Points points={s.points} />
      <Benefit text={s.benefit} delay={0.4 + (s.points?.length || 0) * 0.08} />
    </div>
  )
}

function Slide({ s, n, active }) {
  const imgs = (s.images || []).filter((x) => x && x.src)
  switch (s.layout) {
    case 'cover':
      return (
        <div className="deck-slide-in l-cover">
          <Text s={s} n={n} big />
          {imgs[0] && (
            <div className="deck-media reveal-media">
              <Shot img={imgs[0]} url={s.url} />
            </div>
          )}
        </div>
      )
    case 'phones':
      return (
        <div className="deck-slide-in l-phones">
          <Text s={s} n={n} />
          <div className="deck-media phones reveal-media">
            {imgs.map((im, i) => (im.wide ? <Shot key={i} img={im} url={s.url} /> : <Phone key={i} img={im} i={i} />))}
          </div>
        </div>
      )
    case 'points':
      return (
        <div className="deck-slide-in l-points">
          <div className="deck-text">
            <Kicker s={s} n={n} />
            <Title text={s.title} big />
            {s.text && (
              <p className="deck-p a-up" style={{ '--d': '0.28s' }}>
                {s.text}
              </p>
            )}
          </div>
          <ol className="deck-big-points">
            {(s.points || []).map((p, i) => (
              <li key={i} className="a-up" style={{ '--d': `${0.3 + i * 0.1}s` }}>
                <span className="mono">{pad(i + 1)}</span>
                {p}
              </li>
            ))}
          </ol>
        </div>
      )
    case 'stats': {
      const items = s.items || []
      return (
        <div className={'deck-slide-in l-stats n' + Math.min(4, items.length)}>
          <div className="deck-text head">
            <Kicker s={s} n={n} />
            <Title text={s.title} big />
            {s.text && (
              <p className="deck-p a-up" style={{ '--d': '0.28s' }}>
                {s.text}
              </p>
            )}
          </div>
          <div className="deck-stats">
            {items.map(([num, label, sub], i) => (
              <div key={i} className="deck-stat a-up" style={{ '--d': `${0.3 + i * 0.1}s` }}>
                <b>
                  <CountUp value={num} active={active} delay={300 + i * 100} />
                </b>
                <span>{label}</span>
                {sub && <small className="mono">{sub}</small>}
              </div>
            ))}
          </div>
        </div>
      )
    }
    case 'compare':
      return (
        <div className="deck-slide-in l-compare">
          <div className="deck-text head">
            <Kicker s={s} n={n} />
            <Title text={s.title} big />
          </div>
          <div className="deck-compare">
            <div className="dc-head mono a-up" style={{ '--d': '0.25s' }}>
              <span className="was">{s.left || 'Ilgari'}</span>
              <i />
              <span className="now">{s.right || 'Endi'}</span>
            </div>
            {(s.rows || []).map(([a, b], i) => (
              <div key={i} className="dc-row a-up" style={{ '--d': `${0.35 + i * 0.12}s` }}>
                <p className="was">
                  <em>×</em>
                  {a}
                </p>
                <i>→</i>
                <p className="now">
                  <em>✓</em>
                  {b}
                </p>
              </div>
            ))}
          </div>
        </div>
      )
    default:
      return (
        <div className="deck-slide-in l-feature">
          <div className="deck-media reveal-media">{imgs[0] && <Shot img={imgs[0]} url={s.url} />}</div>
          <Text s={s} n={n} />
        </div>
      )
  }
}

export default function SlideDeck({ title, slides = [], color = '#1f3c66' }) {
  const rootRef = useRef(null)
  const viewRef = useRef(null)
  const [i, setI] = useState(0)
  const [dx, setDx] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [full, setFull] = useState(false)
  const [seen, setSeen] = useState(false) // slayder ekranga kirgandagina animatsiya boshlanadi
  const drag = useRef(null)
  const wheelLock = useRef(0)
  const n = slides.length

  const go = useCallback(
    (k) => {
      setSeen(true)
      setI(() => Math.max(0, Math.min(n - 1, k)))
    },
    [n],
  )
  const next = () => go(i + 1)
  const prev = () => go(i - 1)

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { threshold: 0.12 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // ---- to'liq ekran ----
  const nativeFull = () => document.fullscreenElement === rootRef.current
  const enterFull = async () => {
    const el = rootRef.current
    try {
      if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: 'hide' })
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen()
      else throw new Error('no api')
    } catch {
      setFull(true)
      document.body.classList.add('deck-lock')
    }
    el.focus({ preventScroll: true })
  }
  const exitFull = async () => {
    if (nativeFull()) await document.exitFullscreen().catch(() => {})
    else if (document.webkitFullscreenElement) document.webkitExitFullscreen?.()
    setFull(false)
    document.body.classList.remove('deck-lock')
  }
  useEffect(() => {
    const onChange = () => setFull(nativeFull() || document.webkitFullscreenElement === rootRef.current)
    document.addEventListener('fullscreenchange', onChange)
    document.addEventListener('webkitfullscreenchange', onChange)
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      document.removeEventListener('webkitfullscreenchange', onChange)
      document.body.classList.remove('deck-lock')
    }
  }, [])

  const onKey = (e) => {
    if (['ArrowRight', 'PageDown', ' '].includes(e.key)) (e.preventDefault(), next())
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') (e.preventDefault(), prev())
    else if (e.key === 'Home') (e.preventDefault(), go(0))
    else if (e.key === 'End') (e.preventDefault(), go(n - 1))
    else if (e.key === 'Escape' && full) exitFull()
    else if (e.key.toLowerCase() === 'f') full ? exitFull() : enterFull()
  }

  // ---- surish ----
  const onDown = (e) => {
    if (e.button !== 0 || e.target.closest('button,a')) return
    drag.current = { x: e.clientX, y: e.clientY, t: performance.now(), axis: null, id: e.pointerId }
  }
  const onMove = (e) => {
    const d = drag.current
    if (!d) return
    const mx = e.clientX - d.x
    const my = e.clientY - d.y
    if (!d.axis) {
      if (Math.abs(mx) < 6 && Math.abs(my) < 6) return
      d.axis = Math.abs(mx) > Math.abs(my) ? 'x' : 'y'
      if (d.axis === 'x') {
        setDragging(true)
        try {
          viewRef.current.setPointerCapture(d.id)
        } catch {}
      }
    }
    if (d.axis !== 'x') return
    const edge = (i === 0 && mx > 0) || (i === n - 1 && mx < 0)
    setDx(edge ? mx * 0.3 : mx)
  }
  const onUp = (e) => {
    const d = drag.current
    drag.current = null
    if (!d || d.axis !== 'x') return
    const mx = e.clientX - d.x
    const v = mx / Math.max(1, performance.now() - d.t)
    const w = viewRef.current.clientWidth
    if (mx < -w * 0.18 || v < -0.45) next()
    else if (mx > w * 0.18 || v > 0.45) prev()
    setDx(0)
    setDragging(false)
  }

  useEffect(() => {
    const el = viewRef.current
    if (!el) return
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 25) return
      e.preventDefault()
      const now = performance.now()
      if (now < wheelLock.current) return
      wheelLock.current = now + 650
      setSeen(true)
      setI((k) => Math.max(0, Math.min(n - 1, k + (e.deltaX > 0 ? 1 : -1))))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [n])

  // ---- telefonda balandlik joriy slaydga moslashadi ----
  const [autoH, setAutoH] = useState(null)
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const el = view.querySelectorAll('.deck-slide-in')[i]
    if (!el) return
    const measure = () => setAutoH(window.innerWidth < 900 && !full ? Math.ceil(el.getBoundingClientRect().height) : null)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [i, full, n])

  if (!n) return null
  return (
    <section
      ref={rootRef}
      className={'deck' + (full ? ' is-full' : '')}
      tabIndex={0}
      onKeyDown={onKey}
      aria-roledescription="slayder"
      aria-label={title || 'Loyiha slaydlari'}
      style={{ '--c': color }}
    >
      <header className="deck-head">
        <div className="deck-head-l">{title && <h2 className="blk-h2">{title}</h2>}</div>
        <div className="deck-head-r mono">
          <span className="deck-count">
            <span key={i} className="deck-count-n">
              {pad(i + 1)}
            </span>{' '}
            <em>/ {pad(n)}</em>
          </span>
          <button type="button" className="deck-btn" onClick={full ? exitFull : enterFull} aria-label={full ? 'Kichraytirish' : 'To‘liq ekran'}>
            <span className="br">[</span>
            {full ? 'Kichraytirish ⤡' : 'To‘liq ekran ⤢'}
            <span className="br">]</span>
          </button>
        </div>
      </header>

      <div
        ref={viewRef}
        className={'deck-view' + (dragging ? ' dragging' : '')}
        style={autoH ? { height: autoH } : undefined}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onDoubleClick={(e) => !e.target.closest('button,a') && (full ? exitFull() : enterFull())}
      >
        <div className="deck-progress" aria-hidden>
          <i style={{ transform: `scaleX(${(i + 1) / n})` }} />
        </div>
        <div className="deck-track" style={{ transform: `translate3d(calc(${-i * 100}% + ${dx}px),0,0)` }}>
          {slides.map((s, k) => (
            <div
              key={s.id || k}
              className={'deck-slide' + (k === i && seen ? ' on' : '')}
              aria-hidden={k !== i}
              role="group"
              aria-label={`${k + 1} / ${n}`}
            >
              <span className="deck-watermark" aria-hidden>
                {pad(k + 1)}
              </span>
              <Slide s={s} n={k + 1} active={k === i && seen} />
            </div>
          ))}
        </div>
      </div>

      <footer className="deck-foot">
        <button type="button" className="deck-arrow" onClick={prev} disabled={i === 0} aria-label="Oldingi slayd">
          ←
        </button>
        <div className="deck-dots" role="tablist">
          {slides.map((s, k) => (
            <button
              key={s.id || k}
              type="button"
              role="tab"
              aria-selected={k === i}
              aria-label={`${k + 1}-slayd${s.title ? ': ' + s.title : ''}`}
              title={s.title}
              className={k === i ? 'on' : ''}
              onClick={() => go(k)}
            >
              <i />
            </button>
          ))}
        </div>
        <button type="button" className="deck-arrow" onClick={next} disabled={i === n - 1} aria-label="Keyingi slayd">
          →
        </button>
      </footer>
      <p className="deck-hint mono">Suring · ← → yoki probel · F — to‘liq ekran</p>
    </section>
  )
}
