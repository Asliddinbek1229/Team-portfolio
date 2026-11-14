import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { buildDoc } from '../data/aiKit'

// AI/maxsus kodni izolyatsiyalangan iframe'da ko'rsatadi: kodning CSS va JS'i saytga, cookie/
// localStorage ga ta'sir qila olmaydi (allow-same-origin yo'q). Balandlik kontentga moslashadi.
export default function HtmlFrame({ code, color, width, minHeight = 80, title = 'Loyiha bo‘limi', preview = false }) {
  const rawId = useId()
  const id = useMemo(() => 'f' + rawId.replace(/[^a-z0-9]/gi, ''), [rawId])
  const ref = useRef(null)
  const [h, setH] = useState(null)
  const doc = useMemo(() => buildDoc(code || '', { id, color, origin: window.location.origin, preview }), [code, color, id, preview])

  useEffect(() => {
    const onMsg = (e) => {
      if (!ref.current || e.source !== ref.current.contentWindow) return
      const d = e.data
      if (!d || d.__gobo !== 'h' || d.id !== id) return
      const n = Number(d.h)
      if (Number.isFinite(n)) setH(Math.max(minHeight, Math.min(30000, n)))
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [id, minHeight])

  return (
    <iframe
      ref={ref}
      className={'html-frame' + (h ? ' ready' : '')}
      title={title}
      srcDoc={doc}
      sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
      referrerPolicy="no-referrer"
      loading="lazy"
      style={{ height: h || 400, width: width || '100%' }}
    />
  )
}
