import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useContent } from '../data/content'
import { decode, reducedMotion } from './bus'
import { setTheme, useTheme } from '../theme'

// [ MATN ▮ ] — hover'da qavslar 7px ochiladi, matn "decode" bo'ladi, kursor to'xtaydi
export function Bracket({ children, to, href, className = '', solid = false, open = false, caret = true, onClick, type }) {
  const [hov, setHov] = useState(false)
  const txt = useRef(null)
  const label = String(children)
  const enter = () => {
    setHov(true)
    if (!reducedMotion()) decode(txt.current, label)
  }
  const leave = () => {
    setHov(false)
    if (txt.current) {
      clearInterval(txt.current._dec)
      txt.current.textContent = label
    }
  }
  const spread = hov || open ? 7 : 0
  const inner = (
    <>
      <span className="br" style={{ transform: `translateX(${-spread}px)` }}>
        [
      </span>
      <span ref={txt}>{label}</span>
      {caret && <span className={'caret' + (hov ? ' on' : '')} />}
      <span className="br" style={{ transform: `translateX(${spread}px)` }}>
        ]
      </span>
    </>
  )
  const props = {
    className: 'bracket' + (solid ? ' solid' : '') + (hov || open ? ' hot' : '') + ' ' + className,
    onMouseEnter: enter,
    onMouseLeave: leave,
    onFocus: enter,
    onBlur: leave,
    'aria-label': label,
  }
  if (to)
    return (
      <Link to={to} {...props}>
        {inner}
      </Link>
    )
  if (href)
    return (
      <a href={href} {...props}>
        {inner}
      </a>
    )
  return (
    <button type={type || 'button'} onClick={onClick} {...props}>
      {inner}
    </button>
  )
}

// Hover'da matni shifrlanib-ochiladigan havola (navigatsiya)
export function ScrambleLink({ to, children, sup, end }) {
  const ref = useRef(null)
  const text = String(children)
  return (
    <NavLink
      to={to}
      end={end}
      className="nav-link"
      onMouseEnter={() => !reducedMotion() && decode(ref.current, text)}
      onMouseLeave={() => {
        if (!ref.current) return
        clearInterval(ref.current._dec)
        ref.current.textContent = text
      }}
    >
      <span ref={ref}>{text}</span>
      {sup && <sup>{sup}</sup>}
    </NavLink>
  )
}

export function Header() {
  const { projects = [], settings = {} } = useContent()
  return (
    <header className="hdr">
      <Link to="/" className="logo" aria-label="Bosh sahifa">
        {settings.logo || 'NamDU'}
      </Link>
      <div className="hdr-social mono">
        <a href={settings.telegram || '#'} target="_blank" rel="noreferrer">
          Telegram
        </a>
        <span>/</span>
        <a href={settings.instagram || '#'} target="_blank" rel="noreferrer">
          Instagram
        </a>
        <span>/</span>
        <a href={settings.youtube || '#'} target="_blank" rel="noreferrer">
          YouTube
        </a>
      </div>
      <nav className="hdr-nav mono">
        <ScrambleLink to="/work" sup={String(projects.length).padStart(2, '0')}>
          Loyihalar
        </ScrambleLink>
        <ScrambleLink to="/insights">Maqolalar</ScrambleLink>
        <ScrambleLink to="/studio">IT Park</ScrambleLink>
        <ScrambleLink to="/contact">Aloqa</ScrambleLink>
        <ThemeToggle />
        <Bracket to="/contact" className="hdr-cta">
          Loyiha boshlash
        </Bracket>
      </nav>
    </header>
  )
}

// Quyosh / oy: bosilganda mavzu almashadi; tanlov eslab qolinadi
export function ThemeToggle() {
  const t = useTheme()
  const light = t === 'light'
  const label = light ? 'Qorong‘i mavzuga o‘tish' : 'Yorug‘ mavzuga o‘tish'
  return (
    <button
      type="button"
      className={'theme-tg' + (light ? ' is-light' : '')}
      onClick={() => setTheme(light ? 'dark' : 'light')}
      aria-label={label}
      title={label}
    >
      <svg viewBox="0 0 24 24" aria-hidden>
        {/* qorong'i mavzuda — quyosh (bosilsa yorug'ga o'tadi) */}
        <g className="tg-sun">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2.75v1.9M12 19.35v1.9M2.75 12h1.9M19.35 12h1.9M5.46 5.46l1.34 1.34M17.2 17.2l1.34 1.34M5.46 18.54l1.34-1.34M17.2 6.8l1.34-1.34" />
        </g>
        {/* yorug' mavzuda — oy */}
        <path className="tg-moon" d="M20.2 14.6A8.3 8.3 0 0 1 9.4 3.8a8.3 8.3 0 1 0 10.8 10.8Z" />
      </svg>
    </button>
  )
}

