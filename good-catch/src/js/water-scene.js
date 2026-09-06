// A school of independently-swimming fish, each built from the same
// segment-chain procedural animation as before, plus a fishing-line cursor
// (a line dangling from off-screen to a bobbing hook at the pointer). Fish
// wander on their own and are only pulled toward the hook once it's close
// enough to look like real bait attraction - not a single fish glued to
// the cursor.

import { SecondOrderDynamics } from './second-order.js'

// Widest just behind the head, tapering to a narrow peduncle before the
// tail - a rounded nose and a curved taper, not a linear wedge, is what
// actually reads as "fish" instead of "triangle".
const SIZES_BASE = [6.5, 10.5, 12, 11.2, 9.4, 7, 4.8, 3, 1.8]
const PALETTES = [
  { body: '#f0a93a', belly: '#fffaf0', eye: '#4a3c2e' },
  { body: '#7c9a6b', belly: '#eef3e6', eye: '#3a3c2e' },
  { body: '#8fa3b8', belly: '#eaeff5', eye: '#3a3c2e' },
  { body: '#c97b5a', belly: '#fbe9df', eye: '#4a3c2e' },
]
const ATTRACT_RADIUS = 170
const BUBBLE_COLORS = ['#7fb8b0', '#a8c04e', '#f0a93a']

function updateChain(points, desiredDistance, maxAngle) {
  if (points.length > 1) {
    const p0 = points[0]
    const p1 = points[1]
    const angle = Math.atan2(p1.y - p0.y, p1.x - p0.x)
    p1.x = p0.x + Math.cos(angle) * desiredDistance
    p1.y = p0.y + Math.sin(angle) * desiredDistance
  }
  for (let i = 2; i < points.length; i++) {
    const p0 = points[i - 2]
    const p1 = points[i - 1]
    const p2 = points[i]
    const angle1 = Math.atan2(p1.y - p0.y, p1.x - p0.x)
    const angle2 = Math.atan2(p2.y - p1.y, p2.x - p1.x)
    let diff = angle2 - angle1
    if (diff > Math.PI) diff -= Math.PI * 2
    else if (diff < -Math.PI) diff += Math.PI * 2

    if (Math.abs(diff) > maxAngle) {
      const newAngle = angle1 + Math.sign(diff) * maxAngle
      p2.x = p1.x + Math.cos(newAngle) * desiredDistance
      p2.y = p1.y + Math.sin(newAngle) * desiredDistance
    } else {
      const dx = p1.x - p2.x
      const dy = p1.y - p2.y
      const dist = Math.hypot(dx, dy)
      if (dist !== desiredDistance) {
        const angle = Math.atan2(dy, dx)
        p2.x = p1.x - Math.cos(angle) * desiredDistance
        p2.y = p1.y - Math.sin(angle) * desiredDistance
      }
    }
  }
}

// Draws a smooth curve through a polyline by quadratic-curving to the
// midpoint of each consecutive pair - turns a faceted polygon into an
// organic outline without needing a full spline library.
function smoothPathInto(ctx, pts, reverse) {
  const seq = reverse ? [...pts].reverse() : pts
  for (let i = 0; i < seq.length - 1; i++) {
    const p = seq[i]
    const next = seq[i + 1]
    const mx = (p.x + next.x) / 2
    const my = (p.y + next.y) / 2
    ctx.quadraticCurveTo(p.x, p.y, mx, my)
  }
  ctx.lineTo(seq[seq.length - 1].x, seq[seq.length - 1].y)
}

