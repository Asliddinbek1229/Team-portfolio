// Loyiha sahifasi bloklari. Har bir blok: { id, type, ...maydonlar }.
// `tabs` bloki ichida har bir tabning o'z `blocks` ro'yxati bor (tab ichida tab yo'q).

export const uid = () => Math.random().toString(36).slice(2, 10)

export const BLOCK_TYPES = {
  text: {
    label: 'Matn',
    hint: 'Sarlavha + matn. Ikki ustunli yoki keng.',
    make: () => ({ title: '', lead: '', body: '', layout: 'split' }),
  },
  info: {
    label: 'Ma’lumot jadvali',
    hint: 'Chapda kalit–qiymat jadvali, o‘ngda matn.',
    make: () => ({ rows: [['Mijoz', 'Namangan davlat universiteti']], lead: '', body: '' }),
  },
  images: {
    label: 'Rasmlar',
    hint: '1, 2 yoki 3 ta rasm qatorda.',
    make: () => ({ layout: 'full', items: [{ src: '', caption: '' }] }),
  },
  cards: {
    label: 'Kartalar',
    hint: 'Ikon/rasmli kartalar to‘ri — imkoniyatlar, modullar.',
    make: () => ({ title: '', columns: 3, items: [{ image: '', tag: '', title: 'Karta', text: '' }] }),
  },
  tabs: {
    label: 'Tablar',
    hint: 'Har bir tab ichida o‘z bloklari.',
    make: () => ({ title: '', tabs: [{ id: uid(), label: 'Birinchi tab', blocks: [] }] }),
  },
  stats: {
    label: 'Raqamlar',
    hint: 'Katta raqamlar qatori.',
    make: () => ({ items: [['100%', 'izoh']] }),
  },
  compare: {
    label: 'Ilgari → Endi',
    hint: 'O‘zgarishni ikki ustunda solishtirish.',
    make: () => ({ title: 'Nima o‘zgardi', left: 'Ilgari', right: 'Endi', rows: [['', '']] }),
  },
  list: {
    label: 'Ro‘yxat + jamoa',
    hint: 'Nuqtali ro‘yxat va yonida odamlar.',
    make: () => ({ title: 'Nimalar qoldi', items: [], peopleTitle: 'Jamoa', people: [] }),
  },
  quote: {
    label: 'Iqtibos',
    hint: 'Katta iqtibos va muallif.',
    make: () => ({ text: '', author: '' }),
  },
  video: {
    label: 'Video',
    hint: 'YouTube havolasi yoki .mp4 fayl manzili.',
    make: () => ({ url: '', caption: '' }),
  },
  slides: {
    label: 'Slayder',
    hint: 'Surib o‘tiladigan slaydlar, to‘liq ekranga chiqadi.',
    make: () => ({
      title: '',
      slides: [{ id: uid(), layout: 'feature', kicker: '', title: 'Birinchi slayd', text: '', points: [], images: [{ src: '', caption: '' }], url: '' }],
    }),
  },
  html: {
    label: 'AI / maxsus kod',
    hint: 'AI yozgan HTML+CSS. Izolyatsiyada ishlaydi, saytni buzmaydi.',
    make: () => ({ title: 'AI bo‘limi', code: '' }),
  },
  divider: {
    label: 'Bo‘shliq / chiziq',
    hint: 'Bo‘limlar orasida joy.',
    make: () => ({ size: 'md', line: true }),
  },
}

export const newBlock = (type) => ({ id: uid(), type, ...BLOCK_TYPES[type].make() })

// Eski (qat'iy) maydonlardan boshlang'ich bloklar — mavjud sahifalar o'zgarishsiz ko'rinadi
export function defaultBlocks(p) {
  const g = (p.gallery || []).filter(Boolean)
  const out = []
  out.push({ id: 'b-hero', type: 'images', layout: 'duo-wide', items: [{ src: p.cover || '' }, { src: g[0] || '' }] })
  out.push({
    id: 'b-info',
    type: 'info',
    rows: [
      ['Mijoz', 'Namangan davlat universiteti'],
      ['Yo‘nalish', p.category || ''],
      ['Yil', String(p.year || '')],
      ['Texnologiya', p.stack || ''],
      ['Imkoniyatlar', p.services || ''],
      ['Sayt', p.site || ''],
    ].filter(([, v]) => v),
    lead: p.intro || '',
    body: p.story || '',
  })
  if (p.stats?.length) out.push({ id: 'b-stats', type: 'stats', items: p.stats })
  if (g[1]) out.push({ id: 'b-full', type: 'images', layout: 'full', items: [{ src: g[1] }] })
  if (g[2] || g[3]) out.push({ id: 'b-duo', type: 'images', layout: 'duo', items: [g[2], g[3]].filter(Boolean).map((src) => ({ src })) })
  if (p.kept?.length || p.team?.length)
    out.push({ id: 'b-list', type: 'list', title: 'Nimalar qoldi', items: p.kept || [], peopleTitle: 'Jamoa', people: p.team || [] })
  return out
}

export const blocksOf = (p) => (Array.isArray(p.blocks) ? p.blocks : defaultBlocks(p))
