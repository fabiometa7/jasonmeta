import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'

const NAME = 'Noor Halberg'
const ROLE = 'Photographer & director'
const CITY = 'Copenhagen'
const ZONE = 'Europe/Copenhagen'
const EMAIL = 'studio@noorhalberg.com'
const AVAILABLE = 'Booking commissions from March'
const BIO = 'Noor Halberg photographs rooms, light and the people who live in them. Interiors and travel stories for magazines, hotels and furniture makers, shot mostly on film.'
const CLIENTS = ['Halde Magazine', 'Atelier Nord', 'Maison Ferrand', 'Salt & Stone Hotels']
const SOCIAL = [['Instagram', '#'], ['LinkedIn', '#'], ['Prints', '#']]

type Cat = 'Interiors' | 'Architecture' | 'Travel' | 'Still life' | 'Portrait'
// Label positions around the frame, as in a printed contact sheet.
const CATS: { cat: Cat; pos: CSSProperties }[] = [
  { cat: 'Interiors', pos: { left: 'var(--gut)', top: '30%' } },
  { cat: 'Architecture', pos: { left: '50%', top: '13%', translate: '-50% 0' } },
  { cat: 'Travel', pos: { right: 'var(--gut)', top: '46%' } },
  { cat: 'Still life', pos: { left: 'var(--gut)', top: '70%' } },
  { cat: 'Portrait', pos: { right: 'var(--gut)', top: '78%' } },
]

// The table is an endless tile. u / v place a photo in the tile (0–1);
// size is its width as a share of the screen width. Bigger prints sit nearer
// and move faster, which gives the table its depth.
type Photo = { n: string; title: string; cat: Cat; year: string; film: string; w: number; h: number; u: number; v: number; size: number }
const PHOTOS: Photo[] = [
  { n: 'c04', title: 'Sideboard, late light', cat: 'Interiors', year: '2025', film: 'Pentax 67 · Portra 160', w: 520, h: 392, u: 0.12, v: 0.14, size: 0.15 },
  { n: 'c02', title: 'Green room, Porto', cat: 'Interiors', year: '2025', film: 'Leica M6 · Portra 400', w: 392, h: 520, u: 0.38, v: 0.1, size: 0.1 },
  { n: 'c06', title: 'Morning blinds', cat: 'Still life', year: '2024', film: 'Hasselblad 500 · Ektar', w: 520, h: 520, u: 0.63, v: 0.17, size: 0.12 },
  { n: 'c09', title: 'Low tide', cat: 'Portrait', year: '2024', film: 'Leica M6 · Gold 200', w: 292, h: 520, u: 0.88, v: 0.09, size: 0.1 },
  { n: 'c01', title: 'Studio window', cat: 'Interiors', year: '2024', film: 'Leica M6 · HP5', w: 346, h: 520, u: 0.05, v: 0.42, size: 0.07 },
  { n: 'c03', title: 'Pink stair, Mexico City', cat: 'Architecture', year: '2024', film: 'Pentax 67 · Portra 400', w: 346, h: 520, u: 0.3, v: 0.38, size: 0.09 },
  { n: 'c05', title: 'Reading corner', cat: 'Interiors', year: '2024', film: 'Hasselblad 500 · Portra 160', w: 346, h: 520, u: 0.55, v: 0.45, size: 0.075 },
  { n: 'c07', title: 'Hotel Alma, corridor', cat: 'Interiors', year: '2023', film: 'Pentax 67 · Portra 400', w: 416, h: 520, u: 0.79, v: 0.36, size: 0.09 },
  { n: 'c08', title: 'Rose light', cat: 'Still life', year: '2023', film: 'Leica M6 · Portra 160', w: 346, h: 520, u: 0.16, v: 0.66, size: 0.065 },
  { n: 'c10', title: 'Drying, Fanø', cat: 'Travel', year: '2023', film: 'Hasselblad 500 · Ektar', w: 442, h: 520, u: 0.42, v: 0.7, size: 0.1 },
  { n: 'c11', title: 'Posts, Skagen', cat: 'Travel', year: '2023', film: 'Leica M6 · HP5', w: 346, h: 520, u: 0.67, v: 0.63, size: 0.065 },
  { n: 'c12', title: 'Lifeguard house', cat: 'Architecture', year: '2022', film: 'Pentax 67 · Portra 400', w: 520, h: 392, u: 0.91, v: 0.67, size: 0.12 },
  { n: 'c13', title: 'Left on the sand', cat: 'Travel', year: '2022', film: 'Leica M6 · Portra 400', w: 390, h: 520, u: 0.08, v: 0.9, size: 0.08 },
  { n: 'c14', title: 'Walking home', cat: 'Portrait', year: '2022', film: 'Leica M6 · Tri-X', w: 520, h: 520, u: 0.33, v: 0.93, size: 0.095 },
  { n: 'c15', title: 'Vase study', cat: 'Still life', year: '2022', film: 'Hasselblad 500 · Portra 160', w: 416, h: 520, u: 0.58, v: 0.88, size: 0.06 },
  { n: 'c16', title: 'Plaster bust', cat: 'Still life', year: '2021', film: 'Pentax 67 · Portra 400', w: 346, h: 520, u: 0.82, v: 0.92, size: 0.075 },
]
const thumb = (n: string) => new URL(`./assets/${n}.webp`, import.meta.url).href
const full = (n: string) => new URL(`./assets/full/${n}.webp`, import.meta.url).href

