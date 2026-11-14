import { useEffect, useRef } from 'react'
import { reducedMotion } from './bus'

const cache = new Map()
const load = (src) => {
  let img = cache.get(src)
  if (!img) {
    img = new Image()
    img.src = src
    cache.set(src, img)
  }
  return img
}

// Rasm almashganda pikselli (katta kataklardan aniqqa) o'tish bilan chiziladi.
export default function PixelImage({ src, steps = [18, 10, 5, 0], className = '', preload = [] }) {
  const ref = useRef(null)
  useEffect(() => preload.forEach(load), [preload])

  useEffect(() => {
    const cv = ref.current
    if (!cv || !src) return
    const ctx = cv.getContext('2d')
    const tmp = document.createElement('canvas')
    const tctx = tmp.getContext('2d')
    let timer = 0
    let dead = false
    const size = () => {
      const r = cv.parentElement.getBoundingClientRect()
      const d = Math.min(2, Math.round(window.devicePixelRatio || 1))
      cv.width = Math.max(2, Math.round(r.width * d))
      cv.height = Math.max(2, Math.round(r.height * d))
    }
    const draw = (img, px) => {
      if (!img.naturalWidth) return
      const W = cv.width
      const H = cv.height
      const k = Math.max(W / img.naturalWidth, H / img.naturalHeight)
      const sw = W / k
      const sh = H / k
      const sx = (img.naturalWidth - sw) / 2
      const sy = (img.naturalHeight - sh) / 2
      if (!px) {
        ctx.imageSmoothingEnabled = true
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H)
        return
      }
      const n = Math.max(2, Math.round(Math.max(W, H) / (px * 2)))
      tmp.width = Math.round((n * W) / Math.max(W, H)) || 2
      tmp.height = Math.round((n * H) / Math.max(W, H)) || 2
      tctx.drawImage(img, sx, sy, sw, sh, 0, 0, tmp.width, tmp.height)
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(tmp, 0, 0, tmp.width, tmp.height, 0, 0, W, H)
    }
    const run = (img) => {
      size()
      if (reducedMotion()) return draw(img, 0)
      let i = 0
      draw(img, steps[0])
      timer = setInterval(() => {
        i++
        if (i >= steps.length || dead) return clearInterval(timer)
        draw(img, steps[i])
      }, 55)
    }
    const img = load(src)
    if (img.complete && img.naturalWidth) run(img)
    else img.onload = () => !dead && run(img)
    const ro = new ResizeObserver(() => {
      size()
      draw(img, 0)
    })
    ro.observe(cv.parentElement)
    return () => {
      dead = true
      clearInterval(timer)
      ro.disconnect()
    }
  }, [src])

  return <canvas ref={ref} className={'pixel-img ' + className} />
}