function drawFish(ctx, fish, t) {
  const { points, sizes, palette, cheer } = fish
  const top = []
  const bottom = []
  for (let i = 0; i < points.length; i++) {
    const p = points[i]
    const prev = points[i - 1] || p
    const next = points[i + 1] || p
    const dx = next.x - prev.x
    const dy = next.y - prev.y
    const len = Math.hypot(dx, dy) || 1
    const nx = -dy / len
    const ny = dx / len
    const size = sizes[i] * (1 + Math.sin(t * 6 - i * 0.6) * 0.05 * (1 + cheer))
    top.push({ x: p.x + nx * size, y: p.y + ny * size })
    bottom.push({ x: p.x - nx * size, y: p.y - ny * size })
  }

  const tail = points[points.length - 1]
  const tailPrev = points[points.length - 2]
  const tailAngle = Math.atan2(tail.y - tailPrev.y, tail.x - tailPrev.x)
  const finWag = Math.sin(t * 7 + fish.phase) * 0.4
  const finLen = 15 + cheer * 4
  const lobeSpread = 0.55

  // Forked tail: two curved lobes meeting at a notch behind the peduncle.
  const tailBase = { x: tail.x + Math.cos(tailAngle) * 3, y: tail.y + Math.sin(tailAngle) * 3 }
  const lobeTopTip = {
    x: tailBase.x + Math.cos(tailAngle + lobeSpread + finWag) * finLen,
    y: tailBase.y + Math.sin(tailAngle + lobeSpread + finWag) * finLen,
  }
  const lobeBottomTip = {
    x: tailBase.x + Math.cos(tailAngle - lobeSpread + finWag) * finLen,
    y: tailBase.y + Math.sin(tailAngle - lobeSpread + finWag) * finLen,
  }
  const notch = {
    x: tailBase.x + Math.cos(tailAngle) * finLen * 0.45,
    y: tailBase.y + Math.sin(tailAngle) * finLen * 0.45,
  }

  ctx.beginPath()
  ctx.moveTo(top[0].x, top[0].y)
  smoothPathInto(ctx, top, false)
  ctx.quadraticCurveTo(tail.x, tail.y, lobeTopTip.x, lobeTopTip.y)
  ctx.quadraticCurveTo(notch.x, notch.y, lobeBottomTip.x, lobeBottomTip.y)
  ctx.quadraticCurveTo(tail.x, tail.y, bottom[bottom.length - 1].x, bottom[bottom.length - 1].y)
  smoothPathInto(ctx, bottom, true)
  ctx.closePath()
  ctx.fillStyle = palette.body
  ctx.fill()

  // Dorsal fin - a small curved bump on the back, roughly a third of the
  // way down the body, is what makes the silhouette read as "fish".
  const dorsalBase = points[2]
  const dorsalNormal = top[2]
  const dorsalTip = {
    x: dorsalBase.x + (dorsalNormal.x - dorsalBase.x) * 2.1,
    y: dorsalBase.y + (dorsalNormal.y - dorsalBase.y) * 2.1,
  }
  ctx.beginPath()
  ctx.moveTo(points[1].x + (top[1].x - points[1].x) * 0.7, points[1].y + (top[1].y - points[1].y) * 0.7)
  ctx.quadraticCurveTo(dorsalTip.x, dorsalTip.y, top[3].x, top[3].y)
  ctx.closePath()
  ctx.fillStyle = palette.body
  ctx.fill()

  // Belly highlight, curved to match the body rather than a straight stroke.
  ctx.beginPath()
  ctx.moveTo(bottom[0].x, bottom[0].y)
  smoothPathInto(ctx, bottom.slice(0, 5), false)
  ctx.strokeStyle = palette.belly
  ctx.lineWidth = sizes[0] * 0.32
  ctx.lineCap = 'round'
  ctx.stroke()

  const head = points[0]
  const headNext = points[1]
  const headDx = headNext.x - head.x
  const headDy = headNext.y - head.y
  const headLen = Math.hypot(headDx, headDy) || 1
  const enx = -headDy / headLen
  const eny = headDx / headLen
  const eyeOffset = sizes[0] * 0.45
  ctx.beginPath()
  ctx.arc(head.x + enx * eyeOffset, head.y + eny * eyeOffset, 1.5 + cheer * 0.5, 0, Math.PI * 2)
  ctx.fillStyle = palette.eye
  ctx.fill()
}

function drawFishingLine(ctx, hookX, hookY, t) {
  const anchorX = hookX + Math.sin(t * 1.4) * 14
  const anchorY = -20
  const ctrlX = (anchorX + hookX) / 2 + Math.sin(t * 2.1) * 18
  const ctrlY = (anchorY + hookY) / 2

  ctx.beginPath()
  ctx.moveTo(anchorX, anchorY)
  ctx.quadraticCurveTo(ctrlX, ctrlY, hookX, hookY)
  ctx.strokeStyle = 'rgba(74, 60, 46, 0.4)'
  ctx.lineWidth = 1.4
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(hookX, hookY + 5)
  ctx.quadraticCurveTo(hookX + 7, hookY + 16, hookX, hookY + 19)
  ctx.strokeStyle = '#8a7a63'
  ctx.lineWidth = 1.6
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(hookX, hookY, 6, 0, Math.PI * 2)
  ctx.fillStyle = '#f0a93a'
  ctx.fill()
  ctx.strokeStyle = '#fffcf5'
  ctx.lineWidth = 2
  ctx.stroke()
}

function makeFish(w, h, i) {
  const scale = 0.65 + Math.random() * 0.6
  const sizes = SIZES_BASE.map((s) => s * scale)
  const startX = Math.random() * w
  const startY = Math.random() * h
  return {
    points: sizes.map(() => ({ x: startX, y: startY })),
    sizes,
    desiredDistance: 11 * scale,
    maxAngle: Math.PI / 5.5,
    sodX: new SecondOrderDynamics(0.7 + Math.random() * 0.5, 0.85, -0.2, startX),
    sodY: new SecondOrderDynamics(0.7 + Math.random() * 0.5, 0.85, -0.2, startY),
    wander: {
      cx: startX, cy: startY,
      ax: 90 + Math.random() * 180, ay: 60 + Math.random() * 140,
      fx: 0.03 + Math.random() * 0.04, fy: 0.025 + Math.random() * 0.035,
      phase: Math.random() * Math.PI * 2,
    },
    nextRetargetAt: 4 + Math.random() * 6,
    palette: PALETTES[i % PALETTES.length],
    phase: Math.random() * Math.PI * 2,
    cheer: 0,
    cheerTarget: 0,
  }
}

