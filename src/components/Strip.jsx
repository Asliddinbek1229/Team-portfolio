import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { VERT, FRAG } from './stripShader'
import { bus, smooth, stripGeo, MONO, SCRAMBLE, reducedMotion } from './bus'

// Template'dagi "Work strip" ning to'liq porti: WebGL fragment shader fon + kartalar,
// chetlarda egilish (bend) va RGB ajralish, intro animatsiya, inersiyali scroll/drag,
// hover'da piksel kursor "OPEN" va pastki o'ngda shifrlangan sarlavha.

const UNIFORMS =
  'uRes.uDpr.uAtlas.uGrid.uN.uOffset.uS.uGap.uLabH.uVert.uA0.uC0.uLo.uHi.uStride.uFade.uRad.uShrink.uTime.uIntro.uWob.uE0.uMag.uLift.uVMag.uBendAmt.uCube.uLabel.uTint.uTintAmt.uHover.uHoverT.uSeed'.split(
    '.',
  )
const BEND = { desk: { e0: 0.6, mag: 0.45, lift: 0.42, vmag: 0.36 }, col: { e0: 0.5, mag: 0.45, lift: 0.22, vmag: 0.3 } }

// "CASA ONDINA" -> "CS ONDN"
const squash = (s) =>
  s
    .toUpperCase()
    .split(/\s+/)
    .map((w) => w[0] + w.slice(1).replace(/[AEIOU]/g, ''))
    .join(' ')

