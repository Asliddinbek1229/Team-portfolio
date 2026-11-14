import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Cover from '../components/Cover'
import PixelImage from '../components/PixelImage'
import { Footer } from '../components/Layout'
import { categoriesOf } from '../data/projects'
import { useContent } from '../data/content'

function Toggle({ on, children, onClick }) {
  return (
    <button className={'tog' + (on ? ' on' : '')} onClick={onClick}>
      <span className="tb">[</span>
      {children}
      <span className="tb">]</span>
    </button>
  )
}

export default function Work() {
  const { projects, settings } = useContent()
  const categories = useMemo(() => categoriesOf(projects), [projects])
  const [params, setParams] = useSearchParams()
  const view = params.get('view') === 'list' ? 'list' : 'grid'
  const [cat, setCat] = useState('Barchasi')
  const [hover, setHover] = useState(null)
  const list = cat === 'Barchasi' ? projects : projects.filter((p) => p.category === cat)
  const years = projects.map((p) => p.year)
  const covers = useMemo(() => projects.map((p) => p.cover), [projects])
  useEffect(() => {
    document.body.classList.add('plain')
    return () => document.body.classList.remove('plain')
  }, [])
  const setView = (v) => setParams(v === 'list' ? { view: 'list' } : {}, { replace: true })

  return (
    <>
      <main className="page work-page">
        <section className="page-head">
          <h1 className="page-title">
            Loyihalar<sup className="mono">({String(projects.length).padStart(2, '0')})</sup>
          </h1>
          <p className="page-sub">
            {settings.workIntro || 'Tizimlar, saytlar va botlar'}, {Math.min(...years)}–{Math.max(...years)}.
          </p>
        </section>

        <div className="filters mono">
          <div className="filters-cats">
            {categories.map((c) => (
              <Toggle key={c} on={c === cat} onClick={() => setCat(c)}>
                {c}
              </Toggle>
            ))}
          </div>
          <div className="filters-view">
            <Toggle on={view === 'grid'} onClick={() => setView('grid')}>
              Grid
            </Toggle>
            <Toggle on={view === 'list'} onClick={() => setView('list')}>
              List
            </Toggle>
          </div>
        </div>

        {view === 'grid' ? (
          <div className="work-grid">
            {list.map((p) => (
              <Link key={p.slug} to={'/work/' + p.slug} className="work-card">
                <div className="work-meta mono">
                  <span>
                    <em>{p.num}</em> {p.name}
                  </span>
                  <span className="muted">{p.year}</span>
                </div>
                <div className="work-img">
                  <Cover p={p} />
                </div>
                <div className="work-cat mono">{p.category}</div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="work-list" onMouseLeave={() => setHover(null)}>
            <div className="wl-head mono">
              <span>Loyiha</span>
              <span>Yo‘nalish</span>
              <span>Joy</span>
              <span>Yil</span>
            </div>
            {list.map((p) => (
              <Link key={p.slug} to={'/work/' + p.slug} className="wl-row" onMouseEnter={() => setHover(p)}>
                <span className="wl-name">
                  {p.name}
                  {hover?.slug === p.slug && (
                    <span className="wl-preview">
                      <PixelImage src={p.cover} steps={[40, 24, 14, 8, 4, 0]} preload={covers} />
                    </span>
                  )}
                </span>
                <span className="mono">{p.category}</span>
                <span className="mono">{p.location}</span>
                <span className="mono">{p.year}</span>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
