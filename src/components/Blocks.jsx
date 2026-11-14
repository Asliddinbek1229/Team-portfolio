import { Fragment, useState } from 'react'
import Cover from './Cover'
import HtmlFrame from './HtmlFrame'
import SlideDeck from './SlideDeck'

// Oddiy formatlash: bo'sh qator — yangi paragraf, "- " bilan boshlangan qatorlar — ro'yxat,
// **qalin** matn. HTML ishlatilmaydi (xavfsiz).
function inline(s) {
  return String(s)
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part, i) => (part.startsWith('**') && part.endsWith('**') ? <b key={i}>{part.slice(2, -2)}</b> : <Fragment key={i}>{part}</Fragment>))
}
export function RichText({ text, className = '' }) {
  if (!text) return null
  const paras = String(text).trim().split(/\n\s*\n/)
  return (
    <div className={'rt ' + className}>
      {paras.map((p, i) => {
        const lines = p.split('\n')
        if (lines.every((l) => /^\s*[-•]\s+/.test(l)))
          return (
            <ul key={i}>
              {lines.map((l, k) => (
                <li key={k}>{inline(l.replace(/^\s*[-•]\s+/, ''))}</li>
              ))}
            </ul>
          )
        return (
          <p key={i}>
            {lines.map((l, k) => (
              <Fragment key={k}>
                {k > 0 && <br />}
                {inline(l)}
              </Fragment>
            ))}
          </p>
        )
      })}
    </div>
  )
}

const Title = ({ children }) => (children ? <h6 className="blk-title mono">{children}</h6> : null)

function ImagesBlock({ b, p }) {
  const items = (b.items || []).filter((x) => x && x.src !== undefined)
  if (!items.length) return null
  return (
    <section className={'blk blk-images ' + (b.layout || 'full')}>
      {items.map((it, i) => (
        <figure key={i}>
          <Cover p={p} src={it.src} className="pic" />
          {it.caption && <figcaption className="mono">{it.caption}</figcaption>}
        </figure>
      ))}
    </section>
  )
}

function TabsBlock({ b, p }) {
  const tabs = b.tabs || []
  const [i, setI] = useState(0)
  const cur = tabs[Math.min(i, tabs.length - 1)]
  if (!cur) return null
  return (
    <section className="blk blk-tabs">
      <div className="blk-tabs-head">
        {b.title && <h2 className="blk-h2">{b.title}</h2>}
        <div className="blk-tabs-nav mono" role="tablist">
          {tabs.map((t, k) => (
            <button key={t.id || k} role="tab" aria-selected={k === i} className={'tog' + (k === i ? ' on' : '')} onClick={() => setI(k)}>
              <span className="tb">[</span>
              {t.label}
              <span className="tb">]</span>
            </button>
          ))}
        </div>
      </div>
      <div className="blk-tabs-body" key={cur.id || i}>
        <Blocks blocks={cur.blocks || []} p={p} nested />
      </div>
    </section>
  )
}

function videoSrc(url) {
  const yt = /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/.exec(url || '')
  if (yt) return { kind: 'yt', src: `https://www.youtube-nocookie.com/embed/${yt[1]}` }
  return url ? { kind: 'file', src: url } : null
}

