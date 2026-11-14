// Rasm bloki: rasm bo'lsa — to'liq qoplaydi; bo'lmasa — rangli fon.
export default function Cover({ p, src, className = '', alt = '' }) {
  const img = src || p?.cover
  return (
    <div className={'cover ' + className} style={{ background: p?.color || '#1c1b21' }}>
      {img && <img src={img} alt={alt || p?.name || ''} loading="lazy" draggable={false} />}
    </div>
  )
}
