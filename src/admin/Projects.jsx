import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAdmin } from './AdminApp'
import { move, useConfirm, useToast } from './ui'

export default function ProjectsPage() {
  const { db, create, update, remove, order } = useAdmin()
  const [q, setQ] = useState('')
  const [over, setOver] = useState(null)
  const drag = useRef(null)
  const nav = useNavigate()
  const confirm = useConfirm()
  const toast = useToast()
  const list = db.projects
  const shown = list.filter((p) => !q || (p.name + ' ' + p.category).toLowerCase().includes(q.toLowerCase()))
  const visibleCount = list.filter((p) => !p.hidden).length
  const nums = {}
  let k = visibleCount
  list.forEach((p) => !p.hidden && (nums[p.id] = String(k--).padStart(2, '0')))

  const addNew = async (withAi) => {
    const p = await create(
      'projects',
      {
        name: 'Yangi loyiha',
        year: new Date().getFullYear(),
        category: 'Boshqaruv',
        color: '#2a3bff',
        tagline: '',
        intro: '',
        story: '',
        services: '',
        stack: '',
        site: '',
        kept: [],
        stats: [],
        gallery: [],
        cover: '',
        hidden: true,
      },
      'start',
    )
    toast('Loyiha yaratildi — u yashirin, tayyor bo‘lgach ko‘rsating')
    nav('/admin/projects/' + p.id + (withAi === true ? '?ai=1' : ''))
  }

  const drop = async (to) => {
    const from = drag.current
    setOver(null)
    drag.current = null
    if (from == null || from === to) return
    await order('projects', move(list, from, to).map((p) => p.id))
    toast('Tartib saqlandi')
  }

  return (
    <div className="a-page">
      <header className="a-head">
        <div>
          <h1>Loyihalar</h1>
          <p className="a-hint">
            Saytda {visibleCount} ta ko‘rinadi. Tartibni sudrab o‘zgartiring — birinchi loyiha lentada eng katta raqam bilan chiqadi.
          </p>
        </div>
        <div className="a-row">
          <input className="a-input" placeholder="Qidirish…" value={q} onChange={(e) => setQ(e.target.value)} />
          <button className="a-btn" onClick={() => addNew(true)}>
            ✦ AI bilan yangi loyiha
          </button>
          <button className="a-btn primary" onClick={() => addNew(false)}>
            + Yangi loyiha
          </button>
        </div>
      </header>

      <div className="a-list">
        {shown.map((p) => {
          const idx = list.indexOf(p)
          const num = nums[p.id] || '—'
          return (
            <div
              key={p.id}
              className={'a-item' + (p.hidden ? ' off' : '') + (over === idx ? ' over' : '')}
              draggable={!q}
              onDragStart={() => (drag.current = idx)}
              onDragOver={(e) => {
                e.preventDefault()
                setOver(idx)
              }}
              onDragLeave={() => setOver(null)}
              onDrop={() => drop(idx)}
            >
              <span className="a-grip" title="Sudrab tartiblang">
                ⋮⋮
              </span>
              <Link to={'/admin/projects/' + p.id} className="a-thumb" style={{ background: p.color }}>
                {p.cover && <img src={p.cover} alt="" />}
              </Link>
              <div className="a-item-main">
                <Link to={'/admin/projects/' + p.id} className="a-item-title">
                  <span className="a-mono">{num}</span> {p.name}
                </Link>
                <span className="a-hint">
                  {p.category} · {p.year}
                  {p.site ? ' · ' + p.site : ''}
                  {!p.cover && <b className="a-warn"> · muqova yo‘q</b>}
                </span>
              </div>
              <div className="a-item-actions">
                <button className="a-btn ghost sm" onClick={() => update('projects', p.id, { hidden: !p.hidden })}>
                  {p.hidden ? 'Ko‘rsatish' : 'Yashirish'}
                </button>
                <button className="a-icon" title="Yuqoriga" disabled={idx === 0} onClick={() => order('projects', move(list, idx, idx - 1).map((x) => x.id))}>
                  ↑
                </button>
                <button
                  className="a-icon"
                  title="Pastga"
                  disabled={idx === list.length - 1}
                  onClick={() => order('projects', move(list, idx, idx + 1).map((x) => x.id))}
                >
                  ↓
                </button>
                <button
                  className="a-icon"
                  title="Nusxa olish"
                  onClick={async () => {
                    const { id, slug, ...rest } = p
                    await create('projects', { ...rest, name: p.name + ' (nusxa)', hidden: true })
                    toast('Nusxa yaratildi (yashirin)')
                  }}
                >
                  ⧉
                </button>
                <Link className="a-btn sm" to={'/admin/projects/' + p.id}>
                  Tahrirlash
                </Link>
                {!p.hidden && (
                  <a className="a-icon" href={'/work/' + p.slug} target="_blank" rel="noreferrer" title="Saytda ko‘rish">
                    ↗
                  </a>
                )}
                <button
                  className="a-icon danger"
                  title="O‘chirish"
                  onClick={async () => {
                    if (await confirm(`“${p.name}” loyihasi butunlay o‘chirilsinmi? Zaxira nusxadan qaytarish mumkin.`)) {
                      await remove('projects', p.id)
                      toast('O‘chirildi')
                    }
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          )
        })}
        {!shown.length && <p className="a-empty">Hech narsa topilmadi.</p>}
      </div>
    </div>
  )
}
