// Har bir rasm: out — fayl nomi (public/img/cover/<out>.png), w/h — o'lcham, bg — fon rangi,
// kind — laptop | phone | phones | browser | poster, src — public/img/real ichidagi ekran rasmi.

const COVER = { w: 1200, h: 1200 }
const WIDE = { w: 1400, h: 1050 } // loyiha sahifasidagi ikkinchi (kengroq) rasm
const FULL = { w: 1600, h: 900 }
const HALF = { w: 1200, h: 1000 }

export const specs = [
  // ── NamDU LMS ──
  { out: 'lms', ...COVER, bg: '#1f3c66', kind: 'laptop', src: 'lms-executive.jpg', scale: 82 },
  { out: 'lms-1', ...WIDE, bg: '#e9e2d6', kind: 'phones', src: ['lms-m-dashboard.jpg', 'lms-m-executive.jpg'], scale: 80 },
  { out: 'lms-2', ...FULL, bg: '#24477a', kind: 'browser', src: 'lms-risk-safe.png', url: 'lms.namsu.uz/erta-ogohlantirish', scale: 70 },
  { out: 'lms-3', ...HALF, bg: '#d9cfbf', kind: 'browser', src: 'lms-attendance.jpg', url: 'lms.namsu.uz/davomat', scale: 84 },
  { out: 'lms-4', ...HALF, bg: '#16304f', kind: 'phone', src: 'lms-m-risk.jpg', scale: 82 },

  // ── Keldi-Ketti ──
  { out: 'kk', ...COVER, bg: '#12b383', kind: 'laptop', src: 'kk-stats.jpg', scale: 82 },
  { out: 'kk-1', ...WIDE, bg: '#0c2b2b', kind: 'browser', src: 'kk-live-safe.png', url: 'Keldi-Ketti · Jonli harakatlar', scale: 84 },
  { out: 'kk-2', ...FULL, bg: '#12b383', kind: 'browser', src: 'kk-faculty.jpg', url: 'Keldi-Ketti · Fakultetlar reytingi', scale: 70 },
  { out: 'kk-3', ...HALF, bg: '#0f3b3a', kind: 'browser', src: 'kk-enroll.jpg', url: 'Keldi-Ketti · FaceID yuklash', scale: 84 },
  { out: 'kk-4', ...HALF, bg: '#5fd3ad', kind: 'browser', src: 'kk-night-safe.png', url: 'Keldi-Ketti · 22:00–05:00', scale: 84 },

  // ── UniScore KPI ──
  { out: 'kpi', ...COVER, bg: '#3554d1', kind: 'phone', src: 'kpi-mobile-safe.png', scale: 82 },
  { out: 'kpi-1', ...WIDE, bg: '#e6eaf7', kind: 'browser', src: 'kpi-program-safe.png', url: 'kpi.namdu.uz/dastur', scale: 84 },
  { out: 'kpi-2', ...FULL, bg: '#3554d1', kind: 'browser', src: 'kpi-ranking-safe.png', url: 'kpi.namdu.uz/reyting', scale: 70 },
  { out: 'kpi-3', ...HALF, bg: '#1d2c74', kind: 'browser', src: 'kpi-stats-safe.png', url: 'kpi.namdu.uz/statistika', scale: 84 },
  { out: 'kpi-4', ...HALF, bg: '#dfe5f7', kind: 'browser', src: 'kpi-person-safe.png', url: 'kpi.namdu.uz/xodim', scale: 84 },

  // ── Ekran rasmi hali yo'q loyihalar: tipografik poster ──
  { out: 'eco', ...COVER, bg: '#e0476d', kind: 'poster', ink: '#1a0509', kicker: 'namdu.uz', title: 'Eco\nSystem', lines: ['Qabul · E-kontent', 'Ilmiy faoliyat · Tyutor'] },
  { out: 'support', ...COVER, bg: '#1d4fd8', kind: 'poster', ink: '#eaf0ff', kicker: 'Telegram · Web panel', title: 'Support\nDesk', lines: ['Murojaat → texnik', 'KPI · Audit'] },
  { out: 'edurate', ...COVER, bg: '#7a1f3a', kind: 'poster', ink: '#fbeef2', kicker: '@namduedurate', title: 'Edu\nRate', lines: ['HEMIS login', 'Dars jadvali · So‘rovnoma'] },
  { out: 'bots', ...COVER, bg: '#1f6b68', kind: 'poster', ink: '#eafbf8', kicker: 'Anonim murojaat', title: 'Murojaat\nbotlari', fs: 150, lines: ['Dekanat · Yotoqxona', 'Stipendiya · Korrupsiya'] },
  // ── UniVision (kamera kadrlari xiralashtirilgan) ──
  { out: 'uv', ...COVER, bg: '#0f8f80', kind: 'laptop', src: 'uv-mosaic-safe.png', scale: 82 },
  // ── Namdu MQB ──
  { out: 'mqb', ...COVER, bg: '#1b6fe8', kind: 'laptop', src: 'mqb-dashboard-safe.png', scale: 82 },
  // ── Raqamli kutubxona ──
  { out: 'lib', ...COVER, bg: '#5b2fd0', kind: 'laptop', src: 'lib-landing-safe.png', scale: 82 },
  // ── UniDoc ──
  { out: 'ud', ...COVER, bg: '#0f5c5c', kind: 'laptop', src: 'ud-schedule-safe.png', scale: 82 },
  { out: 'eqabul', ...COVER, bg: '#3d78b8', kind: 'poster', ink: '#eef5ff', kicker: 'Qabul komissiyasi', title: 'E-\nQabul', lines: ['Onlayn ariza', 'Holatni kuzatish'] },
]
