import { useEffect, useMemo, useState } from 'react'
import HtmlFrame from '../components/HtmlFrame'
import { buildPrompt, normalizeCode } from '../data/aiKit'
import { Field, MediaPicker, Text, useConfirm, useToast } from './ui'
import ImageLinker from './ImageLinker'

// AI orqali yozish ustasi:
// 1) promt (loyiha ma'lumotlari + dizayn tizimi + qoidalar + rasm manzillari) — nusxalab istalgan AI'ga yuboriladi
// 2) AI qaytargan kod joylanadi → avtomatik tekshiriladi/tozalanadi → kompyuter va telefon ko'rinishida tekshiriladi
export default function AiWizard({ open, onClose, project, defaultMode = 'section', lockMode = false, initialCode = '', onApply }) {
  const [step, setStep] = useState(initialCode ? 'code' : 'prompt')
  const [mode, setMode] = useState(defaultMode)
  const [images, setImages] = useState([])
  const [notes, setNotes] = useState('')
  const [pick, setPick] = useState(false)
  const [raw, setRaw] = useState(initialCode)
  const [view, setView] = useState('desktop')
  const toast = useToast()
  const confirm = useConfirm()

  useEffect(() => {
    if (open) {
      setStep(initialCode ? 'code' : 'prompt')
      setRaw(initialCode)
      setMode(defaultMode)
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const prompt = useMemo(() => buildPrompt({ project, mode, images, notes }), [project, mode, images, notes])
  const check = useMemo(() => (raw.trim() ? normalizeCode(raw) : null), [raw])
  if (!open) return null

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      toast('Promt nusxalandi')
    } catch {
      toast('Nusxalab bo‘lmadi — matnni qo‘lda belgilang', 'err')
    }
  }
  const readFiles = async (files) => {
    let out = raw
    for (const f of files) {
      const text = await f.text()
      out += (out ? '\n' : '') + (/\.css$/i.test(f.name) ? `<style>\n${text}\n</style>` : text)
    }
    setRaw(out)
  }
  const apply = async (how) => {
    if (!check || check.errors.length) return
    if (how === 'replace' && !(await confirm('Sahifadagi barcha bloklar shu kod bilan almashtirilsinmi?', { ok: 'Almashtirish' }))) return
    onApply(check.code, how)
    onClose()
  }

  return (
    <div className="a-modal-bg">
      <div className="a-modal a-ai" role="dialog" aria-modal="true">
        <div className="a-ai-head">
          <div>
            <h3>✦ AI orqali yozish</h3>
            <p className="a-hint">Promtni nusxalang → istalgan AI’ga (ChatGPT, Claude, Gemini…) rasmlar bilan yuboring → qaytgan kodni shu yerga joylang.</p>
          </div>
          <button className="a-icon" onClick={onClose} aria-label="Yopish">
            ×
          </button>
        </div>
        <div className="a-seg">
          <button className={step === 'prompt' ? 'on' : ''} onClick={() => setStep('prompt')}>
            1 · Promt
          </button>
          <button className={step === 'code' ? 'on' : ''} onClick={() => setStep('code')}>
            2 · Kodni joylash va ko‘rish
          </button>
        </div>

        {step === 'prompt' ? (
          <div className="a-ai-body">
            <div className="a-ai-side">
              {!lockMode && (
                <Field label="Nima yozdiramiz?">
                  <div className="a-seg">
                    <button className={mode === 'section' ? 'on' : ''} onClick={() => setMode('section')}>
                      Bitta bo‘lim
                    </button>
                    <button className={mode === 'page' ? 'on' : ''} onClick={() => setMode('page')}>
                      Butun sahifa
                    </button>
                  </div>
                </Field>
              )}
              <Field label="Rasmlar" hint="Avval Media’ga yuklang. AI kodda aynan shu manzillarni ishlatadi. Rasmlarning o‘zini ham AI’ga biriktiring.">
                <div className="a-ai-imgs">
                  {images.map((im, i) => (
                    <div key={im.url} className="a-ai-img">
                      <img src={im.url} alt="" />
                      <div>
                        <span className="a-mono">IMG_{i + 1}</span>
                        <input
                          className="a-input"
                          placeholder="Bu rasmda nima bor?"
                          value={im.note}
                          onChange={(e) => setImages(images.map((x, k) => (k === i ? { ...x, note: e.target.value } : x)))}
                        />
                      </div>
                      <button className="a-icon" onClick={() => setImages(images.filter((_, k) => k !== i))} aria-label="Olib tashlash">
                        ×
                      </button>
                    </div>
                  ))}
                  <button className="a-btn ghost sm" onClick={() => setPick(true)}>
                    + Rasm tanlash
                  </button>
                </div>
              </Field>
              <Field label="Qo‘shimcha talablar" hint="Masalan: 3 ta modulni kartalarda ko‘rsat, oxirida “ilgari/endi” jadvali bo‘lsin">
                <Text area rows={5} value={notes} onChange={setNotes} />
              </Field>
            </div>
            <div className="a-ai-prompt">
              <div className="a-row between">
                <span className="a-label">Tayyor promt · {Math.round(prompt.length / 100) / 10}k belgi</span>
                <button className="a-btn primary sm" onClick={copy}>
                  Promtni nusxalash
                </button>
              </div>
              <textarea className="a-input a-code wrap" readOnly value={prompt} onFocus={(e) => e.target.select()} />
              <div className="a-row end">
                <button className="a-btn sm" onClick={() => setStep('code')}>
                  Kod tayyor → 2-qadam
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="a-ai-body code">
            <div className="a-ai-side">
              <div className="a-row between">
                <span className="a-label">AI qaytargan kod</span>
                <label className="a-btn ghost sm">
                  .html / .css fayl
                  <input type="file" accept=".html,.htm,.css,.txt" multiple hidden onChange={(e) => readFiles([...e.target.files])} />
                </label>
              </div>
              <textarea
                className="a-input a-code"
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                placeholder={'```html\n<style>\n  .x-hero { … }\n</style>\n<section class="g-section x-hero">…</section>\n```'}
                spellCheck={false}
              />
              {check && (
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
                  {!check.errors.length && <p className="ok">✓ Kod tekshiruvdan o‘tdi{check.warnings.length ? ' (ogohlantirishlar bilan)' : ''}</p>}
                </div>
              )}
              <ImageLinker code={raw} onChange={setRaw} />
            </div>
            <div className="a-ai-preview">
              <div className="a-row between">
                <span className="a-label">Saytdagi ko‘rinishi</span>
                <div className="a-seg">
                  <button className={view === 'desktop' ? 'on' : ''} onClick={() => setView('desktop')}>
                    Kompyuter
                  </button>
                  <button className={view === 'mobile' ? 'on' : ''} onClick={() => setView('mobile')}>
                    Telefon
                  </button>
                </div>
              </div>
              <div className={'a-ai-stage ' + view}>
                {check && !check.errors.length ? (
                  <HtmlFrame code={check.code} color={project?.color} width={view === 'mobile' ? 390 : '100%'} preview />
                ) : (
                  <p className="a-hint">Kod joylanganda shu yerda ko‘rinadi.</p>
                )}
              </div>
              <div className="a-row end wrap">
                {mode === 'page' ? (
                  <>
                    <button className="a-btn" disabled={!check || check.errors.length > 0} onClick={() => apply('append')}>
                      Oxiriga qo‘shish
                    </button>
                    <button className="a-btn primary" disabled={!check || check.errors.length > 0} onClick={() => apply('replace')}>
                      Butun sahifani almashtirish
                    </button>
                  </>
                ) : (
                  <button className="a-btn primary" disabled={!check || check.errors.length > 0} onClick={() => apply('append')}>
                    {initialCode ? 'Kodni yangilash' : 'Blok sifatida qo‘shish'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        <MediaPicker
          open={pick}
          onClose={() => setPick(false)}
          multiple
          onPick={(urls) => setImages((cur) => [...cur, ...[].concat(urls).filter((u) => !cur.some((c) => c.url === u)).map((url) => ({ url, note: '' }))])}
        />
      </div>
    </div>
  )
}
