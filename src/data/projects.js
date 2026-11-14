// Loyihalar endi admin paneldan boshqariladi (server/data/db.json). Bu yerda faqat
// sayt uchun hisoblanadigan maydonlar: tartib raqami, hover rangi va standart qiymatlar.

export const hexToRgb = (h = '#2a3bff') => {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(h).trim())
  if (!m) return [0.16, 0.23, 1]
  return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16) / 255)
}

export function normalizeProjects(list = []) {
  const visible = list.filter((p) => !p.hidden)
  return visible.map((p, i) => ({
    kept: [],
    stats: [],
    team: [],
    gallery: [],
    services: '',
    ...p,
    num: String(visible.length - i).padStart(2, '0'),
    industry: p.category || '',
    location: p.location || 'Namangan',
    tint: hexToRgb(p.color),
    gallery: (p.gallery || []).filter(Boolean),
  }))
}

export const categoriesOf = (projects) => ['Barchasi', ...new Set(projects.map((p) => p.category).filter(Boolean))]
