import { useEffect, useMemo, useState } from 'react'
import { Link, useBlocker, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAdmin } from './AdminApp'
import CoverMaker from './CoverMaker'
import BlockList from './BlockEditor'
import AiWizard from './AiWizard'
import { blocksOf, newBlock } from '../data/blocks'
import { ColorInput, Field, ImageField, Text, Toggle, useConfirm, useToast } from './ui'

export default function ProjectEdit() {
  const { id } = useParams()
  const { db, update, remove } = useAdmin()
  const nav = useNavigate()
  const toast = useToast()
  const confirm = useConfirm()
  const raw = db.projects.find((p) => p.id === id)
  // bloklari yo'q eski loyihalar uchun boshlang'ich bloklar shu yerda yasaladi
  const original = useMemo(() => (raw ? { ...raw, blocks: blocksOf(raw) } : null), [raw])
  const [p, setP] = useState(original)
  const [saving, setSaving] = useState(false)
  const [maker, setMaker] = useState(false)
  const [params, setParams] = useSearchParams()
  const [ai, setAi] = useState(params.get('ai') === '1')
  const categories = useMemo(() => [...new Set(db.projects.map((x) => x.category).filter(Boolean))], [db])

  useEffect(() => setP(original), [id, !!original]) // eslint-disable-line react-hooks/exhaustive-deps
  const dirty = JSON.stringify(p) !== JSON.stringify(original)
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && currentLocation.pathname !== nextLocation.pathname)
  useEffect(() => {
    if (blocker.state === 'blocked') confirm('Saqlanmagan o‘zgarishlar bor. Chiqib ketilsinmi?', { ok: 'Chiqish' }).then((ok) => (ok ? blocker.proceed() : blocker.reset()))
  }, [blocker.state]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const warn = (e) => dirty && (e.preventDefault(), (e.returnValue = ''))
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const save = async () => {
    setSaving(true)
    try {
      const saved = await update('projects', p.id, p)
      setP(saved)
      toast('Saqlandi')
    } catch {}
    setSaving(false)
  }
  useEffect(() => {
    const key = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        if (dirty && !saving) save()
      }
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  })

  if (!original || !p) return <div className="a-page">Loyiha topilmadi. <Link to="/admin">Ro‘yxatga qaytish</Link></div>
  const set = (k) => (v) => setP((x) => ({ ...x, [k]: v }))
  const firstImg = (p.blocks || []).find((b) => b.type === 'images')?.items?.find((x) => x.src && x.src !== p.cover)?.src
  const addImageBlock = (url) => {
    const b = newBlock('images')
    b.items = [{ src: url, caption: '' }]
    set('blocks')([...(p.blocks || []), b])
  }

  return (
    <div className="a-page">
      <header className="a-head sticky">
        <div>
          <Link to="/admin" className="a-hint">
            ← Loyihalar
          </Link>
          <h1>{p.name || 'Nomsiz loyiha'}</h1>
        </div>
        <div className="a-row">
          <button className="a-btn" onClick={() => setAi(true)}>
            ✦ AI orqali yozish
          </button>
          <Toggle value={!p.hidden} onChange={(v) => set('hidden')(!v)} label={p.hidden ? 'Yashirin' : 'Saytda ko‘rinadi'} />
          {!original.hidden && (
            <a className="a-btn ghost" href={'/work/' + original.slug} target="_blank" rel="noreferrer">
              Saytda ko‘rish ↗
            </a>
          )}
          <button className="a-btn ghost" disabled={!dirty} onClick={() => setP(original)}>
            Bekor qilish
          </button>
          <button className="a-btn primary" disabled={!dirty || saving} onClick={save}>
            {saving ? 'Saqlanmoqda…' : dirty ? 'Saqlash (Ctrl+S)' : 'Saqlangan'}
          </button>
        </div>
      </header>

      <div className="a-edit">
        <div className="a-edit-form">
          <section className="a-card">
            <h2>Asosiy</h2>
            <div className="a-grid2">
              <Field label="Nomi">
                <Text value={p.name} onChange={set('name')} />
              </Field>
              <Field label="URL (slug)" hint={'Sayt manzili: /work/' + (p.slug || '…')}>
                <Text value={p.slug} onChange={set('slug')} className="a-input mono" />
              </Field>
              <Field label="Yil">
                <Text type="number" value={p.year} onChange={(v) => set('year')(Number(v) || '')} />
              </Field>
              <Field label="Yo‘nalish (kategoriya)" hint="Loyihalar sahifasidagi filtr">
                <Text value={p.category} onChange={set('category')} list="a-cats" />
                <datalist id="a-cats">
                  {categories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </Field>
              <Field label="Asosiy rang" hint="Fon, hover’dagi bo‘yoq va bo‘sh rasm o‘rni">
                <ColorInput value={p.color} onChange={set('color')} />
              </Field>
              <Field label="Sayt / manzil">
                <Text value={p.site} onChange={set('site')} placeholder="lms.namsu.uz" />
              </Field>
            </div>
            <Field label="Qisqa shior" hint="Sahifa sarlavhasi yonidagi katta matn">
              <Text area rows={2} value={p.tagline} onChange={set('tagline')} />
            </Field>
          </section>

          <section className="a-card">
            <div className="a-row between">
              <h2>Muqova</h2>
              <button type="button" className="a-btn sm" onClick={() => setMaker((v) => !v)}>
                {maker ? 'Generatorni yopish' : '✦ Ekran rasmidan rasm yasash'}
              </button>
            </div>
            {maker && (
              <CoverMaker
                project={p}
                onUse={[
                  ['Muqova qilish', (u) => set('cover')(u)],
                  ['Sahifaga rasm bloki qilib qo‘shish', addImageBlock],
                ]}
              />
            )}
            <div className="a-cover-row">
              <ImageField value={p.cover} onChange={set('cover')} />
              <p className="a-hint">
                Muqova lentada, loyihalar ro‘yxatida va oldingi/keyingi loyiha kartasida ko‘rinadi. Kvadrat (1200×1200) rasm eng
                yaxshi turadi. Generator yasagan rasmni “Sahifaga qo‘shish” tugmasi bilan pastdagi bloklarga ham qo‘shishingiz mumkin.
              </p>
            </div>
          </section>

          <section className="a-card">
            <div className="a-row between">
              <div>
                <h2>Sahifa bloklari</h2>
                <p className="a-hint">
                  Sarlavha va shiordan keyingi hamma narsa — shu bloklar. Qo‘shing, sudrab tartiblang, tablar ichiga istalgan blok joylang.
                </p>
              </div>
              <button
                type="button"
                className="a-btn ghost sm"
                onClick={async () => {
                  if (await confirm('Bloklar boshlang‘ich holatga (eski maydonlardan) qaytarilsinmi?', { ok: 'Qaytarish' }))
                    set('blocks')(blocksOf({ ...p, blocks: undefined }))
                }}
              >
                Boshlang‘ich holat
              </button>
            </div>
            <BlockList blocks={p.blocks || []} onChange={set('blocks')} project={p} />
          </section>

          <section className="a-card danger-zone">
            <h2>Xavfli hudud</h2>
            <button
              className="a-btn danger"
              onClick={async () => {
                if (await confirm(`“${original.name}” o‘chirilsinmi?`)) {
                  await remove('projects', p.id)
                  toast('O‘chirildi')
                  nav('/admin', { replace: true })
                }
              }}
            >
              Loyihani o‘chirish
            </button>
          </section>
        </div>

        <aside className="a-preview">
          <span className="a-label">Lentadagi ko‘rinishi</span>
          <div className="a-pv-card">
            <div className="a-pv-label">
              <span>(00) {(p.name || '').toUpperCase()}</span>
              <span>{p.year}</span>
            </div>
            <div className="a-pv-img" style={{ background: p.color }}>
              {p.cover && <img src={p.cover} alt="" />}
            </div>
          </div>
          <span className="a-label">Loyiha sahifasi boshi</span>
          <div className="a-pv-page">
            <h3>{p.name}</h3>
            <p>{p.tagline}</p>
            <div className="a-pv-duo">
              <div style={{ background: p.color }}>{p.cover && <img src={p.cover} alt="" />}</div>
              <div style={{ background: p.color }}>{firstImg && <img src={firstImg} alt="" />}</div>
            </div>
          </div>
          <span className="a-label">Hover rangi</span>
          <div className="a-pv-tint" style={{ background: `radial-gradient(80% 90% at 50% -10%, ${p.color}, #0b0a0f 70%)` }} />
        </aside>
      </div>
      <AiWizard
        open={ai}
        onClose={() => {
          setAi(false)
          if (params.get('ai')) setParams({}, { replace: true })
        }}
        project={p}
        defaultMode={params.get('ai') === '1' ? 'page' : 'section'}
        onApply={(code, how) => {
          const b = newBlock('html')
          b.code = code
          b.title = how === 'replace' ? 'AI sahifa' : 'AI bo‘limi'
          set('blocks')(how === 'replace' ? [b] : [...(p.blocks || []), b])
          toast('Qo‘shildi — saqlashni unutmang (Ctrl+S)')
        }}
      />
    </div>
  )
}