const pad = (n: number) => String(n).padStart(2, '0')
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const wrap = (v: number, size: number) => ((v % size) + size) % size
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const ta = Object.assign(document.createElement('textarea'), { value: text })
    ta.style.cssText = 'position:fixed;opacity:0'
    document.body.appendChild(ta)
    ta.select()
    let ok = false
    try {
      ok = document.execCommand('copy')
    } catch {
      ok = false
    }
    ta.remove()
    return ok
  }
}

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15000)
    return () => clearInterval(id)
  }, [])
  return new Intl.DateTimeFormat('en-GB', { timeZone: ZONE, hour: '2-digit', minute: '2-digit', hour12: false }).format(now)
}

export default function App() {
  const root = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const items = useRef<(HTMLButtonElement | null)[]>([])
  const lines = useRef<(SVGLineElement | null)[]>([])
  const fig = useRef<HTMLDivElement>(null)
  const copyTimer = useRef(0)
  const time = useClock()

  const [mode, setMode] = useState<'random' | 'linear'>('random')
  const [hover, setHover] = useState(-1)
  const [cat, setCat] = useState<Cat | ''>('')
  const [lockCat, setLockCat] = useState<Cat | ''>('')
  const [open, setOpen] = useState<number | null>(null)
  const [closing, setClosing] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [pop, setPop] = useState<'' | 'about' | 'contact'>('')
  const [copied, setCopied] = useState<'' | 'ok' | 'fail'>('')
  const [grabbing, setGrabbing] = useState(false)

  const activeCat = cat || lockCat || (hover >= 0 ? PHOTOS[hover].cat : '')

  // Everything that moves lives in this ref and is written to the DOM each frame.
  const st = useRef({
    x: 0, y: 0, vx: 0, vy: 0, px: 0, py: 0, tilt: 0, press: 0,
    mode: 'random' as 'random' | 'linear', switchedAt: -9999, born: performance.now(),
    drag: null as null | { id: number; sx: number; sy: number; lx: number; ly: number; lt: number; moved: boolean },
    dragEnd: 0, hover: -1, paused: false, reduced: false, activeCat: '' as Cat | '',
    from: PHOTOS.map(() => ({ x: 0, y: 0, w: 0 })), last: PHOTOS.map(() => ({ x: 0, y: 0, w: 0 })),
  })
  st.current.hover = hover
  st.current.activeCat = activeCat
  st.current.paused = open !== null

  useLayoutEffect(() => {
    st.current.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  // Switching layouts: every print starts from where it is now and glides, one after another.
  useEffect(() => {
    const s = st.current
    if (s.mode === mode) return
    s.from = s.last.map((p) => ({ ...p }))
    s.mode = mode
    s.switchedAt = performance.now()
    s.vy = 0
  }, [mode])

  useEffect(() => {
    const s = st.current
    let raf = 0
    let prev = performance.now()
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const el = stage.current
      if (!el || s.paused) {
        prev = now
        return
      }
      const dt = Math.min(0.05, (now - prev) / 1000)
      prev = now
      const W = el.clientWidth
      const H = el.clientHeight
      const narrow = W < 720
      const rm = s.reduced

      // Momentum after a throw, and a slow drift when nobody is touching the table.
      if (!s.drag) {
        const f = Math.exp(-dt * 2.6)
        s.vx *= f
        s.vy *= f
        if (!rm && s.hover < 0) {
          const drift = s.mode === 'linear' ? [-22, 0] : [-14, -8]
          s.vx += (drift[0] - s.vx) * Math.min(1, dt * 0.6)
          s.vy += (drift[1] - s.vy) * Math.min(1, dt * 0.6)
        }
        s.x += s.vx * dt
        s.y += s.vy * dt
      }
      if (s.mode === 'linear') s.y += (0 - s.y) * Math.min(1, dt * 4)
      // The table leans into the direction of travel and pulls back a little while held.
      const speed = s.drag ? s.vx : s.vx * 0.6
      s.tilt += (clamp(speed / 900, -1, 1) - s.tilt) * Math.min(1, dt * 6)
      s.press += ((s.drag?.moved ? 1 : 0) - s.press) * Math.min(1, dt * 7)
      el.style.setProperty('--tilt', s.tilt.toFixed(3))
      el.style.setProperty('--press', s.press.toFixed(3))

      const k = narrow ? 2.2 : 1.25
      // The tile is a little larger than the screen so prints wrap out of sight.
      const TW = W * (narrow ? 1.9 : 1.45)
      const TH = H * (narrow ? 1.2 : 1.45)
      const stripH = H * (narrow ? 0.42 : 0.46)
      const gap = narrow ? 10 : 18
      const widths = PHOTOS.map((p) => (stripH * p.w) / p.h)
      const stripW = widths.reduce((a, b) => a + b + gap, 0)
      let cursor = 0
      // Where each category label sits right now (they move between layouts).
      const sr = el.getBoundingClientRect()
      const anchors = new Map<string, [number, number]>()
      root.current?.querySelectorAll<HTMLElement>('[data-cat]').forEach((lab) => {
        const r = lab.getBoundingClientRect()
        anchors.set(lab.dataset.cat!, [r.left - sr.left + r.width / 2, r.top - sr.top + r.height / 2])
      })

      PHOTOS.forEach((p, i) => {
        const node = items.current[i]
        if (!node) return
        const depth = 0.72 + (p.size - 0.06) * 5.5
        // Random: wrap each print around the screen centre so the table never ends.
        const rw = clamp(p.size * k * W, 70, 560)
        const rx = wrap(p.u * TW + s.x * depth - W / 2 + TW / 2, TW) - TW / 2 + W / 2 + s.px * (depth - 1) * 40
        const ry = wrap(p.v * TH + s.y * depth - H / 2 + TH / 2, TH) - TH / 2 + H / 2 + s.py * (depth - 1) * 30
        // Linear: an endless strip, centred vertically.
        const lw = widths[i]
        const lx = wrap(cursor + lw / 2 + s.x - W / 2 + stripW / 2, stripW) - stripW / 2 + W / 2
        cursor += lw + gap
        const ly = H / 2
        const target = s.mode === 'random' ? { x: rx, y: ry, w: rw } : { x: lx, y: ly, w: lw }
        const t = rm ? 1 : ease(clamp((now - s.switchedAt - i * 35) / 1000, 0, 1))
        const from = s.from[i]
        const cur = t >= 1 ? target : { x: from.x + (target.x - from.x) * t, y: from.y + (target.y - from.y) * t, w: from.w + (target.w - from.w) * t }
        s.last[i] = cur
        const e = rm ? 1 : ease(clamp((now - s.born - 200 - i * 55) / 900, 0, 1))
        const h = (cur.w * p.h) / p.w
        node.style.width = `${cur.w.toFixed(1)}px`
        node.style.height = `${h.toFixed(1)}px`
        node.style.transform = `translate3d(${(cur.x - cur.w / 2).toFixed(1)}px, ${(cur.y - h / 2).toFixed(1)}px, 0) scale(${(0.6 + 0.4 * e).toFixed(3)})`
        node.style.opacity = e.toFixed(3)
        node.style.zIndex = String(i === s.hover ? 50 : Math.round(depth * 10))

        // A hairline from the photo's category label to the photo, every frame.
        const ln = lines.current[i]
        const anchor = anchors.get(p.cat)
        if (ln && anchor) {
          const [ax, ay] = anchor
          const inView = cur.x > -40 && cur.x < W + 40 && cur.y > -40 && cur.y < H + 40
          ln.setAttribute('x1', ax.toFixed(1))
          ln.setAttribute('y1', ay.toFixed(1))
          ln.setAttribute('x2', cur.x.toFixed(1))
          ln.setAttribute('y2', cur.y.toFixed(1))
          const on = s.activeCat === p.cat
          ln.style.opacity = inView ? (on ? '0.9' : s.activeCat ? '0.06' : '0.28') : '0'
        }
      })
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Pointer parallax: nearer prints shift more.
  useEffect(() => {
    const onMove = (e: globalThis.PointerEvent) => {
      const r = root.current?.getBoundingClientRect()
      if (!r || st.current.reduced) return
      st.current.px = (e.clientX - r.left) / r.width - 0.5
      st.current.py = (e.clientY - r.top) / r.height - 0.5
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  // Drag anywhere, on the paper or on a print. A press that does not move is a click.
  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    const now = performance.now()
    st.current.drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, lx: e.clientX, ly: e.clientY, lt: now, moved: false }
  }
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const s = st.current
    const d = s.drag
    if (!d || d.id !== e.pointerId) return
    const dx = e.clientX - d.lx
    const dy = e.clientY - d.ly
    if (!d.moved) {
      const tx = e.clientX - d.sx
      const ty = e.clientY - d.sy
      if (Math.hypot(tx, ty) < 6) return
      // On touch in the strip, vertical swipes still scroll the page.
      if (e.pointerType === 'touch' && s.mode === 'linear' && Math.abs(ty) > Math.abs(tx)) {
        s.drag = null
        return
      }
      d.moved = true
      setGrabbing(true)
      try {
        e.currentTarget.setPointerCapture(e.pointerId)
      } catch {
        // Capture can fail for synthetic pointers; dragging still works without it.
      }
    }
    const now = performance.now()
    const dtm = Math.max(0.008, (now - d.lt) / 1000)
    s.x += dx
    s.y += s.mode === 'random' ? dy : 0
    s.vx = s.vx * 0.5 + (dx / dtm) * 0.5
    s.vy = s.mode === 'random' ? s.vy * 0.5 + (dy / dtm) * 0.5 : 0
    d.lx = e.clientX
    d.ly = e.clientY
    d.lt = now
  }
  const onUp = () => {
    const s = st.current
    if (s.drag?.moved) s.dragEnd = performance.now()
    s.drag = null
    setGrabbing(false)
  }

  // Horizontal wheel and trackpad swipes pan the table; vertical scrolling is left to the page.
  useEffect(() => {
    const el = stage.current!
    const onWheel = (e: WheelEvent) => {
      const dx = e.shiftKey ? e.deltaY : e.deltaX
      if (!dx || Math.abs(e.deltaX) < Math.abs(e.deltaY) * 0.5 && !e.shiftKey) return
      e.preventDefault()
      st.current.x -= dx
      st.current.vx = -dx * 8
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  // Lightbox: the photo flies out of its spot on the table.
  const flight = (from: DOMRect, to: DOMRect) => `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})`
  const openPhoto = (i: number) => {
    if (performance.now() - st.current.dragEnd < 120) return
    setLoaded(false)
    setOpen(i)
  }
  useLayoutEffect(() => {
    if (open === null || closing || !fig.current) return
    const from = items.current[open]?.getBoundingClientRect()
    if (from && !st.current.reduced) {
      const to = fig.current.getBoundingClientRect()
      fig.current.animate([{ transform: flight(from, to) }, { transform: 'none' }], { duration: 650, easing: 'cubic-bezier(0.7, 0, 0.2, 1)' })
    }
    root.current?.querySelector<HTMLElement>('.cl-lb-close')?.focus()
  }, [open])
  const closePhoto = () => {
    if (open === null || closing) return
    const i = open
    const from = items.current[i]?.getBoundingClientRect()
    if (!from || !fig.current || st.current.reduced) {
      setOpen(null)
      return
    }
    setClosing(true)
    const to = fig.current.getBoundingClientRect()
    fig.current.animate([{ transform: 'none' }, { transform: flight(from, to) }], { duration: 520, easing: 'cubic-bezier(0.7, 0, 0.2, 1)' }).finished.then(() => {
      setOpen(null)
      setClosing(false)
      items.current[i]?.focus({ preventScroll: true })
    }, () => setOpen(null))
  }
  const step = (dir: number) => {
    if (open === null) return
    setLoaded(false)
    setOpen((open + dir + PHOTOS.length) % PHOTOS.length)
  }
  useEffect(() => {
    if (open === null && !pop) return
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') pop ? setPop('') : closePhoto()
      else if (open !== null && e.key === 'ArrowRight') step(1)
      else if (open !== null && e.key === 'ArrowLeft') step(-1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  })
  useEffect(() => {
    if (!pop) return
    const onDown = (e: globalThis.PointerEvent) => {
      if (!(e.target as Element).closest('.cl-pop, .cl-nav button')) setPop('')
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [pop])
  useEffect(() => () => clearTimeout(copyTimer.current), [])

  // Keyboard: arrow keys pan the table when it has focus.
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const s = st.current
    const map: Record<string, [number, number]> = { ArrowLeft: [1, 0], ArrowRight: [-1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }
    const m = map[e.key]
    if (!m) return
    e.preventDefault()
    s.vx = m[0] * 700
    s.vy = s.mode === 'random' ? m[1] * 700 : 0
  }

  const swipe = useRef<{ x: number } | null>(null)

  const copy = async () => {
    const ok = await copyText(EMAIL)
    setCopied(ok ? 'ok' : 'fail')
    clearTimeout(copyTimer.current)
    copyTimer.current = window.setTimeout(() => setCopied(''), ok ? 2000 : 6000)
  }

  const p = open !== null ? PHOTOS[open] : null
  const letters = [...NAME.toUpperCase()]

  return (
    <main ref={root} className={`cl is-${mode}${activeCat ? ' has-cat' : ''}${open !== null ? ' is-open' : ''}`}>
      <header className="cl-top">
        <nav className="cl-nav" aria-label="Main">
          <a href="#work" aria-current="page">Work</a>
        </nav>
        <h1 className="cl-mark" aria-label={`${NAME}, ${ROLE.toLowerCase()}`}>
          {letters.map((ch, i) => (
            <span key={i} aria-hidden="true" style={{ '--i': i } as CSSProperties}>{ch === ' ' ? ' ' : ch}</span>
          ))}
        </h1>
        <nav className="cl-nav is-right" aria-label="Studio">
          <button type="button" aria-expanded={pop === 'about'} onClick={() => setPop((v) => (v === 'about' ? '' : 'about'))}>About</button>
          <button type="button" aria-expanded={pop === 'contact'} onClick={() => setPop((v) => (v === 'contact' ? '' : 'contact'))}>Contact</button>
        </nav>
        <div className={`cl-pop${pop === 'about' ? ' is-open' : ''}`} role="dialog" aria-label="About" inert={pop !== 'about'}>
          <p className="cl-pop-role">{ROLE} · {CITY}</p>
          <p>{BIO}</p>
          <p className="cl-pop-label">Recent clients</p>
          <ul className="cl-list">{CLIENTS.map((c) => <li key={c}>{c}</li>)}</ul>
        </div>
        <div className={`cl-pop${pop === 'contact' ? ' is-open' : ''}`} role="dialog" aria-label="Contact" inert={pop !== 'contact'}>
          <p className="cl-pop-role"><i className="cl-dot" aria-hidden="true" /> {AVAILABLE}</p>
          <button className={`cl-copy${copied ? ` is-${copied}` : ''}`} type="button" onClick={copy}>
            <span>{EMAIL}</span>
            <em aria-live="polite">{copied === 'ok' ? 'Copied' : copied === 'fail' ? 'Select to copy' : 'Copy'}</em>
          </button>
          <div className="cl-row">
            <a className="cl-btn is-solid" href="#book">Book a shoot</a>
            <a className="cl-btn" href="#cv" download>Rates & CV</a>
          </div>
          <ul className="cl-list is-inline">{SOCIAL.map(([n, h]) => <li key={n}><a href={h}>{n}</a></li>)}</ul>
        </div>
      </header>

      <div
        ref={stage}
        className={`cl-stage${grabbing ? ' is-grabbing' : ''}`}
        tabIndex={0}
        aria-label="Photographs on an endless table. Drag, or use the arrow keys, to explore."
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onDragStart={(e) => e.preventDefault()}
        onKeyDown={onKey}
      >
        <svg className="cl-lines" aria-hidden="true">
          {PHOTOS.map((ph, i) => <line key={ph.n} ref={(el) => { lines.current[i] = el }} />)}
        </svg>
        <div className="cl-canvas">
          {PHOTOS.map((ph, i) => (
            <button
              key={ph.n}
              ref={(el) => { items.current[i] = el }}
              type="button"
              className={`cl-ph${hover === i ? ' is-hover' : ''}${activeCat === ph.cat ? ' is-cat' : ''}${open === i ? ' is-flying' : ''}`}
              onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(i)}
              onPointerLeave={() => setHover(-1)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(-1)}
              onClick={() => openPhoto(i)}
              aria-label={`${ph.title}, ${ph.cat}, ${ph.year}`}
            >
              <span className="cl-ph-in">
                <img src={thumb(ph.n)} alt="" draggable={false} />
              </span>
              <span className="cl-ph-cap" aria-hidden="true">{pad(i + 1)} · {ph.title}</span>
            </button>
          ))}
        </div>
      </div>

      {CATS.map(({ cat: c, pos }) => (
        <button
          key={c}
          type="button"
          className="cl-cat"
          data-cat={c}
          style={pos}
          aria-pressed={lockCat === c}
          onPointerEnter={() => setCat(c)}
          onPointerLeave={() => setCat('')}
          onFocus={() => setCat(c)}
          onBlur={() => setCat('')}
          onClick={() => setLockCat((l) => (l === c ? '' : c))}
        >
          {c}<sup>{PHOTOS.filter((x) => x.cat === c).length}</sup>
        </button>
      ))}

      <footer className="cl-bottom">
        <p className="cl-meta">{CITY} {time}</p>
        <div className="cl-switch">
          <span aria-hidden="true" className={mode === 'linear' ? 'is-on' : ''}>Linear</span>
          <button type="button" role="switch" aria-checked={mode === 'random'} aria-label="Random layout" onClick={() => setMode((m) => (m === 'random' ? 'linear' : 'random'))}>
            <i />
          </button>
          <span aria-hidden="true" className={mode === 'random' ? 'is-on' : ''}>Random</span>
        </div>
        <p className="cl-meta is-right">{PHOTOS.length} photographs · drag to explore</p>
      </footer>

      {p && open !== null && (
        <div
          className={`cl-lb${closing ? ' is-closing' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label={p.title}
          onPointerDown={(e) => (swipe.current = { x: e.clientX })}
          onPointerUp={(e) => {
            const s = swipe.current
            swipe.current = null
            if (s && Math.abs(e.clientX - s.x) > 60) step(e.clientX < s.x ? 1 : -1)
          }}
        >
          <button className="cl-lb-close" type="button" onClick={closePhoto} aria-label="Close">Close <span aria-hidden="true">×</span></button>
          <div ref={fig} className="cl-lb-fig" style={{ aspectRatio: `${p.w} / ${p.h}`, '--r': p.w / p.h } as CSSProperties}>
            <img src={thumb(p.n)} alt="" key={`t-${p.n}`} draggable={false} />
            <img className={loaded ? 'is-loaded' : ''} src={full(p.n)} alt={p.title} key={`f-${p.n}`} onLoad={() => setLoaded(true)} draggable={false} />
          </div>
          <button className="cl-lb-arrow is-prev" type="button" onClick={() => step(-1)} aria-label="Previous photograph"><span /></button>
          <button className="cl-lb-arrow is-next" type="button" onClick={() => step(1)} aria-label="Next photograph"><span /></button>
          <div className="cl-lb-cap" key={p.n} aria-live="polite">
            <p className="cl-lb-no">{pad(open + 1)} / {pad(PHOTOS.length)}</p>
            <p className="cl-lb-title">{p.title}</p>
            <p className="cl-lb-meta">{p.cat} · {p.year} · {p.film}</p>
          </div>
        </div>
      )}
    </main>
  )
}
