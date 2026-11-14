import { Footer } from '../components/Layout'
import { useContent } from '../data/content'

export default function Insights() {
  const { posts } = useContent()
  return (
    <>
      <main className="page">
        <section className="page-head">
          <h1 className="page-title fade-up">
            Maqolalar<sup className="mono">({String(posts.length).padStart(2, '0')})</sup>
          </h1>
          <p className="page-sub fade-up" style={{ animationDelay: '.1s' }}>
            Universitet IT jamoa tanlashdan oldin beradigan savollarga to‘g‘ri javoblar.
          </p>
        </section>
        <div className="posts">
          {posts.map((p) => (
            <a
              key={p.id}
              href={p.url || '#'}
              target={p.url ? '_blank' : undefined}
              rel="noreferrer"
              className="post"
              onClick={(e) => !p.url && e.preventDefault()}
            >
              <div className="post-img">{p.image && <img src={p.image} alt="" loading="lazy" />}</div>
              <div className="post-meta mono muted">
                <span>{p.category}</span>
                {p.read && <span>{p.read} o‘qish</span>}
              </div>
              <h3>{p.title}</h3>
              <p>{p.excerpt}</p>
            </a>
          ))}
        </div>
      </main>
      <Footer />
    </>
  )
}
