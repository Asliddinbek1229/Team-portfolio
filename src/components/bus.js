// Lenta, kub va pastki slayder o'rtasidagi umumiy holat (template'dagi `J` obyekti).
export const bus = { pos: 0, stride: 1, n: 1, seek: null, geo: null }

export const smooth = (a, b, x) => {
  const r = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return r * r * (3 - 2 * r)
}

// Desktop: kartaning o'lchami va lenta markazining Y koordinatasi
export const stripGeo = (W, H) => ({
  S: Math.round(Math.max(190, Math.min(300, W * 0.19, H * 0.32))),
  CY: Math.round(H * 0.45),
})

export const MONO = `'Geist Mono', ui-monospace, 'SF Mono', Menlo, monospace`
export const SCRAMBLE = 'ABCDEFGHJKLMNPRSTVWXYZ0123456789#%&*+=/<>'
export const EASE = 'cubic-bezier(.22,.31,0,1)'

export const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Matnni tasodifiy belgilardan asl holatiga "decode" qilish
export function decode(el, text, steps = 8, ms = 70) {
  if (!el) return
  clearInterval(el._dec)
  let i = 0
  el._dec = setInterval(() => {
    i++
    const shown = Math.floor((i / steps) * text.length)
    el.textContent = [...text].map((c, k) => (c === ' ' ? ' ' : k < shown ? c : SCRAMBLE[(Math.random() * 41) | 0])).join('')
    if (i >= steps) {
      clearInterval(el._dec)
      el.textContent = text
    }
  }, ms)
}
