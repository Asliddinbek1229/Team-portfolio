import { useRef, useState } from 'react'
import { BLOCK_TYPES, newBlock, uid } from '../data/blocks'
import { Field, ImageField, Rows, Tags, Text, Toggle, move, useConfirm } from './ui'
import AiWizard from './AiWizard'
import HtmlFrame from '../components/HtmlFrame'
import { normalizeCode } from '../data/aiKit'
import ImageLinker from './ImageLinker'

const FORMAT_HINT = 'Bo‘sh qator — yangi paragraf · “- ” bilan qator — ro‘yxat · **qalin**'

function Seg({ value, onChange, options }) {
  return (
    <div className="a-seg">
      {options.map(([v, l]) => (
        <button key={v} type="button" className={value === v ? 'on' : ''} onClick={() => onChange(v)}>
          {l}
        </button>
      ))}
    </div>
  )
}

// Blok turi tanlash paneli
function Palette({ onPick, onClose, allowTabs }) {
  return (
    <div className="a-palette">
      <div className="a-row between">
        <span className="a-label">Qanday blok qo‘shamiz?</span>
        {onClose && (
          <button type="button" className="a-icon" onClick={onClose} aria-label="Yopish">
            ×
          </button>
        )}
      </div>
      <div className="a-palette-grid">
        {Object.entries(BLOCK_TYPES)
          .filter(([k]) => allowTabs || k !== 'tabs')
          .map(([k, t]) => (
            <button key={k} type="button" className="a-palette-item" onClick={() => onPick(k)}>
              <b>{t.label}</b>
              <span>{t.hint}</span>
            </button>
          ))}
      </div>
    </div>
  )
}

// Massivdagi elementlar (kartalar, rasmlar) uchun kichik boshqaruv
function ItemTools({ i, list, onChange }) {
  return (
    <span className="a-row">
      <button type="button" className="a-icon" disabled={i === 0} onClick={() => onChange(move(list, i, i - 1))} title="Oldinga">
        ↑
      </button>
      <button type="button" className="a-icon" disabled={i === list.length - 1} onClick={() => onChange(move(list, i, i + 1))} title="Orqaga">
        ↓
      </button>
      <button type="button" className="a-icon danger" onClick={() => onChange(list.filter((_, k) => k !== i))} title="O‘chirish">
        ×
      </button>
    </span>
  )
}

const LAYOUT_COUNT = { full: 1, duo: 2, 'duo-wide': 2, trio: 3 }

