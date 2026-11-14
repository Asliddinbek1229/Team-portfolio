import { useEffect, useRef } from 'react'
import { bus, stripGeo, reducedMotion } from './bus'

// Shisha kub ichida aylanuvchi tanga-belgi (14 qatlam SVG). Lenta harakati,
// sichqoncha va hover'ga javob beradi; yuzalar yorug'likka qarab yoritiladi.

const MARK = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><mask id="ncut"><rect width="100" height="100" fill="#fff"/><text x="50" y="69" text-anchor="middle" font-family="Geist, Helvetica Neue, Arial, sans-serif" font-weight="700" font-size="58" fill="#000">N</text></mask></defs><circle cx="50" cy="50" r="48" fill="currentColor" mask="url(#ncut)"/></svg>`

const NORMALS = [[0, 0, 1], [0, 0, -1], [1, 0, 0], [-1, 0, 0], [0, -1, 0], [0, 1, 0]]
const CFG = { base: [45, -135, 90], idle: 0.5, pointer: 4, lerp: 0.08, scrollX: 0.6, scrollY: -0.6 }
const rx = (a) => [1, 0, 0, 0, Math.cos(a), -Math.sin(a), 0, Math.sin(a), Math.cos(a)]
const ry = (a) => [Math.cos(a), 0, Math.sin(a), 0, 1, 0, -Math.sin(a), 0, Math.cos(a)]
const rz = (a) => [Math.cos(a), -Math.sin(a), 0, Math.sin(a), Math.cos(a), 0, 0, 0, 1]
const mul = (a, b) => {
  const o = []
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) o.push(a[r * 3] * b[c] + a[r * 3 + 1] * b[3 + c] + a[r * 3 + 2] * b[6 + c])
  return o
}
const DEG = Math.PI / 180
const TAU = Math.PI * 2
const BASE_M = mul(mul(rx(CFG.base[0] * DEG), ry(CFG.base[1] * DEG)), rz(CFG.base[2] * DEG))
const BASE_T = `rotateX(${CFG.base[0]}deg) rotateY(${CFG.base[1]}deg) rotateZ(${CFG.base[2]}deg)`
const FACES = [
  'translateZ(var(--ch))',
  'rotateY(180deg) translateZ(var(--ch))',
  'rotateY(90deg) translateZ(var(--ch))',
  'rotateY(-90deg) translateZ(var(--ch))',
  'rotateX(90deg) translateZ(var(--ch))',
  'rotateX(-90deg) translateZ(var(--ch))',
]
const LAYERS = 14

export default function Cube({ size = 112, appearDelay = 1.35 }) {
  const wrapRef = useRef(null)
  const boxRef = useRef(null)
  const rotRef = useRef(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const box = boxRef.current
    const rot = rotRef.current
    const still = reducedMotion()
    const faces = [...rot.querySelectorAll('[data-face]')]
    let spin = 0, tx = 0, ty = 0, kick = 0, kickV = 0, hov = false, scale = 1, ptr = null, raf = 0, dead = false
    let last = performance.now()
    const enter = () => (hov = true)
    const leave = () => (hov = false)
    const click = () => (kickV += 14)
    const move = (e) => (ptr = { x: e.clientX, y: e.clientY })
    const out = () => (ptr = null)
    box.addEventListener('mouseenter', enter)
    box.addEventListener('mouseleave', leave)
    box.addEventListener('click', click)
    window.addEventListener('pointermove', move)
    document.documentElement.addEventListener('mouseleave', out)

    const place = () => {
      const W = wrap.clientWidth
      const H = wrap.clientHeight
      const g = bus.geo && !bus.geo.vert ? bus.geo : { ...stripGeo(W, H), H }
      const below = g.CY + g.S / 2
      const room = g.H - below - 46
      box.style.top = Math.round(below + room / 2 - size / 2) + 'px'
    }
    const tick = (now) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000))
      last = now
      const f = dt * 60
      place()
      if (!still) {
        spin = (spin + (hov ? CFG.idle * dt * 1.2 : 0)) % TAU
        kick += kickV * dt
        kickV *= 0.92 ** f
      }
      const idle = still ? 0 : (CFG.idle * now) / 1000
      const bx = 0.3 + idle + spin
      const by = 0.7 + idle + spin
      const bz = 0.2 + idle
      let px = 0, py = 0
      if (ptr && !still) {
        py = (ptr.x / window.innerWidth * 2 - 1) * CFG.pointer
        px = (ptr.y / window.innerHeight * 2 - 1) * CFG.pointer
      }
      const k = 1 - (1 - CFG.lerp) ** f
      tx += (px - tx) * k
      ty += (py - ty) * k
      const sc = still ? 0 : bus.pos / (bus.stride || 1)
      const X = bx + tx + CFG.scrollX * sc
      const Y = by + ty + CFG.scrollY * sc + kick
      const Z = bz
      scale += ((hov && !still ? 1.1 : 1) - scale) * (1 - 0.86 ** f)
      rot.style.transform = `scale(${scale.toFixed(3)}) ${BASE_T} rotateX(${X.toFixed(4)}rad) rotateY(${Y.toFixed(4)}rad) rotateZ(${Z.toFixed(4)}rad)`
      const M = mul(mul(mul(BASE_M, rx(X)), ry(Y)), rz(Z))
      NORMALS.forEach((n, i) => {
        const a = M[0] * n[0] + M[1] * n[1] + M[2] * n[2]
        const b = M[3] * n[0] + M[4] * n[1] + M[5] * n[2]
        const c = M[6] * n[0] + M[7] * n[1] + M[8] * n[2]
        faces[i]?.style.setProperty('--l', Math.max(0, -0.45 * a - 0.6 * b + 0.66 * c).toFixed(3))
      })
      if (!dead) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      dead = true
      cancelAnimationFrame(raf)
      box.removeEventListener('mouseenter', enter)
      box.removeEventListener('mouseleave', leave)
      box.removeEventListener('click', click)
      window.removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('mouseleave', out)
    }
  }, [size])

  const depth = (size * 18) / 112
  return (
    <div ref={wrapRef} className="cube-layer">
      <div
        ref={boxRef}
        className="cube-box"
        role="img"
        aria-label="NamDU belgisi"
        style={{
          width: size,
          height: size,
          marginLeft: -size / 2,
          '--ch': size / 2 + 'px',
          animation: `fadeUp .9s cubic-bezier(.22,.31,0,1) ${appearDelay}s both`,
        }}
      >
        <div ref={rotRef} className="cube-rot" style={{ transform: `${BASE_T} rotateX(.3rad) rotateY(.7rad) rotateZ(.2rad)` }}>
          <div
            className="cube-mark"
            style={{ width: size * 0.571, height: size * 0.571, margin: `${size * -0.2855}px 0 0 ${size * -0.2855}px` }}
          >
            {Array.from({ length: LAYERS }).map((_, i) => {
              const n = i / 13
              return (
                <div
                  key={i}
                  className="cube-layer-svg"
                  style={{ transform: `translateZ(${((n - 0.5) * depth).toFixed(2)}px)`, '--n': n.toFixed(3) }}
                  dangerouslySetInnerHTML={{ __html: MARK }}
                />
              )
            })}
          </div>
          {FACES.map((t, i) => (
            <i
              key={i}
              data-face=""
              className="cube-face"
              style={{ transform: t, boxShadow: `inset 0 0 ${Math.round((22 * size) / 112)}px rgba(var(--tint),.06)` }}
            />
          ))}
        </div>
        <div className="cube-floor" />
      </div>
    </div>
  )
}
