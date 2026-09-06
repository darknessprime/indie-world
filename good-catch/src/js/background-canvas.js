// A water-surface backdrop: a vertical depth gradient, drifting "caustic"
// light patches (soft radial glows that wander and pulse, standing in for
// refracted sunlight through water), a faint moving wave-line texture, and
// rising bubbles. Pure canvas math, no WebGL.

function makeCaustic(w, h) {
  return {
    cx: Math.random() * w,
    cy: Math.random() * h,
    r: 90 + Math.random() * 160,
    ax: 60 + Math.random() * 120,
    ay: 40 + Math.random() * 90,
    fx: 0.03 + Math.random() * 0.04,
    fy: 0.025 + Math.random() * 0.035,
    phase: Math.random() * Math.PI * 2,
    pulseSpeed: 0.3 + Math.random() * 0.4,
    pulsePhase: Math.random() * Math.PI * 2,
  }
}

function drawCaustic(ctx, c, t) {
  const x = c.cx + Math.sin(t * c.fx + c.phase) * c.ax
  const y = c.cy + Math.cos(t * c.fy + c.phase) * c.ay
  const pulse = 0.5 + 0.5 * Math.sin(t * c.pulseSpeed + c.pulsePhase)
  const grad = ctx.createRadialGradient(x, y, 0, x, y, c.r)
  grad.addColorStop(0, `rgba(255,255,255,${0.10 + pulse * 0.08})`)
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = grad
  ctx.fillRect(x - c.r, y - c.r, c.r * 2, c.r * 2)
}

function drawWaveLines(ctx, w, h, t) {
  const rows = 7
  for (let i = 0; i < rows; i++) {
    const y = (h / rows) * i + (h / rows) * 0.5
    ctx.beginPath()
    for (let x = 0; x <= w; x += 24) {
      const wave = Math.sin(x * 0.02 + t * 0.6 + i * 1.3) * 5
      if (x === 0) ctx.moveTo(x, y + wave)
      else ctx.lineTo(x, y + wave)
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'
    ctx.lineWidth = 2
    ctx.stroke()
  }
}

function makeBubble(w, h) {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    r: 2 + Math.random() * 3,
    speed: 0.15 + Math.random() * 0.25,
    drift: (Math.random() - 0.5) * 0.3,
    phase: Math.random() * Math.PI * 2,
  }
}

export function initBackgroundCanvas(canvas) {
  const ctx = canvas.getContext('2d')
  let w = 0, h = 0
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
  let caustics = []
  let bubbles = []
  let gradient = null

  function resize() {
    w = window.innerWidth
    h = window.innerHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    caustics = Array.from({ length: 6 }, () => makeCaustic(w, h))
    bubbles = Array.from({ length: 22 }, () => makeBubble(w, h))
    gradient = ctx.createLinearGradient(0, 0, 0, h)
    gradient.addColorStop(0, '#eaf5f1')
    gradient.addColorStop(0.45, '#cfe8e2')
    gradient.addColorStop(1, '#a3d2c8')
  }
  resize()
  window.addEventListener('resize', resize)

  let rafId
  const start = performance.now()
  function tick(now) {
    const t = (now - start) / 1000
    ctx.clearRect(0, 0, w, h)

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, w, h)

    caustics.forEach((c) => drawCaustic(ctx, c, t))
    drawWaveLines(ctx, w, h, t)

    bubbles.forEach((b) => {
      b.y -= b.speed
      b.x += Math.sin(t * 0.6 + b.phase) * b.drift
      if (b.y < -10) { b.y = h + 10; b.x = Math.random() * w }
      const twinkle = 0.3 + 0.5 * (0.5 + 0.5 * Math.sin(t * 2 + b.phase))
      ctx.beginPath()
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'
      ctx.lineWidth = 1
      ctx.globalAlpha = twinkle * 0.6
      ctx.stroke()
    })
    ctx.globalAlpha = 1

    rafId = requestAnimationFrame(tick)
  }
  rafId = requestAnimationFrame(tick)

  return { dispose: () => { cancelAnimationFrame(rafId); window.removeEventListener('resize', resize) } }
}