function BlockForm({ b, set, project }) {
  switch (b.type) {
    case 'text':
      return (
        <>
          <div className="a-grid2">
            <Field label="Sarlavha">
              <Text value={b.title} onChange={set('title')} />
            </Field>
            <Field label="Joylashuv">
              <Seg value={b.layout || 'split'} onChange={set('layout')} options={[['split', 'Ikki ustun'], ['wide', 'Keng']]} />
            </Field>
          </div>
          <Field label="Kichik yozuv (sarlavha ustida)">
            <Text value={b.kicker} onChange={set('kicker')} />
          </Field>
          <Field label="Asosiy matn (oq)" hint={FORMAT_HINT}>
            <Text area rows={3} value={b.lead} onChange={set('lead')} />
          </Field>
          <Field label="Qo‘shimcha matn (kulrang)" hint={FORMAT_HINT}>
            <Text area rows={5} value={b.body} onChange={set('body')} />
          </Field>
        </>
      )
    case 'info':
      return (
        <>
          <Field label="Jadval">
            <Rows value={b.rows || []} onChange={set('rows')} cols={['Kalit', 'Qiymat']} />
          </Field>
          <Field label="Asosiy matn (oq)" hint={FORMAT_HINT}>
            <Text area rows={3} value={b.lead} onChange={set('lead')} />
          </Field>
          <Field label="Qo‘shimcha matn (kulrang)" hint={FORMAT_HINT}>
            <Text area rows={4} value={b.body} onChange={set('body')} />
          </Field>
        </>
      )
    case 'images': {
      const items = b.items || []
      const setItems = set('items')
      return (
        <>
          <Field label="Joylashuv">
            <Seg
              value={b.layout || 'full'}
              onChange={(v) => {
                const n = LAYOUT_COUNT[v]
                const next = items.slice(0, n)
                while (next.length < n) next.push({ src: '', caption: '' })
                set('__all')({ layout: v, items: next })
              }}
              options={[
                ['full', '1 · to‘liq'],
                ['duo', '2 · teng'],
                ['duo-wide', '2 · tor + keng'],
                ['trio', '3 · teng'],
              ]}
            />
          </Field>
          <div className={'a-img-row n' + items.length}>
            {items.map((it, i) => (
              <div key={i} className="a-img-cell">
                <ImageField value={it.src} onChange={(u) => setItems(items.map((x, k) => (k === i ? { ...x, src: u } : x)))} ratio={b.layout === 'full' ? '16 / 9' : '4 / 3'} />
                <Text value={it.caption} onChange={(v) => setItems(items.map((x, k) => (k === i ? { ...x, caption: v } : x)))} placeholder="Izoh (ixtiyoriy)" />
              </div>
            ))}
          </div>
        </>
      )
    }
    case 'cards': {
      const items = b.items || []
      const setItems = set('items')
      const upd = (i, k) => (v) => setItems(items.map((x, n) => (n === i ? { ...x, [k]: v } : x)))
      return (
        <>
          <div className="a-grid2">
            <Field label="Sarlavha (ixtiyoriy)">
              <Text value={b.title} onChange={set('title')} />
            </Field>
            <Field label="Ustunlar">
              <Seg value={String(b.columns || 3)} onChange={(v) => set('columns')(Number(v))} options={[['2', '2'], ['3', '3'], ['4', '4']]} />
            </Field>
          </div>
          <div className="a-card-items">
            {items.map((c, i) => (
              <div key={i} className="a-card-item">
                <div className="a-row between">
                  <span className="a-label">Karta {i + 1}</span>
                  <ItemTools i={i} list={items} onChange={setItems} />
                </div>
                <div className="a-card-item-grid">
                  <ImageField value={c.image} onChange={upd(i, 'image')} ratio="16 / 10" label="Rasm (ixtiyoriy)" />
                  <div>
                    <div className="a-grid2">
                      <Field label="Sarlavha">
                        <Text value={c.title} onChange={upd(i, 'title')} />
                      </Field>
                      <Field label="Yorliq (kichik)">
                        <Text value={c.tag} onChange={upd(i, 'tag')} placeholder="01 · MODUL" />
                      </Field>
                    </div>
                    <Field label="Matn" hint={FORMAT_HINT}>
                      <Text area rows={3} value={c.text} onChange={upd(i, 'text')} />
                    </Field>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button type="button" className="a-btn ghost sm" onClick={() => setItems([...items, { image: '', tag: '', title: 'Karta', text: '' }])}>
            + Karta qo‘shish
          </button>
        </>
      )
    }
    case 'tabs':
      return <TabsForm b={b} set={set} project={project} />
    case 'stats':
      return (
        <Field label="Raqamlar" hint="2–4 ta bo‘lsa chiroyli turadi">
          <Rows value={b.items || []} onChange={set('items')} cols={['Raqam', 'Izoh']} />
        </Field>
      )
    case 'compare':
      return (
        <>
          <Field label="Sarlavha">
            <Text value={b.title} onChange={set('title')} />
          </Field>
          <div className="a-grid2">
            <Field label="Chap ustun nomi">
              <Text value={b.left} onChange={set('left')} />
            </Field>
            <Field label="O‘ng ustun nomi">
              <Text value={b.right} onChange={set('right')} />
            </Field>
          </div>
          <Field label="Qatorlar">
            <Rows value={b.rows || []} onChange={set('rows')} cols={[b.left || 'Ilgari', b.right || 'Endi']} />
          </Field>
        </>
      )
    case 'list':
      return (
        <>
          <div className="a-grid2">
            <Field label="Ro‘yxat sarlavhasi">
              <Text value={b.title} onChange={set('title')} />
            </Field>
            <Field label="Odamlar sarlavhasi">
              <Text value={b.peopleTitle} onChange={set('peopleTitle')} />
            </Field>
          </div>
          <Field label="Ro‘yxat" hint="Enter bilan qo‘shing, sudrab tartiblang">
            <Tags value={b.items || []} onChange={set('items')} />
          </Field>
          <Field label="Odamlar (bo‘sh qolsa ko‘rinmaydi)">
            <Rows value={b.people || []} onChange={set('people')} cols={['Ism', 'Vazifa']} />
          </Field>
        </>
      )
    case 'quote':
      return (
        <>
          <Field label="Iqtibos">
            <Text area rows={3} value={b.text} onChange={set('text')} />
          </Field>
          <Field label="Muallif">
            <Text value={b.author} onChange={set('author')} />
          </Field>
        </>
      )
    case 'video':
      return (
        <>
          <Field label="Video havolasi" hint="YouTube havolasi yoki /uploads/… .mp4 manzili">
            <Text value={b.url} onChange={set('url')} placeholder="https://youtu.be/…" />
          </Field>
          <Field label="Izoh">
            <Text value={b.caption} onChange={set('caption')} />
          </Field>
        </>
      )
    case 'html':
      return <HtmlForm b={b} set={set} project={project} />
    case 'slides':
      return <SlidesForm b={b} set={set} />
    case 'divider':
      return (
        <div className="a-row wrap">
          <Seg value={b.size || 'md'} onChange={set('size')} options={[['sm', 'Kichik'], ['md', 'O‘rta'], ['lg', 'Katta']]} />
          <Toggle value={!!b.line} onChange={set('line')} label="Chiziq" />
        </div>
      )
    default:
      return <p className="a-hint">Noma’lum blok turi: {b.type}</p>
  }
}

const SLIDE_LAYOUTS = [
  ['cover', 'Muqova'],
  ['feature', 'Ekran + matn'],
  ['phones', 'Telefonlar'],
  ['points', 'Ro‘yxat'],
  ['stats', 'Raqamlar'],
  ['compare', 'Ilgari → Endi'],
]

function SlidesForm({ b, set }) {
  const slides = b.slides || []
  const [cur, setCur] = useState(0)
  const confirm = useConfirm()
  const i = Math.min(cur, slides.length - 1)
  const s = slides[i]
  const setSlides = set('slides')
  const upd = (patch) => setSlides(slides.map((x, k) => (k === i ? { ...x, ...patch } : x)))
  const imgs = s?.images || []
  const setImgs = (v) => upd({ images: v })
  const blank = () => ({ id: uid(), layout: 'feature', kicker: '', title: 'Yangi slayd', text: '', points: [], images: [{ src: '', caption: '' }], url: '' })
  return (
    <>
      <Field label="Slayder sarlavhasi (ixtiyoriy)">
        <Text value={b.title} onChange={set('title')} />
      </Field>
      <div className="a-tabs-edit">
        <div className="a-tabs-bar">
          {slides.map((x, k) => (
            <button key={x.id || k} type="button" className={k === i ? 'on' : ''} onClick={() => setCur(k)} title={x.title}>
              {String(k + 1).padStart(2, '0')}
              <em>{(x.title || '').slice(0, 14)}</em>
            </button>
          ))}
          <button
            type="button"
            className="add"
            onClick={() => {
              setSlides([...slides.slice(0, i + 1), blank(), ...slides.slice(i + 1)])
              setCur(i + 1)
            }}
          >
            + Slayd
          </button>
        </div>
        {s && (
          <div className="a-tab-panel">
            <div className="a-row between wrap">
              <Seg value={s.layout || 'feature'} onChange={(v) => upd({ layout: v })} options={SLIDE_LAYOUTS} />
              <span className="a-row">
                <button type="button" className="a-icon" disabled={i === 0} onClick={() => (setSlides(move(slides, i, i - 1)), setCur(i - 1))} title="Oldinga">
                  ←
                </button>
                <button
                  type="button"
                  className="a-icon"
                  disabled={i === slides.length - 1}
                  onClick={() => (setSlides(move(slides, i, i + 1)), setCur(i + 1))}
                  title="Orqaga"
                >
                  →
                </button>
                <button
                  type="button"
                  className="a-icon"
                  title="Nusxa"
                  onClick={() => {
                    const c = { ...JSON.parse(JSON.stringify(s)), id: uid() }
                    setSlides([...slides.slice(0, i + 1), c, ...slides.slice(i + 1)])
                    setCur(i + 1)
                  }}
                >
                  ⧉
                </button>
                <button
                  type="button"
                  className="a-icon danger"
                  title="Slaydni o‘chirish"
                  onClick={async () => {
                    if (await confirm(`${i + 1}-slayd o‘chirilsinmi?`)) {
                      setSlides(slides.filter((_, k) => k !== i))
                      setCur(Math.max(0, i - 1))
                    }
                  }}
                >
                  ×
                </button>
              </span>
            </div>
            <div className="a-grid2">
              <Field label="Kichik yozuv">
                <Text value={s.kicker} onChange={(v) => upd({ kicker: v })} placeholder="NAMDU LMS · NAZORAT" />
              </Field>
              <Field label="Manzil satri (ekran ustida)">
                <Text value={s.url} onChange={(v) => upd({ url: v })} placeholder="lms.namsu.uz" />
              </Field>
            </div>
            <Field label="Sarlavha">
              <Text value={s.title} onChange={(v) => upd({ title: v })} />
            </Field>
            <Field label="Matn">
              <Text area rows={3} value={s.text} onChange={(v) => upd({ text: v })} />
            </Field>
            {s.layout === 'stats' && (
              <Field label="Raqamlar" hint="Raqam 0 dan sanab chiqadi. 2–4 ta yaxshi turadi.">
                <Rows value={s.items || []} onChange={(v) => upd({ items: v })} cols={['Raqam (masalan 15 937)', 'Izoh', 'Kichik izoh']} />
              </Field>
            )}
            {s.layout === 'compare' && (
              <>
                <div className="a-grid2">
                  <Field label="Chap ustun">
                    <Text value={s.left} onChange={(v) => upd({ left: v })} placeholder="Ilgari" />
                  </Field>
                  <Field label="O‘ng ustun">
                    <Text value={s.right} onChange={(v) => upd({ right: v })} placeholder="Endi" />
                  </Field>
                </div>
                <Field label="Qatorlar">
                  <Rows value={s.rows || []} onChange={(v) => upd({ rows: v })} cols={[s.left || 'Ilgari', s.right || 'Endi']} />
                </Field>
              </>
            )}
            {!['stats', 'compare'].includes(s.layout) && (
              <Field label="Punktlar" hint="Enter bilan qo‘shing, sudrab tartiblang">
                <Tags value={s.points || []} onChange={(v) => upd({ points: v })} />
              </Field>
            )}
            {['feature', 'cover', 'phones'].includes(s.layout || 'feature') && (
              <Field label="Afzalligi" hint="Rangli blokda ajralib chiqadi: bu imkoniyat nima beradi">
                <Text area rows={2} value={s.benefit} onChange={(v) => upd({ benefit: v })} />
              </Field>
            )}
            {!['points', 'stats', 'compare'].includes(s.layout) && (
              <>
                <span className="a-label">Rasmlar</span>
                <div className={'a-img-row n' + Math.min(3, imgs.length || 1)}>
                  {imgs.map((im, k) => (
                    <div key={k} className="a-img-cell">
                      <ImageField value={im.src} onChange={(u) => setImgs(imgs.map((x, n) => (n === k ? { ...x, src: u } : x)))} ratio={s.layout === 'phones' && !im.wide ? '9 / 19' : '16 / 10'} />
                      <Text value={im.caption} onChange={(v) => setImgs(imgs.map((x, n) => (n === k ? { ...x, caption: v } : x)))} placeholder="Izoh" />
                      {s.layout === 'phones' && (
                        <Toggle value={!!im.wide} onChange={(v) => setImgs(imgs.map((x, n) => (n === k ? { ...x, wide: v } : x)))} label="Keng ekran" />
                      )}
                      {imgs.length > 1 && (
                        <button type="button" className="a-btn ghost sm" onClick={() => setImgs(imgs.filter((_, n) => n !== k))}>
                          Olib tashlash
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {(s.layout === 'phones' ? imgs.length < 4 : imgs.length < 1) && (
                  <button type="button" className="a-btn ghost sm" onClick={() => setImgs([...imgs, { src: '', caption: '' }])}>
                    + Rasm
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </>
  )
}

function HtmlForm({ b, set, project }) {
  const [wiz, setWiz] = useState(false)
  const [preview, setPreview] = useState(true)
  const check = b.code ? normalizeCode(b.code) : null
  return (
    <>
      <div className="a-grid2">
        <Field label="Nomi (admin uchun)">
          <Text value={b.title} onChange={set('title')} />
        </Field>
        <div className="a-row end" style={{ alignSelf: 'center' }}>
          <button type="button" className="a-btn primary sm" onClick={() => setWiz(true)}>
            ✦ AI orqali yozish
          </button>
        </div>
      </div>
      <Field label="HTML + CSS kod" hint="Kod izolyatsiyada (iframe) ishlaydi — sayt va admin panelga ta’sir qilmaydi.">
        <Text area rows={8} className="a-input a-code sm" value={b.code} onChange={set('code')} spellCheck={false} />
      </Field>
      {check && (check.errors.length > 0 || check.warnings.length > 0) && (
        <div className="a-check">
          {check.errors.map((e) => (
            <p key={e} className="bad">
              ✕ {e}
            </p>
          ))}
          {check.warnings.map((w) => (
            <p key={w} className="warn">
              ! {w}
            </p>
          ))}
          {check.code !== b.code && (
            <button type="button" className="a-btn sm" onClick={() => set('code')(check.code)}>
              Avtomatik tuzatish
            </button>
          )}
        </div>
      )}
      {b.code && <ImageLinker code={b.code} onChange={set('code')} />}
      {b.code && (
        <>
          <button type="button" className="a-btn ghost sm" onClick={() => setPreview((v) => !v)}>
            {preview ? 'Ko‘rinishni yashirish' : 'Ko‘rinishni ochish'}
          </button>
          {preview && (
            <div className="a-ai-stage desktop">
              <HtmlFrame code={check && !check.errors.length ? check.code : b.code} color={project?.color} preview />
            </div>
          )}
        </>
      )}
      <AiWizard
        open={wiz}
        onClose={() => setWiz(false)}
        project={project}
        lockMode
        defaultMode="section"
        initialCode={b.code}
        onApply={(code) => set('code')(code)}
      />
    </>
  )
}

function TabsForm({ b, set, project }) {
  const tabs = b.tabs || []
  const [cur, setCur] = useState(0)
  const confirm = useConfirm()
  const i = Math.min(cur, tabs.length - 1)
  const setTabs = set('tabs')
  const upd = (k, patch) => setTabs(tabs.map((t, n) => (n === k ? { ...t, ...patch } : t)))
  return (
    <>
      <Field label="Sarlavha (ixtiyoriy)">
        <Text value={b.title} onChange={set('title')} />
      </Field>
      <div className="a-tabs-edit">
        <div className="a-tabs-bar">
          {tabs.map((t, k) => (
            <button key={t.id || k} type="button" className={k === i ? 'on' : ''} onClick={() => setCur(k)}>
              {t.label || 'Nomsiz'}
              <em>{(t.blocks || []).length}</em>
            </button>
          ))}
          <button
            type="button"
            className="add"
            onClick={() => {
              setTabs([...tabs, { id: uid(), label: 'Yangi tab', blocks: [] }])
              setCur(tabs.length)
            }}
          >
            + Tab
          </button>
        </div>
        {tabs[i] && (
          <div className="a-tab-panel">
            <div className="a-row">
              <input className="a-input" value={tabs[i].label} onChange={(e) => upd(i, { label: e.target.value })} placeholder="Tab nomi" />
              <button type="button" className="a-icon" disabled={i === 0} onClick={() => (setTabs(move(tabs, i, i - 1)), setCur(i - 1))} title="Chapga">
                ←
              </button>
              <button
                type="button"
                className="a-icon"
                disabled={i === tabs.length - 1}
                onClick={() => (setTabs(move(tabs, i, i + 1)), setCur(i + 1))}
                title="O‘ngga"
              >
                →
              </button>
              <button
                type="button"
                className="a-icon danger"
                title="Tabni o‘chirish"
                onClick={async () => {
                  if (await confirm(`“${tabs[i].label}” tabi va ichidagi bloklar o‘chirilsinmi?`)) {
                    setTabs(tabs.filter((_, k) => k !== i))
                    setCur(Math.max(0, i - 1))
                  }
                }}
              >
                ×
              </button>
            </div>
            <BlockList blocks={tabs[i].blocks || []} onChange={(bl) => upd(i, { blocks: bl })} allowTabs={false} project={project} />
          </div>
        )}
      </div>
    </>
  )
}

function summary(b) {
  const s =
    b.title ||
    b.text ||
    b.lead ||
    (b.type === 'images' && `${(b.items || []).filter((x) => x.src).length} ta rasm`) ||
    (b.type === 'stats' && (b.items || []).map((x) => x[0]).join(' · ')) ||
    (b.type === 'tabs' && (b.tabs || []).map((t) => t.label).join(' · ')) ||
    (b.type === 'cards' && `${(b.items || []).length} ta karta`) ||
    b.url ||
    ''
  return String(s).slice(0, 90)
}

function Thumbs({ b }) {
  const srcs = b.type === 'images' ? (b.items || []).map((x) => x.src).filter(Boolean) : b.type === 'cards' ? (b.items || []).map((x) => x.image).filter(Boolean) : []
  if (!srcs.length) return null
  return (
    <span className="a-blk-thumbs">
      {srcs.slice(0, 3).map((s, i) => (
        <img key={i} src={s} alt="" />
      ))}
    </span>
  )
}

export default function BlockList({ blocks, onChange, allowTabs = true, project }) {
  const [open, setOpen] = useState(() => new Set())
  const [palette, setPalette] = useState(null) // qo'shiladigan joy indeksi
  const [over, setOver] = useState(null)
  const drag = useRef(null)
  const confirm = useConfirm()

  const toggle = (id) => setOpen((s) => {
    const n = new Set(s)
    n.has(id) ? n.delete(id) : n.add(id)
    return n
  })
  const insert = (at, type) => {
    const b = newBlock(type)
    const next = [...blocks]
    next.splice(at, 0, b)
    onChange(next)
    setOpen((s) => new Set(s).add(b.id))
    setPalette(null)
  }
  const setBlock = (i) => (k) => (v) =>
    onChange(blocks.map((x, n) => (n === i ? (k === '__all' ? { ...x, ...v } : { ...x, [k]: v }) : x)))

  return (
    <div className={'a-blocks' + (allowTabs ? '' : ' nested')}>
      {blocks.length === 0 && palette === null && <p className="a-hint">Hali blok yo‘q.</p>}
      {blocks.map((b, i) => {
        const t = BLOCK_TYPES[b.type] || { label: b.type }
        const isOpen = open.has(b.id)
        return (
          <div key={b.id}>
            {palette === i && <Palette allowTabs={allowTabs} onPick={(k) => insert(i, k)} onClose={() => setPalette(null)} />}
            <div
              className={'a-blk' + (isOpen ? ' open' : '') + (over === i ? ' over' : '')}
              onDragOver={(e) => {
                if (drag.current === null) return
                e.preventDefault()
                e.stopPropagation()
                setOver(i)
              }}
              onDragLeave={() => setOver(null)}
              onDrop={(e) => {
                e.stopPropagation()
                const from = drag.current
                drag.current = null
                setOver(null)
                if (from !== null && from !== i) onChange(move(blocks, from, i))
              }}
            >
              <div className="a-blk-head">
                <span
                  className="a-grip"
                  draggable
                  onDragStart={(e) => {
                    e.stopPropagation()
                    drag.current = i
                  }}
                  onDragEnd={() => (drag.current = null)}
                  title="Sudrab tartiblang"
                >
                  ⋮⋮
                </span>
                <button type="button" className="a-blk-title" onClick={() => toggle(b.id)}>
                  <b>{t.label}</b>
                  <span>{summary(b)}</span>
                  <Thumbs b={b} />
                </button>
                <span className="a-row">
                  <button type="button" className="a-icon" title="Ustiga blok qo‘shish" onClick={() => setPalette(i)}>
                    +
                  </button>
                  <button type="button" className="a-icon" disabled={i === 0} onClick={() => onChange(move(blocks, i, i - 1))} title="Yuqoriga">
                    ↑
                  </button>
                  <button type="button" className="a-icon" disabled={i === blocks.length - 1} onClick={() => onChange(move(blocks, i, i + 1))} title="Pastga">
                    ↓
                  </button>
                  <button
                    type="button"
                    className="a-icon"
                    title="Nusxa"
                    onClick={() => {
                      const copy = JSON.parse(JSON.stringify(b))
                      copy.id = uid()
                      if (copy.tabs) copy.tabs.forEach((tb) => ((tb.id = uid()), (tb.blocks || []).forEach((x) => (x.id = uid()))))
                      const next = [...blocks]
                      next.splice(i + 1, 0, copy)
                      onChange(next)
                    }}
                  >
                    ⧉
                  </button>
                  <button
                    type="button"
                    className="a-icon danger"
                    title="O‘chirish"
                    onClick={async () => {
                      if (await confirm(`“${t.label}” bloki o‘chirilsinmi?`)) onChange(blocks.filter((_, n) => n !== i))
                    }}
                  >
                    ×
                  </button>
                  <button type="button" className="a-icon" onClick={() => toggle(b.id)} title={isOpen ? 'Yig‘ish' : 'Ochish'}>
                    {isOpen ? '▴' : '▾'}
                  </button>
                </span>
              </div>
              {isOpen && (
                <div className="a-blk-body">
                  <BlockForm b={b} set={setBlock(i)} project={project} />
                </div>
              )}
            </div>
          </div>
        )
      })}
      {palette === blocks.length ? (
        <Palette allowTabs={allowTabs} onPick={(k) => insert(blocks.length, k)} onClose={blocks.length ? () => setPalette(null) : null} />
      ) : (
        <button type="button" className="a-add-blk" onClick={() => setPalette(blocks.length)}>
          + Blok qo‘shish
        </button>
      )}
    </div>
  )
}