export function initWaterScene(canvas) {
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches
  if (isCoarsePointer) {
    canvas.style.display = 'none'
    return
  }

  document.documentElement.classList.add('has-custom-cursor')

  const ctx = canvas.getContext('2d')
  let w = 0, h = 0
  const dpr = Math.min(window.devicePixelRatio || 1, 2)

  function resize() {
    w = window.innerWidth
    h = window.innerHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  resize()
  window.addEventListener('resize', resize)

  const FISH_COUNT = 6
  const fish = Array.from({ length: FISH_COUNT }, (_, i) => makeFish(w, h, i))

  const mouse = { x: w * 0.5, y: h * 0.5 }
  let hasMouse = false
  window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; hasMouse = true })
  window.addEventListener('mouseleave', () => { hasMouse = false })

  const hookSodX = new SecondOrderDynamics(1.8, 0.9, 0, mouse.x)
  const hookSodY = new SecondOrderDynamics(1.8, 0.9, 0, mouse.y)

  const bubbles = []
  window.addEventListener('click', (e) => {
    fish.forEach((f) => {
      const dx = e.clientX - f.points[0].x
      const dy = e.clientY - f.points[0].y
      if (Math.hypot(dx, dy) > 90) return
      f.cheerTarget = 1
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2 + Math.random() * 0.4
        const speed = 0.6 + Math.random() * 1
        bubbles.push({
          x: f.points[0].x, y: f.points[0].y,
          vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 0.6,
          life: 1, r: 1.5 + Math.random() * 2.2,
          color: BUBBLE_COLORS[i % BUBBLE_COLORS.length],
        })
      }
    })
  })

  let prevTime = performance.now()
  const start = prevTime

  function tick(now) {
    const t = (now - start) / 1000
    const dt = Math.min((now - prevTime) / 1000, 0.05) || 0.016
    prevTime = now

    const hookX = hasMouse ? hookSodX.update(dt, mouse.x) : hookSodX.update(dt, w * 0.5 + Math.sin(t * 0.2) * w * 0.2)
    const hookY = hasMouse ? hookSodY.update(dt, mouse.y) : hookSodY.update(dt, h * 0.3)

    ctx.clearRect(0, 0, w, h)

    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i]
      b.vy -= 0.015
      b.x += b.vx
      b.y += b.vy
      b.life -= 0.02
      if (b.life <= 0) bubbles.splice(i, 1)
    }
    bubbles.forEach((b) => {
      ctx.beginPath()
      ctx.arc(b.x, b.y, b.r * b.life, 0, Math.PI * 2)
      ctx.strokeStyle = b.color
      ctx.lineWidth = 1.4
      ctx.globalAlpha = b.life
      ctx.stroke()
    })
    ctx.globalAlpha = 1

    fish.forEach((f) => {
      if (t > f.nextRetargetAt) {
        f.wander.cx = Math.random() * w
        f.wander.cy = Math.random() * h
        f.nextRetargetAt = t + 5 + Math.random() * 7
      }

      const wanderX = f.wander.cx + Math.sin(t * f.wander.fx + f.wander.phase) * f.wander.ax
      const wanderY = f.wander.cy + Math.cos(t * f.wander.fy + f.wander.phase) * f.wander.ay

      let targetX = wanderX
      let targetY = wanderY

      if (hasMouse) {
        const dx = hookX - f.points[0].x
        const dy = hookY - f.points[0].y
        const dist = Math.hypot(dx, dy)
        if (dist < ATTRACT_RADIUS) {
          const pull = 1 - dist / ATTRACT_RADIUS
          targetX = wanderX + (hookX - wanderX) * pull
          targetY = wanderY + (hookY - wanderY) * pull
          if (dist < 50) f.cheerTarget = Math.max(f.cheerTarget, 0.5)
        }
      }

      f.points[0].x = f.sodX.update(dt, targetX)
      f.points[0].y = f.sodY.update(dt, targetY)
      updateChain(f.points, f.desiredDistance, f.maxAngle)

      f.cheer += (f.cheerTarget - f.cheer) * 0.1
      f.cheerTarget *= 0.93

      drawFish(ctx, f, t)
    })

    if (hasMouse) drawFishingLine(ctx, hookX, hookY, t)

    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}
