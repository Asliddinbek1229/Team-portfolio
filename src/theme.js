// Yorug' / qorong'i mavzu. Tanlov localStorage'da saqlanadi; tanlanmagan bo'lsa — tizim (OS) sozlamasiga ergashadi.
// Birinchi bo'yalishdan oldingi qism index.html ichidagi kichik skriptda (miltillash bo'lmasligi uchun) — kalit bir xil.
import { useEffect, useState } from 'react'

export const THEME_KEY = 'namdu-theme'
const EVENT = 'namdu-theme'
const BG = { dark: '#0b0a0f', light: '#f5f4f0' }

const html = () => document.documentElement
const mq = () => window.matchMedia?.('(prefers-color-scheme: light)')

export function storedTheme() {
  try {
    const v = localStorage.getItem(THEME_KEY)
    return v === 'light' || v === 'dark' ? v : null
  } catch {
    return null
  }
}
export const systemTheme = () => (mq()?.matches ? 'light' : 'dark')
export const currentTheme = () => (html().dataset.theme === 'light' ? 'light' : 'dark')
export const isLight = () => html().dataset.theme === 'light'

function apply(t, animate) {
  const el = html()
  if (el.dataset.theme === t) return
  // mavzu almashganda barcha ranglar bir vaqtda, silliq o'tadi
  if (animate && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    el.classList.add('theme-anim')
    clearTimeout(apply._t)
    apply._t = setTimeout(() => el.classList.remove('theme-anim'), 450)
  }
  el.dataset.theme = t
  el.style.colorScheme = t
  let meta = document.querySelector('meta[name="theme-color"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.name = 'theme-color'
    document.head.appendChild(meta)
  }
  meta.content = BG[t]
  window.dispatchEvent(new CustomEvent(EVENT, { detail: t }))
}

export function setTheme(t) {
  try {
    localStorage.setItem(THEME_KEY, t)
  } catch {}
  apply(t, true)
}

// ilova ishga tushganda bir marta: tizim mavzusi o'zgarsa (foydalanuvchi o'zi tanlamagan bo'lsa) ergashadi
export function initTheme() {
  apply(storedTheme() || systemTheme(), false)
  mq()?.addEventListener?.('change', () => !storedTheme() && apply(systemTheme(), true))
  // boshqa tabda almashtirilsa — shu tab ham moslashadi
  window.addEventListener('storage', (e) => e.key === THEME_KEY && apply(storedTheme() || systemTheme(), true))
}

export function onThemeChange(fn) {
  const h = (e) => fn(e.detail)
  window.addEventListener(EVENT, h)
  return () => window.removeEventListener(EVENT, h)
}

export function useTheme() {
  const [t, setT] = useState(currentTheme)
  useEffect(() => onThemeChange(setT), [])
  return t
}
