import { useCallback, useEffect, useState } from 'react'
import { useAdmin } from './AdminApp'
import CoverMaker from './CoverMaker'
import { uploadFiles } from './api'
import { useConfirm, useToast } from './ui'

export default function MediaPage() {
  const { call } = useAdmin()
  const [items, setItems] = useState([])
  const [busy, setBusy] = useState(false)
  const [tab, setTab] = useState('all')
  const [q, setQ] = useState('')
  const toast = useToast()
  const confirm = useConfirm()
  const load = useCallback(() => call('/media').then(setItems).catch(() => {}), [call])
  useEffect(() => {
    load()
  }, [load])

  const up = async (files) => {
    if (!files?.length) return
    setBusy(true)
    try {
      const r = await uploadFiles(files)
      toast(`${r.length} ta rasm yuklandi`)
      load()
    } catch (e) {
      toast(e.message, 'err')
    }
    setBusy(false)
  }
  const shown = items.filter((m) => (tab === 'all' || m.source === tab) && (!q || m.url.toLowerCase().includes(q.toLowerCase())))

  return (
    <div className="a-page" onDragOver={(e) => e.preventDefault()} onDrop={(e) => (e.preventDefault(), up(e.dataTransfer.files))}>
      <header className="a-head">
        <div>
          <h1>Media</h1>
          <p className="a-hint">Rasmlarni shu sahifaga sudrab tashlang. Yuklanganlarni o‘chirish mumkin; /img dagilar sayt bilan birga keladi.</p>
        </div>
        <div className="a-row">
          <input className="a-input" placeholder="Qidirish…" value={q} onChange={(e) => setQ(e.target.value)} />
          <label className="a-btn primary">
            {busy ? 'Yuklanmoqda…' : '+ Yuklash'}
            <input type="file" accept="image/*" multiple hidden onChange={(e) => up(e.target.files)} />
          </label>
        </div>
      </header>

      <details className="a-card">
        <summary>
          <h2>✦ Muqova generatori</h2>
          <span className="a-hint">Ekran rasmini noutbuk / telefon / brauzer ichiga joylab, rangli fon bilan yangi rasm yasaydi.</span>
        </summary>
        <CoverMaker onUse={[['Ro‘yxatni yangilash', () => load()]]} />
      </details>

      <div className="a-seg">
        {[
          ['upload', 'Yuklanganlar'],
          ['public', 'Sayt rasmlari'],
          ['all', 'Hammasi'],
        ].map(([k, l]) => (
          <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
            {l}
          </button>
        ))}
      </div>
      <div className="a-media-grid big">
        {shown.map((m) => (
          <div key={m.url} className="a-media">
            <img src={m.url} alt="" loading="lazy" />
            <span>{m.name}</span>
            <div className="a-media-actions">
              <button
                className="a-btn sm"
                onClick={() => {
                  navigator.clipboard?.writeText(m.url)
                  toast('Manzil nusxalandi')
                }}
              >
                Nusxa
              </button>
              {m.source === 'upload' && (
                <button
                  className="a-btn danger sm"
                  onClick={async () => {
                    if (await confirm('Rasm o‘chirilsinmi? U ishlatilayotgan joylarda bo‘sh qoladi.')) {
                      await call('/media?url=' + encodeURIComponent(m.url), { method: 'DELETE' })
                      load()
                    }
                  }}
                >
                  O‘chirish
                </button>
              )}
            </div>
          </div>
        ))}
        {!shown.length && <p className="a-empty">Rasm yo‘q.</p>}
      </div>
    </div>
  )
}
