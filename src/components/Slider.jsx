import { useEffect, useRef, useState } from 'react'
import { bus, EASE } from './bus'

// Pastki markazdagi ingichka slayder: lenta pozitsiyasini ko'rsatadi, tortib boshqariladi.
// `targetRef` berilsa — o'sha elementni gorizontal aylantiradi (jamoa qatori uchun).
export default function Slider({ targetRef, className = '' }) {
  const lineRef = useRef(null)
  const tickRef = useRef(null)
  const prog = useRef(0)
  const dragging = useRef(false)
  const [mode, setMode] = useState('rest')
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let raf = 0
    let dead = false
    let wasHidden = false
    const loop = () => {
      const line = lineRef.current
      const tick = tickRef.current
      if (line && tick) {
        let p = 0
        if (targetRef) {
          const el = targetRef.current
          const max = el ? el.scrollWidth - el.clientWidth : 0
          if (max <= 1 !== wasHidden) {
            wasHidden = max <= 1
            setHidden(wasHidden)
          }
          p = el && max > 1 ? el.scrollLeft / max : 0
        } else {
          const total = bus.stride * bus.n
          p = total > 0 ? (((bus.pos % total) + total) % total) / total : 0
        }
        prog.current = p
        tick.style.transform = `translateX(${(p * Math.max(1, line.clientWidth - 1)).toFixed(1)}px)`
      }
      if (!dead) raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      dead = true
      cancelAnimationFrame(raf)
      document.documentElement.style.cursor = ''
    }
  }, [targetRef])

  const seek = (p) => {
    const v = Math.max(0, Math.min(0.9999, p))
    if (targetRef) {
      const el = targetRef.current
      if (el) el.scrollLeft = v * (el.scrollWidth - el.clientWidth)
    } else bus.seek && bus.seek(v)
  }
  const at = (x) => {
    const r = lineRef.current.getBoundingClientRect()
    seek((x - r.left) / r.width)
  }
  const down = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dragging.current = true
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {}
    setMode('drag')
    document.documentElement.style.cursor = 'grabbing'
    at(e.clientX)
  }
  const move = (e) => dragging.current && at(e.clientX)
  const up = (e) => {
    if (!dragging.current) return
    dragging.current = false
    document.documentElement.style.cursor = ''
    if (!targetRef && bus.seek) bus.seek(null)
    setMode(e.type === 'pointerup' && e.pointerType !== 'touch' ? 'over' : 'rest')
  }
  const key = (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    e.stopPropagation()
    seek(prog.current + (e.key === 'ArrowRight' ? 0.05 : -0.05))
    if (!targetRef && bus.seek) bus.seek(null)
  }

  const w = mode === 'drag' ? 3 : mode === 'over' ? 2 : 1
  const h = mode === 'drag' ? 27 : mode === 'over' ? 17 : 9
  return (
    <div
      ref={lineRef}
      className={'slider ' + className}
      role="slider"
      tabIndex={0}
      aria-label="Loyihalarni aylantirish"
      aria-valuemin={0}
      aria-valuemax={100}
      onKeyDown={key}
      style={{ visibility: hidden ? 'hidden' : 'visible' }}
    >
      <b className="slider-line" style={{ background: mode === 'rest' ? 'rgba(var(--tint),.14)' : 'rgba(var(--tint),.42)' }} />
      <i ref={tickRef} className="slider-tick">
        <b
          style={{
            left: -w / 2 + 0.5,
            top: -h / 2 + 0.5,
            width: w,
            height: h,
            transition: `width .22s ${EASE},height .22s ${EASE},left .22s ${EASE},top .22s ${EASE}`,
          }}
        />
      </i>
      <span
        className="slider-hit"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onPointerEnter={() => !dragging.current && setMode('over')}
        onPointerLeave={() => !dragging.current && setMode('rest')}
        style={{ cursor: mode === 'drag' ? 'grabbing' : 'grab' }}
      />
    </div>
  )
}