export function Block({ b, p }) {
  switch (b.type) {
    case 'text':
      return (
        <section className={'blk blk-text ' + (b.layout || 'split')}>
          <div>
            <Title>{b.kicker}</Title>
            {b.title && <h2 className="blk-h2">{b.title}</h2>}
          </div>
          <div className="proj-story">
            {b.lead && <RichText className="lead" text={b.lead} />}
            <RichText text={b.body} />
          </div>
        </section>
      )
    case 'info':
      return (
        <section className="blk proj-info">
          <dl className="proj-meta">
            {(b.rows || []).map(([k, v], i) => (
              <div key={i}>
                <dt className="mono">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <div className="proj-story">
            {b.lead && <RichText className="lead" text={b.lead} />}
            <RichText text={b.body} />
          </div>
        </section>
      )
    case 'images':
      return <ImagesBlock b={b} p={p} />
    case 'cards':
      return (
        <section className="blk blk-cards">
          {b.title && <h2 className="blk-h2">{b.title}</h2>}
          <div className="blk-cards-grid" style={{ '--cols': b.columns || 3 }}>
            {(b.items || []).map((c, i) => (
              <article key={i} className="blk-card">
                {c.image && (
                  <div className="blk-card-img">
                    <img src={c.image} alt="" loading="lazy" />
                  </div>
                )}
                <div className="blk-card-body">
                  {c.tag && <span className="mono muted">{c.tag}</span>}
                  <h3>{c.title}</h3>
                  <RichText text={c.text} />
                </div>
              </article>
            ))}
          </div>
        </section>
      )
    case 'tabs':
      return <TabsBlock b={b} p={p} />
    case 'stats':
      return (
        <section className="blk proj-stats" style={{ gridTemplateColumns: `repeat(${Math.min(4, (b.items || []).length) || 1}, 1fr)` }}>
          {(b.items || []).map(([n, l], i) => (
            <div key={i}>
              <b>{n}</b>
              <span className="mono">{l}</span>
            </div>
          ))}
        </section>
      )
    case 'compare':
      return (
        <section className="blk blk-compare">
          {b.title && <h2 className="blk-h2">{b.title}</h2>}
          <div className="blk-compare-grid">
            <span className="mono muted">{b.left || 'Ilgari'}</span>
            <span className="mono">{b.right || 'Endi'}</span>
            {(b.rows || []).map(([a, c], i) => (
              <Fragment key={i}>
                <p className="was">{a}</p>
                <p className="now">{c}</p>
              </Fragment>
            ))}
          </div>
        </section>
      )
    case 'list':
      return (
        <section className="blk proj-extra">
          <div>
            <h6 className="mono muted">{b.title}</h6>
            <p className="kept">
              {(b.items || []).map((k, n) => (
                <span key={n}>
                  {k}
                  {n < b.items.length - 1 && <i>·</i>}
                </span>
              ))}
            </p>
          </div>
          {(b.people || []).length > 0 && (
            <div>
              <h6 className="mono muted">{b.peopleTitle}</h6>
              <ul className="proj-team">
                {b.people.map(([n, r], k) => (
                  <li key={k}>
                    <b>{n}</b>
                    <span className="mono">{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )
    case 'quote':
      return (
        <section className="blk blk-quote">
          <blockquote>{b.text}</blockquote>
          {b.author && <span className="mono muted">{b.author}</span>}
        </section>
      )
    case 'video': {
      const v = videoSrc(b.url)
      if (!v) return null
      return (
        <section className="blk blk-video">
          <div className="blk-video-box">
            {v.kind === 'yt' ? (
              <iframe src={v.src} title={b.caption || 'Video'} allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen />
            ) : (
              <video src={v.src} controls playsInline />
            )}
          </div>
          {b.caption && <p className="mono muted">{b.caption}</p>}
        </section>
      )
    }
    case 'html':
      return b.code ? (
        <section className="blk blk-html">
          <HtmlFrame code={b.code} color={p.color} title={b.title || p.name} />
        </section>
      ) : null
    case 'slides':
      return <SlideDeck title={b.title} slides={b.slides || []} color={b.color || p.color} />
    case 'divider':
      return <hr className={'blk-divider ' + (b.size || 'md') + (b.line ? ' line' : '')} />
    default:
      return null
  }
}

export default function Blocks({ blocks, p, nested }) {
  return (
    <div className={'blocks' + (nested ? ' nested' : '')}>
      {blocks.map((b) => (
        <Block key={b.id} b={b} p={p} />
      ))}
    </div>
  )
}
