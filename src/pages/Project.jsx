import { Link, Navigate, useParams } from 'react-router-dom'
import Cover from '../components/Cover'
import Blocks from '../components/Blocks'
import { Footer } from '../components/Layout'
import { useContent } from '../data/content'
import { blocksOf } from '../data/blocks'

export default function Project() {
  const { slug } = useParams()
  const { projects } = useContent()
  const i = projects.findIndex((p) => p.slug === slug)
  if (i < 0) return <Navigate to="/work" replace />
  const p = projects[i]
  const prev = projects[(i - 1 + projects.length) % projects.length]
  const next = projects[(i + 1) % projects.length]

  return (
    <>
      <main className="page proj" key={slug}>
        <section className="proj-head">
          <h1 className="proj-title fade-up">{p.name}</h1>
          <p className="proj-tag fade-up" style={{ animationDelay: '.1s' }}>
            {p.tagline}
          </p>
        </section>

        <Blocks blocks={blocksOf(p)} p={p} />

        {projects.length > 1 && (
          <section className="proj-nav">
            <Link to={'/work/' + prev.slug} className="pn">
              <div className="pn-img">
                <Cover p={prev} />
              </div>
              <span className="mono muted">← Oldingi loyiha</span>
              <h3>{prev.name}</h3>
            </Link>
            <Link to={'/work/' + next.slug} className="pn">
              <div className="pn-img">
                <Cover p={next} />
              </div>
              <span className="mono muted">Keyingi loyiha →</span>
              <h3>{next.name}</h3>
            </Link>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}
