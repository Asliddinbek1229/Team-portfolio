import { useEffect } from 'react'
import Strip from '../components/Strip'
import Cube from '../components/Cube'
import Slider from '../components/Slider'
import { useContent } from '../data/content'

export default function Home() {
  const { projects, settings: s } = useContent()
  useEffect(() => {
    document.body.classList.add('no-scroll')
    return () => document.body.classList.remove('no-scroll')
  }, [])

  return (
    <main className="home">
      <Strip items={projects} drift={Number(s.stripDrift ?? 30)} />
      <Cube />
      <div className="home-hero">
        <p className="eyebrow mono fade-up" style={{ animationDelay: '1.1s' }}>
          {s.heroEyebrow}
        </p>
        <h1 className="home-title fade-up" style={{ animationDelay: '1.2s' }}>
          {s.heroTitle} <span className="dim">{s.heroTitleDim}</span>
        </h1>
      </div>
      <div className="home-slider fade-up" style={{ animationDelay: '1.4s' }}>
        <Slider />
      </div>
    </main>
  )
}
