import { useEffect, useMemo, useRef, useState } from 'react'
import PixelImage from '../components/PixelImage'
import Slider from '../components/Slider'
import { Bracket, Footer } from '../components/Layout'
import { useContent } from '../data/content'

export function useReveal(dep) {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal:not(.in)')
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        }),
      { threshold: 0.2 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [dep])
}

const services = [
  ['Boshqaruv tizimlari', 'Rektorat paneli · Hisobotlar · HEMIS integratsiya'],
  ['Veb-saytlar', 'Dizayn · Dasturlash · CMS · Ishga tushirish'],
  ['Telegram botlar', 'Murojaat · Xabarnoma · HEMIS login'],
  ['Davomat va xavfsizlik', 'FaceID turniket · Kamera · Tungi nazorat'],
  ['Mobil va PWA', 'Oflayn ishlash · Push · Telefon interfeysi'],
  ['Qo‘llab-quvvatlash', 'Oylik xizmat · Yangi modullar va hisobotlar'],
]

export default function Studio() {
  useReveal()
  const { projects, team, settings: s } = useContent()
  const [svc, setSvc] = useState(0)
  const teamRef = useRef(null)
  const covers = useMemo(() => projects.map((p) => p.cover).filter(Boolean), [projects])

  return (
    <>
      <main className="page studio">
        <section className="st-hero">
          <p className="eyebrow mono fade-up">{s.studioEyebrow}</p>
          <h1 className="st-title fade-up" style={{ animationDelay: '.08s' }}>
            <span className="grad">{s.studioTitle}</span>
          </h1>
          <div className="st-cols fade-up" style={{ animationDelay: '.16s' }}>
            <p>{s.studioLead}</p>
            <p className="muted">{s.studioText}</p>
          </div>
        </section>

        <section className="logos" aria-label="Loyihalar">
          <div className="logos-track">
            {[1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8].map((n, i) => (
              <img key={i} src={`/img/logo${n}.png`} alt="" />
            ))}
          </div>
        </section>

        <section className="principles">
          <div className="reveal">
            <h3>Dizayn va kod bir xonada</h3>
            <p>Sahifani chizgan odam uni yozadigan odam bilan yonma-yon o‘tiradi. Hech narsa yo‘qolmaydi.</p>
          </div>
          <div className="reveal" style={{ marginTop: 52, transitionDelay: '.1s' }}>
            <h3>Haqiqiy tizimni erta ko‘rsatamiz</h3>
            <p>Uchinchi haftadan siz rasm emas, brauzerdagi ishlayotgan tizimni ko‘rasiz.</p>
          </div>
          <div className="reveal" style={{ marginTop: 104, transitionDelay: '.2s' }}>
            <h3>Hammasi universitetda qoladi</h3>
            <p>Kod, server va bilim — barchasi universitetniki. Tashqi bog‘liqlik yo‘q.</p>
          </div>
        </section>

        <section className="team">
          <h2 className="big-h reveal">Birinchi uchrashuvdagi odamlar.</h2>
          <div className="team-track" ref={teamRef}>
            {team.map((m) => (
              <div className="member" key={m.id}>
                {m.photo && <img src={m.photo} alt="" draggable={false} />}
                <div className="member-txt">
                  <h4>{m.name}</h4>
                  <span className="mono">{m.role}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="team-slider">
            <Slider targetRef={teamRef} />
          </div>
        </section>

        <section className="services">
          <div className="svc-left">
            <span className="mono muted svc-label">Xizmatlar</span>
            {services.map(([t, d], i) => (
              <div key={t} className={'svc-row' + (i === svc ? ' on' : '')} onPointerOver={() => setSvc(i)}>
                <h3>{t}</h3>
                <span className="mono">{d}</span>
              </div>
            ))}
          </div>
          <div className="svc-img">
            {covers.length > 0 && <PixelImage src={covers[svc % covers.length]} preload={covers} />}
          </div>
        </section>

        <section className="plans">
          <div className="plan main">
            <h3>Loyiha</h3>
            <div>
              <h4>3 oydan 6 oygacha</h4>
              <p>Tizim, sayt va integratsiya birgalikda.</p>
            </div>
          </div>
          <div className="plan">
            <h3>Sprint</h3>
            <p className="muted">Ikki hafta, bitta aniq vazifa: yangi modul, hisobot yoki bot. Muddat oldindan kelishiladi.</p>
          </div>
          <div className="plan">
            <h3>Xizmat</h3>
            <p className="muted">Har oy belgilangan kunlar — dizayn va dasturlash kerak bo‘lgan bo‘limlar uchun.</p>
          </div>
        </section>

        <section className="yours">
          <h2 className="big-h">Biz yaratgan narsa — universitetniki.</h2>
          <ul>
            <li>Barcha tizimlarning manba kodi</li>
            <li>Universitet serverida ishlovchi tizim</li>
            <li>Xodimlar ochadigan qo‘llanmalar</li>
            <li>Avtomatik testlar va zaxira nusxalar</li>
            <li>Tizimni boshqarish bo‘yicha video darslar</li>
            <li>HEMIS bilan to‘liq integratsiya</li>
          </ul>
        </section>

        <section className="quote">
          <div>
            <blockquote>{s.quote}</blockquote>
            <span className="mono muted">{s.quoteAuthor}</span>
          </div>
          <aside>
            <span className="mono muted">Bo‘sh o‘rinlar</span>
            {(s.openRoles || []).map((r) => (
              <p key={r}>{r}</p>
            ))}
            <div className="quote-btn">
              <Bracket to="/contact" solid caret={false}>
                Rezyume yuborish
              </Bracket>
            </div>
          </aside>
        </section>
      </main>
      <Footer />
    </>
  )
}
