// A soft, organic floating-blob background driven entirely by trig math -
// no WebGL/Three.js needed for a cozy 2D game site like this.

const PALETTE = ['#ef6a53', '#5f8d63', '#2f8f95', '#f0ac3f']

function makeBlob(w, h, i) {
  const baseR = 40 + Math.random() * 90
  return {
    // wander center, drawn position orbits around this via sine/cosine
    cx: Math.random() * w,
    cy: Math.random() * h,
    // Lissajous wander parameters
    ax: 60 + Math.random() * 120,
    ay: 40 + Math.random() * 100,
    fx: 0.05 + Math.random() * 0.08,
    fy: 0.04 + Math.random() * 0.07,
    phase: Math.random() * Math.PI * 2,
    radius: baseR,
    wobbleAmp: baseR * (0.08 + Math.random() * 0.1),
    wobbleFreq: 3 + Math.floor(Math.random() * 3),
    wobbleSpeed: 0.3 + Math.random() * 0.4,
    rotSpeed: (Math.random() - 0.5) * 0.15,
    color: PALETTE[i % PALETTE.length],
    opacity: 0.07 + Math.random() * 0.07,
  }
}

function drawBlob(ctx, blob, t) {
  const { cx, cy, ax, ay, fx, fy, phase, radius, wobbleAmp, wobbleFreq, wobbleSpeed, rotSpeed, color, opacity } = blob
  const x = cx + Math.sin(t * fx + phase) * ax
  const y = cy + Math.cos(t * fy + phase) * ay
  const rot = t * rotSpeed

  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rot)
  ctx.beginPath()
  const steps = 48
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * Math.PI * 2
    const r = radius + Math.sin(angle * wobbleFreq + t * wobbleSpeed) * wobbleAmp
    const px = Math.cos(angle) * r
    const py = Math.sin(angle) * r
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fillStyle = color
  ctx.globalAlpha = opacity
  ctx.fill()
  ctx.restore()
}

function makeSpark(w, h) {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    r: 1.5 + Math.random() * 2,
    speed: 0.15 + Math.random() * 0.25,
    drift: (Math.random() - 0.5) * 0.3,
    phase: Math.random() * Math.PI * 2,
  }
}

export function initBackgroundCanvas(canvas) {
  const ctx = canvas.getContext('2d')
  let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 1.5)
  let blobs = []
  let sparks = []

  function resize() {
    w = window.innerWidth
    h = window.innerHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const count = w < 700 ? 4 : 7
    blobs = Array.from({ length: count }, (_, i) => makeBlob(w, h, i))
    sparks = Array.from({ length: 22 }, () => makeSpark(w, h))
  }
  resize()
  window.addEventListener('resize', resize)

  let rafId
  const start = performance.now()
  function tick(now) {
    const t = (now - start) / 1000
    ctx.clearRect(0, 0, w, h)

    blobs.forEach((b) => drawBlob(ctx, b, t))

    ctx.globalAlpha = 1
    sparks.forEach((s) => {
      s.y -= s.speed
      s.x += Math.sin(t * 0.6 + s.phase) * s.drift
      if (s.y < -10) { s.y = h + 10; s.x = Math.random() * w }
      const twinkle = 0.3 + 0.5 * (0.5 + 0.5 * Math.sin(t * 2 + s.phase))
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
      ctx.fillStyle = '#f0ac3f'
      ctx.globalAlpha = twinkle * 0.5
      ctx.fill()
    })

    rafId = requestAnimationFrame(tick)
  }
  rafId = requestAnimationFrame(tick)

  return { dispose: () => { cancelAnimationFrame(rafId); window.removeEventListener('resize', resize) } }
}