// Sahifa foni: template'dagi radial gradientlar + shovqin
export function Backdrop() {
  return (
    <div className="backdrop" aria-hidden>
      <div className="backdrop-noise" />
    </div>
  )
}

// Sahifa ochilganda ekranni qoplagan kataklar tasodifiy tartibda yo'qoladi
export function PageIntro() {
  const { pathname } = useLocation()
  const [grid, setGrid] = useState(null)
  const [step, setStep] = useState(0)
  useEffect(() => {
    if (reducedMotion()) return
    const W = window.innerWidth
    const H = window.innerHeight
    const cols = W < 810 ? 8 : 16
    const size = W / cols
    const rows = Math.ceil(H / size)
    setGrid({ cols, size, cells: Array.from({ length: cols * rows }, () => (Math.random() * 6) | 0) })
    setStep(0)
    const t = [0, 1, 2, 3, 4, 5].map((i) => setTimeout(() => setStep(i + 1), 200 + i * 85))
    t.push(setTimeout(() => setGrid(null), 1200))
    return () => t.forEach(clearTimeout)
  }, [pathname])
  if (!grid) return null
  return (
    <div
      className="page-intro"
      aria-hidden
      style={{ gridTemplateColumns: `repeat(${grid.cols},1fr)`, gridAutoRows: grid.size + 'px' }}
    >
      {grid.cells.map((c, i) => (
        <i key={i} style={{ visibility: c < step ? 'hidden' : 'visible' }} />
      ))}
    </div>
  )
}

function useClock() {
  const [t, setT] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Tashkent', hour: 'numeric', minute: '2-digit' }).formatToParts(t)
  const get = (k) => parts.find((p) => p.type === k)?.value || ''
  return { h: get('hour'), m: get('minute'), p: get('dayPeriod'), off: (t.getTime() / 1000) % 2 >= 1 }
}

export function Footer() {
  const c = useClock()
  const { settings: s = {} } = useContent()
  const tel = (s.phone || '').replace(/[^0-9+]/g, '')
  return (
    <footer className="ftr">
      <div className="ftr-main">
        <div>
          <h2 className="ftr-h">{s.footerTitle || 'Fikringiz bormi?'}</h2>
          <div className="ftr-btn">
            <Bracket to="/contact" solid caret={false}>
              Loyiha boshlash
            </Bracket>
          </div>
        </div>
        <div className="ftr-cols mono">
          <div>
            <h6>Aloqa</h6>
            {(s.emails || []).map((e) => (
              <a key={e} href={'mailto:' + e}>
                {e}
              </a>
            ))}
            {s.phone && <a href={'tel:' + tel}>{s.phone}</a>}
          </div>
          <div>
            <h6>Manzil</h6>
            <span>{s.address}</span>
          </div>
          <div>
            <h6>Ijtimoiy</h6>
            <a href={s.telegram || '#'}>Telegram</a>
            <a href={s.instagram || '#'}>Instagram</a>
            <a href={s.youtube || '#'}>YouTube</a>
          </div>
          <div>
            <h6>Huquqiy</h6>
            <a href="#">Maxfiylik</a>
            <a href="#">Shartlar</a>
          </div>
        </div>
      </div>
      <div className="ftr-bottom mono">
        <span>Namangan</span>
        <span>
          Mahalliy vaqt {c.h}
          <span style={{ opacity: c.off ? 0.2 : 1 }}>:</span>
          {c.m} {c.p} UZT
        </span>
        <span className="ftr-copy">© {new Date().getFullYear()} NamDU IT Park</span>
      </div>
    </footer>
  )
}

export function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}
