import { useEffect, useRef, useState } from 'react'
import { useAdmin } from './AdminApp'
import { Field, ImageField, Text, move, useConfirm, useToast } from './ui'

// Umumiy ro'yxat muharriri: har bir element kartochka, ichida maydonlar; sudrab tartiblash.
function ListEditor({ col, title, hint, fields, blank, ratio, imageKey, titleKey }) {
  const { db, create, update, remove, order } = useAdmin()
  const list = db[col]
  const [open, setOpen] = useState(null)
  const [over, setOver] = useState(null)
  const drag = useRef(null)
  const toast = useToast()
  const confirm = useConfirm()

  return (
    <div className="a-page">
      <header className="a-head">
        <div>
          <h1>{title}</h1>
          <p className="a-hint">{hint}</p>
        </div>
        <button
          className="a-btn primary"
          onClick={async () => {
            const item = await create(col, blank())
            setOpen(item.id)
            toast('Qo‘shildi')
          }}
        >
          + Qo‘shish
        </button>
      </header>
      <div className="a-cards">
        {list.map((item, i) => (
          <div
            key={item.id}
            className={'a-lcard' + (over === i ? ' over' : '') + (open === item.id ? ' open' : '')}
            draggable={open !== item.id}
            onDragStart={() => (drag.current = i)}
            onDragOver={(e) => {
              e.preventDefault()
              setOver(i)
            }}
            onDragLeave={() => setOver(null)}
            onDrop={async () => {
              const from = drag.current
              setOver(null)
              if (from == null || from === i) return
              await order(col, move(list, from, i).map((x) => x.id))
            }}
          >
            <div className="a-lcard-img" style={{ aspectRatio: ratio }} onClick={() => setOpen(open === item.id ? null : item.id)}>
              {item[imageKey] ? <img src={item[imageKey]} alt="" /> : <span>Rasm yo‘q</span>}
            </div>
            <div className="a-lcard-body">
              <b>{item[titleKey] || '—'}</b>
              <div className="a-row">
                <button className="a-btn sm" onClick={() => setOpen(open === item.id ? null : item.id)}>
                  {open === item.id ? 'Yopish' : 'Tahrirlash'}
                </button>
                <button
                  className="a-icon danger"
                  title="O‘chirish"
                  onClick={async () => {
                    if (await confirm(`“${item[titleKey] || 'Element'}” o‘chirilsinmi?`)) {
                      await remove(col, item.id)
                      toast('O‘chirildi')
                    }
                  }}
                >
                  ×
                </button>
              </div>
            </div>
            {open === item.id && <ItemForm item={item} fields={fields} ratio={ratio} imageKey={imageKey} onSave={(v) => update(col, item.id, v).then(() => toast('Saqlandi'))} />}
          </div>
        ))}
      </div>
    </div>
  )
}

function ItemForm({ item, fields, imageKey, ratio, onSave }) {
  const [v, setV] = useState(item)
  useEffect(() => setV(item), [item])
  const dirty = JSON.stringify(v) !== JSON.stringify(item)
  return (
    <div className="a-lcard-form">
      <Field label="Rasm">
        <ImageField value={v[imageKey]} onChange={(u) => setV({ ...v, [imageKey]: u })} ratio={ratio} />
      </Field>
      {fields.map(([k, label, opts = {}]) => (
        <Field key={k} label={label} hint={opts.hint}>
          <Text area={opts.area} rows={opts.rows} value={v[k]} onChange={(x) => setV({ ...v, [k]: x })} placeholder={opts.placeholder} />
        </Field>
      ))}
      <div className="a-row end">
        <button className="a-btn ghost sm" disabled={!dirty} onClick={() => setV(item)}>
          Bekor qilish
        </button>
        <button className="a-btn primary sm" disabled={!dirty} onClick={() => onSave(v)}>
          Saqlash
        </button>
      </div>
    </div>
  )
}

export function TeamPage() {
  return (
    <ListEditor
      col="team"
      title="Jamoa"
      hint="IT Park sahifasidagi portretlar. Tartibni sudrab o‘zgartiring. Portretlar qora-oq ko‘rsatiladi."
      ratio="3 / 4"
      imageKey="photo"
      titleKey="name"
      blank={() => ({ name: 'Ism Familiya', role: 'Lavozim', photo: '' })}
      fields={[
        ['name', 'Ism familiya'],
        ['role', 'Lavozim'],
      ]}
    />
  )
}

export function PostsPage() {
  return (
    <ListEditor
      col="posts"
      title="Maqolalar"
      hint="Maqolalar sahifasidagi kartochkalar. Havola bo‘lsa, karta o‘sha manzilni ochadi."
      ratio="16 / 10"
      imageKey="image"
      titleKey="title"
      blank={() => ({ title: 'Yangi maqola', category: 'Yangilik', read: '3 daqiqa', excerpt: '', image: '', url: '' })}
      fields={[
        ['title', 'Sarlavha'],
        ['category', 'Kategoriya'],
        ['read', 'O‘qish vaqti', { placeholder: '3 daqiqa' }],
        ['excerpt', 'Qisqa matn', { area: true, rows: 3 }],
        ['url', 'Havola', { placeholder: 'https://…', hint: 'Bo‘sh qolsa karta bosilmaydi' }],
      ]}
    />
  )
}
