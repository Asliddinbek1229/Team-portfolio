import { useEffect, useState } from 'react'
import { useAdmin } from './AdminApp'
import { Field, Tags, Text, useConfirm, useToast } from './ui'

const GROUPS = [
  [
    'Bosh sahifa',
    [
      ['logo', 'Logotip matni'],
      ['siteTitle', 'Brauzer sarlavhasi'],
      ['heroEyebrow', 'Kichik yozuv (sarlavha ustida)'],
      ['heroTitle', 'Sarlavha — oq qism'],
      ['heroTitleDim', 'Sarlavha — kulrang qism'],
      ['stripDrift', 'Lentaning o‘z-o‘zidan harakati (px/s)', { type: 'number', hint: '0 — to‘xtab turadi, 30 — standart' }],
    ],
  ],
  ['Loyihalar sahifasi', [['workIntro', 'Kirish matni', { hint: 'Oxiriga yillar oralig‘i qo‘shiladi' }]]],
  [
    'IT Park sahifasi',
    [
      ['studioEyebrow', 'Kichik yozuv'],
      ['studioTitle', 'Katta gradient sarlavha'],
      ['studioLead', 'Chap matn', { area: true }],
      ['studioText', 'O‘ng matn', { area: true, rows: 4 }],
      ['quote', 'Iqtibos', { area: true }],
      ['quoteAuthor', 'Iqtibos muallifi'],
      ['openRoles', 'Bo‘sh ish o‘rinlari', { tags: true }],
    ],
  ],
  [
    'Aloqa va footer',
    [
      ['contactIntro', 'Aloqa sahifasidagi kichik yozuv'],
      ['footerTitle', 'Footer sarlavhasi'],
      ['emails', 'Email manzillar', { tags: true }],
      ['phone', 'Telefon'],
      ['address', 'Manzil'],
      ['telegram', 'Telegram havolasi'],
      ['instagram', 'Instagram havolasi'],
      ['youtube', 'YouTube havolasi'],
    ],
  ],
]

export default function SettingsPage() {
  const { db, saveSettings, call, reload } = useAdmin()
  const [s, setS] = useState(db.settings)
  const [backups, setBackups] = useState([])
  const toast = useToast()
  const confirm = useConfirm()
  useEffect(() => setS(db.settings), [db.settings])
  useEffect(() => {
    call('/backups').then(setBackups).catch(() => {})
  }, [call, db.updatedAt])
  const dirty = JSON.stringify(s) !== JSON.stringify(db.settings)

  return (
    <div className="a-page">
      <header className="a-head sticky">
        <div>
          <h1>Sozlamalar</h1>
          <p className="a-hint">Saytdagi umumiy matnlar, aloqa ma’lumotlari va zaxira nusxalar.</p>
        </div>
        <div className="a-row">
          <button className="a-btn ghost" disabled={!dirty} onClick={() => setS(db.settings)}>
            Bekor qilish
          </button>
          <button
            className="a-btn primary"
            disabled={!dirty}
            onClick={async () => {
              await saveSettings(s)
              toast('Saqlandi')
            }}
          >
            Saqlash
          </button>
        </div>
      </header>
      {GROUPS.map(([title, fields]) => (
        <section className="a-card" key={title}>
          <h2>{title}</h2>
          <div className="a-grid2">
            {fields.map(([k, label, o = {}]) => (
              <Field key={k} label={label} hint={o.hint} wide={o.area || o.tags}>
                {o.tags ? (
                  <Tags value={s[k] || []} onChange={(v) => setS({ ...s, [k]: v })} />
                ) : (
                  <Text
                    area={o.area}
                    rows={o.rows}
                    type={o.type}
                    value={s[k]}
                    onChange={(v) => setS({ ...s, [k]: o.type === 'number' ? Number(v) : v })}
                  />
                )}
              </Field>
            ))}
          </div>
        </section>
      ))}
      <section className="a-card">
        <h2>Zaxira nusxalar</h2>
        <p className="a-hint">Har bir o‘zgarishda (10 daqiqada ko‘pi bilan bir marta) avtomatik saqlanadi, oxirgi 30 tasi turadi.</p>
        <div className="a-backups">
          {backups.length === 0 && <span className="a-hint">Hozircha zaxira yo‘q.</span>}
          {backups.map((b) => (
            <div key={b} className="a-row between">
              <span className="a-mono">{b.replace(/^db-|\.json$/g, '').replace(/T(\d\d)-(\d\d)-(\d\d).*/, ' $1:$2:$3')}</span>
              <button
                className="a-btn ghost sm"
                onClick={async () => {
                  if (await confirm('Shu zaxira nusxa tiklansinmi? Hozirgi holat ham zaxiraga tushadi.', { ok: 'Tiklash', danger: false })) {
                    await call(`/backups/${encodeURIComponent(b)}/restore`, { method: 'POST' })
                    await reload()
                    toast('Tiklandi')
                  }
                }}
              >
                Tiklash
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