export default function Strip({ items, drift = 30, openLabel = 'Ochish' }) {
  const rootRef = useRef(null)
  const canvasRef = useRef(null)
  const titleRef = useRef(null)
  const cursorRef = useRef(null)
  const cursorCanvasRef = useRef(null)
  const navigate = useNavigate()
  const navRef = useRef(navigate)
  navRef.current = navigate

  useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    const title = titleRef.current
    const cur = cursorRef.current
    const curCanvas = cursorCanvasRef.current
    const cctx = curCanvas.getContext('2d')
    const still = reducedMotion()
    let dead = false
    let raf = 0
    const offs = []
    const on = (el, ev, fn, opt) => {
      el.addEventListener(ev, fn, opt)
      offs.push(() => el.removeEventListener(ev, fn, opt))
    }

    // ---- geometriya ----
    let W = 0, H = 0, dpr = 1, S = 0, GAP = 14, CY = 0, LAB = 0, PAD = 24
    let A0 = 0, C0 = 0, LO = 0, HI = 0
    let fade = [-2, -1, 1e6, 1e6 + 1]
    let vert = false
    const bend = { ...BEND.desk }
    let touch = !!window.matchMedia && matchMedia('(hover: none) and (pointer: coarse)').matches
    const V = items
    const N = Math.max(1, V.length)
    const stride = () => (vert ? S + LAB + GAP : S + GAP)

    function layout() {
      W = root.clientWidth
      H = root.clientHeight
      if (!W || !H) return
      dpr = Math.min(2, window.devicePixelRatio || 1)
      vert = W < 810
      PAD = vert ? 16 : 24
      Object.assign(bend, vert ? BEND.col : BEND.desk)
      fade = [-2, -1, 1e6, 1e6 + 1]
      title.style.fontSize = (vert ? Math.max(26, Math.min(40, W * 0.076)) : Math.max(34, Math.min(62, W * 0.042))) + 'px'
      if (vert) {
        GAP = 18
        const top = 90
        const bottom = H - 230
        S = Math.round(Math.max(150, Math.min(W * 0.62, 340, (bottom - top) * 0.5)))
        LAB = (S * 64) / 512
        A0 = Math.round((top + bottom) / 2)
        C0 = Math.round(W / 2)
        LO = top - 30
        HI = bottom + 30
        fade = [top - 24, top + 56, bottom - 80, bottom - 4]
        CY = A0 + LAB / 2
        Object.assign(title.style, {
          left: PAD + 'px', right: 'auto', top: CY + 'px', bottom: 'auto',
          writingMode: 'vertical-rl', transform: 'translateY(-50%) rotate(180deg)', textAlign: 'left',
        })
      } else {
        GAP = 14
        const g = stripGeo(W, H)
        S = g.S
        CY = g.CY
        LAB = (S * 64) / 512
        A0 = W / 2
        C0 = CY
        LO = 0
        HI = W
        Object.assign(title.style, {
          left: 'auto', right: PAD + 'px', top: 'auto', bottom: '58px',
          writingMode: '', transform: '', textAlign: 'right',
        })
      }
      bus.geo = { W, H, S, CY, vert }
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      if (atlasReady && labelSize() !== labelPx) {
        drawLabels()
        upload()
      }
    }

    // ekran nuqtasini "egilmagan" lenta koordinatasiga o'tkazish (shaderdagi bendMap bilan bir xil)
    function bendMap(x, y, amt) {
      const a1 = vert ? y : x
      const b1 = vert ? x : y
      const hw = a1 < A0 ? A0 - LO : HI - A0
      const u = (a1 - A0) / hw
      const a = Math.abs(u)
      const sg = u < 0 ? -1 : 1
      const vy = (b1 - C0) / S
      const e0 = Math.max(0.2, bend.e0 - 0.1 * vy * vy)
      const t = smooth(e0, 1, a) * amt
      const span = Math.max(1 - e0, 0.001)
      const ex = Math.max(a - e0, 0) * amt
      const aq = a - (bend.mag * ex * ex) / (2 * span)
      const cl = C0 - sg * bend.lift * S * t * t
      const ra = A0 + sg * aq * hw
      const rb = C0 + (b1 - cl) / (1 + bend.vmag * t)
      return vert ? [rb, ra] : [ra, rb]
    }

    // ---- atlas: har bir loyiha uchun 512x576 (64px yozuv + 512px rasm) ----
    const cols = Math.ceil(Math.sqrt(N))
    const rows = Math.ceil(N / cols)
    const atlas = document.createElement('canvas')
    atlas.width = cols * 512
    atlas.height = rows * 576
    const actx = atlas.getContext('2d', { willReadFrequently: true })
    const labelSize = () => Math.round(Math.min(28, Math.max(21, 5888 / Math.max(1, S))))
    let labelPx = 0
    let atlasReady = false

    function drawLabels() {
      labelPx = labelSize()
      actx.textBaseline = 'alphabetic'
      V.forEach((it, i) => {
        const x = (i % cols) * 512
        const y = Math.floor(i / cols) * 576
        actx.clearRect(x, y, 512, 64)
        actx.fillStyle = '#fff'
        actx.font = `400 ${labelPx}px ${MONO}`
        if ('letterSpacing' in actx) actx.letterSpacing = '0.6px'
        actx.textAlign = 'right'
        actx.fillText(String(it.year), x + 510, y + 46)
        const room = actx.measureText(String(it.year)).width + 24
        actx.textAlign = 'left'
        let s = `(${it.num}) ${it.name.toUpperCase()}`
        while (actx.measureText(s).width > 512 - room && s.length > 6) s = s.slice(0, -2) + '…'
        actx.fillText(s, x + 2, y + 46)
      })
    }

    function drawImages() {
      return Promise.all(
        V.map(
          (it, i) =>
            new Promise((done) => {
              const x = (i % cols) * 512
              const y = Math.floor(i / cols) * 576 + 64
              actx.fillStyle = '#1c1b21'
              actx.fillRect(x, y, 512, 512)
              if (!it.cover) return done()
              const img = new Image()
              img.crossOrigin = 'anonymous'
              img.onload = () => {
                const k = Math.max(512 / img.naturalWidth, 512 / img.naturalHeight)
                const w = img.naturalWidth * k
                const h = img.naturalHeight * k
                actx.drawImage(img, x + (512 - w) / 2, y + (512 - h) / 2, w, h)
                const g = actx.createLinearGradient(x, y, x + 512, y + 512)
                g.addColorStop(0, 'rgba(255,255,255,.10)')
                g.addColorStop(0.55, 'rgba(255,255,255,0)')
                g.addColorStop(1, 'rgba(0,0,0,.16)')
                actx.fillStyle = g
                actx.fillRect(x, y, 512, 512)
                try {
                  const d = actx.getImageData(x, y, 512, 512)
                  const p = d.data
                  for (let q = 0; q < p.length; q += 4) {
                    const n = (Math.random() - 0.5) * 14
                    p[q] += n
                    p[q + 1] += n
                    p[q + 2] += n
                  }
                  actx.putImageData(d, x, y)
                } catch {}
                done()
              }
              img.onerror = () => done()
              img.src = it.cover
            }),
        ),
      )
    }

    // ---- WebGL ----
    let gl = null
    let tex = null
    const U = {}
    function initGL() {
      try {
        gl = canvas.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false })
      } catch {
        gl = null
      }
      if (!gl) return false
      const sh = (type, src) => {
        const s = gl.createShader(type)
        gl.shaderSource(s, src)
        gl.compileShader(s)
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
          console.error(gl.getShaderInfoLog(s))
          return null
        }
        return s
      }
      const vs = sh(gl.VERTEX_SHADER, VERT)
      const fs = sh(gl.FRAGMENT_SHADER, FRAG)
      if (!vs || !fs) return false
      const prog = gl.createProgram()
      gl.attachShader(prog, vs)
      gl.attachShader(prog, fs)
      gl.linkProgram(prog)
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false
      gl.useProgram(prog)
      const buf = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buf)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
      const loc = gl.getAttribLocation(prog, 'aPos')
      gl.enableVertexAttribArray(loc)
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
      UNIFORMS.forEach((n) => (U[n] = gl.getUniformLocation(prog, n)))
      tex = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([18, 18, 22, 255]))
      return true
    }
    function upload() {
      if (!gl) return
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas)
    }
    on(canvas, 'webglcontextlost', (e) => {
      e.preventDefault()
      gl = null
    })

    // ---- harakat holati ----
    let shown = 0 // ko'rsatilayotgan pozitsiya (silliq)
    let target = 0 // maqsad pozitsiya
    let vel = 0 // inersiya tezligi (px/s)
    let dragVel = 0
    let dragging = false
    let seeking = false
    let travel = 0
    let lastX = 0, lastY = 0, lastT = 0
    let driftMix = 1
    let speedWob = 0
    let shrink = 0
    let prevShown = 0
    let hover = null
    let hoverT = 0
    let seed = 0
    let introStart = 0
    let started = false
    let pointer = null
    let cursorOn = false
    let curX = 0, curY = 0
    const tint = [0.16, 0.23, 1]
    let tintAmt = 0

    bus.seek = (p) => {
      if (p === null) {
        seeking = false
        return
      }
      const total = stride() * N
      const now = ((target % total) + total) % total
      seeking = true
      vel = 0
      dragVel = 0
      target += p * total - now
    }

    const wrap = (k) => ((k % N) + N) % N
    const inBand = (x, y) => {
      const [a, b] = bendMap(x, y, 1)
      return Math.abs((vert ? a : b) - C0) <= S / 2 + (vert ? 12 : LAB + 12)
    }
    function hitTest(x, y, amt) {
      const [a, b] = bendMap(x, y, amt)
      const st = stride()
      const o = (vert ? b : a) - A0 + shown
      const k = Math.round(o / st)
      const c = o - k * st - (vert ? LAB / 2 : 0)
      const sz = S * (1 - 0.07 * shrink)
      return Math.abs(c) <= sz / 2 && Math.abs((vert ? a : b) - C0) <= sz / 2 ? k : null
    }
    function open(k) {
      const it = V[wrap(k)]
      if (it) navRef.current('/work/' + it.slug)
    }

    // pastki o'ngdagi shifrlangan sarlavha
    let titleTimer = 0
    let titleText = ''
    let titleKey = 'none'
    function setTitle(text) {
      clearInterval(titleTimer)
      const from = titleText
      titleText = text
      if (still) {
        title.textContent = text
        return
      }
      let n = 0
      titleTimer = setInterval(() => {
        n++
        const r = n / 9
        const len = Math.round(from.length + (text.length - from.length) * Math.min(1, r * 1.8))
        const done = Math.floor(Math.max(0, (r - 0.3) / 0.7) * text.length)
        let s = ''
        for (let i = 0; i < len; i++) s += text[i] === ' ' ? ' ' : i < done && text[i] ? text[i] : SCRAMBLE[(Math.random() * 41) | 0]
        title.textContent = s
        if (n >= 9) {
          clearInterval(titleTimer)
          title.textContent = text
        }
      }, 75)
    }
    function showTitle(k) {
      const key = k === null ? 'none' : String(wrap(k))
      if (key === titleKey) return
      titleKey = key
      setTitle(k === null ? '' : squash(V[+key]?.name || ''))
    }

    // piksel kursor (11x11 katak, 8px)
    let order = []
    let cursorP = 0
    let drawn = false
    const shuffle = () => {
      order = Array.from({ length: 121 }, (_, i) => i)
      for (let i = order.length - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0
        ;[order[i], order[j]] = [order[j], order[i]]
      }
    }
    shuffle()
    function drawCursor(want, dt) {
      const prev = cursorP
      cursorP = still ? want : want > cursorP ? Math.min(1, cursorP + dt / 0.2) : Math.max(0, cursorP - dt / 0.15)
      if (cursorP === prev && drawn) return
      const r = Math.min(2, window.devicePixelRatio || 1)
      if (curCanvas.width !== 88 * r) curCanvas.width = curCanvas.height = 88 * r
      cctx.setTransform(r, 0, 0, r, 0, 0)
      cctx.clearRect(0, 0, 88, 88)
      cctx.fillStyle = '#F3F3F1'
      const n = Math.round((Math.round(cursorP * 6) / 6) * order.length)
      for (let i = 0; i < n; i++) {
        const c = order[i]
        cctx.fillRect((c % 11) * 8, Math.floor(c / 11) * 8, 8, 8)
      }
      drawn = true
    }

    // ---- kiritish ----
    on(canvas, 'pointerdown', (e) => {
      if (e.button !== 0) return
      const r = root.getBoundingClientRect()
      const mouse = e.pointerType === 'mouse'
      if (mouse && !inBand(e.clientX - r.left, e.clientY - r.top)) return
      if (!mouse) {
        touch = true
        pointer = null
      }
      dragging = true
      travel = 0
      lastX = e.clientX
      lastY = e.clientY
      lastT = performance.now()
      dragVel = 0
      vel = 0
      try {
        canvas.setPointerCapture(e.pointerId)
      } catch {}
      canvas.style.cursor = 'grabbing'
    })
    on(window, 'pointermove', (e) => {
      if (e.pointerType === 'mouse') {
        const r = root.getBoundingClientRect()
        pointer = { x: e.clientX - r.left, y: e.clientY - r.top, onCanvas: e.target === canvas }
        touch = false
      }
      if (!dragging) return
      const now = performance.now()
      const dt = Math.max(8, now - lastT)
      lastT = now
      const dx = e.clientX - lastX
      const dy = e.pointerType !== 'mouse' || vert ? e.clientY - lastY : 0
      lastX = e.clientX
      lastY = e.clientY
      const d = vert ? (Math.abs(dy) >= Math.abs(dx) ? dy : dx) : Math.abs(dx) >= Math.abs(dy) ? dx : dy
      travel += Math.abs(d)
      target -= d
      dragVel = dragVel * 0.6 + (-d / dt) * 1000 * 0.4
    })
    const release = (e) => {
      if (!dragging) return
      dragging = false
      canvas.style.cursor = ''
      vel = performance.now() - lastT < 90 ? Math.max(-5000, Math.min(5000, dragVel)) : 0
      if (travel < 6 && e.type === 'pointerup') {
        const r = root.getBoundingClientRect()
        const k = hitTest(e.clientX - r.left, e.clientY - r.top, 1)
        if (k !== null) open(k)
      }
    }
    on(canvas, 'pointerup', release)
    on(canvas, 'pointercancel', release)
    on(document.documentElement, 'mouseleave', () => (pointer = null))
    on(
      window,
      'wheel',
      (e) => {
        e.preventDefault()
        const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
        vel = Math.max(-6000, Math.min(6000, vel + d * (e.deltaMode === 1 ? 32 : 1) * 5))
      },
      { passive: false },
    )
    on(window, 'keydown', (e) => {
      if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) return
      if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return
      e.preventDefault()
      vel += e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1400 : -1400
    })

    // ---- kadr ----
    let last = performance.now()
    function frame(now) {
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000))
      last = now
      const intro = started ? (now - introStart) / 1000 : 0
      const time = now / 1000
      const f60 = dt * 60
      const auto = still || !started ? 0 : drift * smooth(1.6, 2.8, intro)
      const st = stride()
      const snapDist = () => Math.abs(shown - Math.round(shown / st) * st) / st

      driftMix += ((hover !== null && !touch ? 0 : 1) - driftMix) * (1 - 0.9 ** f60)
      const autoV = touch ? auto * 2.4 * (0.12 + 0.88 * smooth(0, 0.32, snapDist())) : auto * driftMix
      if (!dragging && !seeking) {
        vel *= 0.5 ** (dt / 0.5)
        if (Math.abs(vel) < 1) vel = 0
        target += (autoV + vel) * dt
      }
      shown += (target - shown) * (1 - (dragging || seeking ? 0.55 : 0.35) ** f60)
      const speed = Math.min(1, Math.abs((shown - prevShown) / dt) / 2600)
      prevShown = shown
      shrink += (speed - shrink) * (speed > shrink ? 0.25 : 0.06) * f60
      speedWob += (speed - speedWob) * 0.12 * f60
      bus.pos = shown
      bus.stride = st
      bus.n = N

      const bendAmt = still ? 1 : smooth(0.3, 1.7, intro)
      let h = null
      if (intro > 1.6) {
        if (touch) h = snapDist() < 0.32 ? Math.round(shown / st) : null
        else if (!dragging && pointer && pointer.onCanvas) h = hitTest(pointer.x, pointer.y, bendAmt)
      }
      if (h !== null && h !== hover) {
        seed = Math.random() * 100
        hoverT = 0
      }
      hover = h
      hoverT = h === null ? Math.max(0, hoverT - dt / 0.25) : Math.min(1, hoverT + dt / 0.5)
      if (intro > 1.6 && (h !== null || !touch)) showTitle(h)

      const tc = h === null ? null : V[wrap(h)]?.tint
      tintAmt += ((tc ? 1 : 0) - tintAmt) * 0.04 * f60
      if (tc) for (let i = 0; i < 3; i++) tint[i] += (tc[i] - tint[i]) * 0.08 * f60

      const want = !touch && h !== null && !dragging && !!pointer && pointer.onCanvas
      if (want !== cursorOn) {
        cursorOn = want
        cur.setAttribute('data-show', want ? '1' : '0')
        if (want && cursorP === 0) shuffle()
        if (want && pointer) {
          curX = pointer.x
          curY = pointer.y
        }
      }
      drawCursor(want ? 1 : 0, dt)
      if (!dragging)
        canvas.style.cursor = cursorOn ? 'none' : !touch && pointer && pointer.onCanvas && inBand(pointer.x, pointer.y) ? 'grab' : ''
      if (pointer) {
        const k = still ? 1 : 1 - 0.55 ** f60
        curX += (pointer.x - curX) * k
        curY += (pointer.y - curY) * k
        cur.style.transform = `translate(${curX.toFixed(1)}px,${curY.toFixed(1)}px) translate(-50%,-50%)`
      }

      if (gl) {
        gl.viewport(0, 0, canvas.width, canvas.height)
        gl.uniform2f(U.uRes, W, H)
        gl.uniform1f(U.uDpr, dpr)
        gl.uniform1i(U.uAtlas, 0)
        gl.uniform2f(U.uGrid, cols, rows)
        gl.uniform1f(U.uN, N)
        gl.uniform1f(U.uOffset, shown)
        gl.uniform1f(U.uS, S)
        gl.uniform1f(U.uGap, GAP)
        gl.uniform1f(U.uLabH, LAB)
        gl.uniform1f(U.uRad, 6)
        gl.uniform1f(U.uVert, vert ? 1 : 0)
        gl.uniform1f(U.uA0, A0)
        gl.uniform1f(U.uC0, C0)
        gl.uniform1f(U.uLo, LO)
        gl.uniform1f(U.uHi, HI)
        gl.uniform1f(U.uStride, st)
        gl.uniform4f(U.uFade, fade[0], fade[1], fade[2], fade[3])
        gl.uniform1f(U.uShrink, still ? 0 : shrink)
        gl.uniform1f(U.uTime, still ? 12 : time)
        gl.uniform1f(U.uIntro, still ? 99 : intro)
        gl.uniform1f(U.uWob, still ? 0 : 1.6 + 9 * speedWob)
        gl.uniform1f(U.uE0, bend.e0)
        gl.uniform1f(U.uMag, bend.mag)
        gl.uniform1f(U.uLift, bend.lift * S)
        gl.uniform1f(U.uVMag, bend.vmag)
        gl.uniform1f(U.uBendAmt, bendAmt)
        gl.uniform3f(U.uCube, 0.95, 0.95, 0.94)
        gl.uniform3f(U.uLabel, 0.86, 0.86, 0.85)
        gl.uniform3fv(U.uTint, tint)
        gl.uniform1f(U.uTintAmt, tintAmt)
        gl.uniform1f(U.uHover, h === null ? -1e4 : h)
        gl.uniform1f(U.uHoverT, hoverT)
        gl.uniform1f(U.uSeed, seed)
        gl.drawArrays(gl.TRIANGLES, 0, 3)
      }
    }
    const loop = (t) => {
      if (dead) return
      frame(t)
      raf = requestAnimationFrame(loop)
    }

    initGL()
    layout()
    raf = requestAnimationFrame(loop)
    ;(async () => {
      try {
        await document.fonts.load(`400 24px 'Geist Mono'`)
      } catch {}
      await drawImages()
      if (dead) return
      layout()
      drawLabels()
      upload()
      atlasReady = true
      started = true
      introStart = performance.now() + (still ? -99000 : 350)
    })()

    const ro = new ResizeObserver(() => layout())
    ro.observe(root)

    return () => {
      dead = true
      cancelAnimationFrame(raf)
      clearInterval(titleTimer)
      ro.disconnect()
      offs.forEach((f) => f())
      try {
        gl?.getExtension('WEBGL_lose_context')?.loseContext()
      } catch {}
      bus.geo = null
      bus.seek = null
    }
  }, [items, drift])

  return (
    <div ref={rootRef} className="strip">
      <canvas
        ref={canvasRef}
        tabIndex={0}
        aria-label="Loyihalar. Torting, aylantiring yoki strelka tugmalaridan foydalaning."
        className="strip-canvas"
      />
      <div ref={titleRef} className="strip-title mono" aria-live="polite" />
      <div ref={cursorRef} className="strip-cursor" data-show="0" aria-hidden="true">
        <canvas ref={cursorCanvasRef} />
        <b className="strip-open mono">{openLabel}</b>
      </div>
      <ul className="sr-only">
        {items.map((p) => (
          <li key={p.slug}>
            <a href={'/work/' + p.slug}>{`${p.name}, ${p.industry}, ${p.year}`}</a>
          </li>
        ))}
      </ul>
    </div>
  )
}
