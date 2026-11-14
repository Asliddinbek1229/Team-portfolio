import { useState } from 'react'
import { Bracket, Footer } from '../components/Layout'
import { useContent } from '../data/content'

export default function Contact() {
  const [sent, setSent] = useState(false)
  const { settings: s } = useContent()
  const ring = 'Telegram orqali yozing · Telegram orqali yozing · '
  return (
    <>
    <main className="page contact">
      <section className="ct-left">
        <p className="eyebrow mono">{s.contactIntro}</p>
        <h1 className="ct-title">
          Nima qurmoqchi
          <br />
          <span className="dim">ekaningizni ayting.</span>
        </h1>
        <div className="ct-bottom">
          <a className="badge" href={s.telegram || '#'} target="_blank" rel="noreferrer" aria-label="Telegram">
            <svg viewBox="0 0 200 200" className="badge-ring">
              <defs>
                <path id="circ" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
              </defs>
              <text>
                <textPath href="#circ">{ring}</textPath>
              </text>
            </svg>
            <svg viewBox="0 0 24 24" className="badge-ico">
              <path
                fill="currentColor"
                d="M21.9 4.3 18.7 19.4c-.2 1-.9 1.3-1.7.8l-4.8-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.9 8.9-8c.4-.3-.1-.5-.6-.2L6.5 13.2 1.8 11.7c-1-.3-1-1 .2-1.5L20.6 3c.9-.3 1.6.2 1.3 1.3Z"
              />
            </svg>
          </a>
          <div className="ct-lines mono">
            {(s.emails || []).map((e) => (
              <a key={e} href={'mailto:' + e}>
                {e}
              </a>
            ))}
            <span>{s.phone}</span>
          </div>
        </div>
      </section>
      <form
        className="ct-form"
        onSubmit={(e) => {
          e.preventDefault()
          setSent(true)
        }}
      >
        <h2>Bizga yozing</h2>
        <input placeholder="To‘liq ismingiz" required />
        <input placeholder="Telefon raqam" />
        <input placeholder="Email" type="email" />
        <textarea placeholder="Talablaringiz haqida qisqacha yozing" rows={6} />
        <div className="ct-send">
          <Bracket solid caret={false} type="submit">
            {sent ? 'Xabar yuborildi' : 'Yuborish'}
          </Bracket>
        </div>
      </form>
    </main>
    <Footer />
    </>
  )
}
