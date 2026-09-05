// A little fish that swims around the page, built from the classic
// procedural-animation "segment chain" technique: a free head plus N body
// points, each distance- and angle-constrained to the one before it. The
// head target itself is smoothed through second-order dynamics instead of a
// plain lerp, so the fish has real weight and a touch of anticipation when
// the cursor changes direction.

import { SecondOrderDynamics } from './second-order.js'

const SIZES = [10, 11, 10.2, 9, 7.6, 6.2, 4.8, 3.4, 2.2]
const DESIRED_DISTANCE = 11
const MAX_ANGLE = Math.PI / 5.5
const BUBBLE_COLORS = ['#7fb8b0', '#a8c04e', '#f0a93a']

function updateChain(points) {
  if (points.length > 1) {
    const p0 = points[0]
    const p1 = points[1]
    const angle = Math.atan2(p1.y - p0.y, p1.x - p0.x)
    p1.x = p0.x + Math.cos(angle) * DESIRED_DISTANCE
    p1.y = p0.y + Math.sin(angle) * DESIRED_DISTANCE
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

    if (Math.abs(diff) > MAX_ANGLE) {
      const newAngle = angle1 + Math.sign(diff) * MAX_ANGLE
      p2.x = p1.x + Math.cos(newAngle) * DESIRED_DISTANCE
      p2.y = p1.y + Math.sin(newAngle) * DESIRED_DISTANCE
    } else {
      const dx = p1.x - p2.x
      const dy = p1.y - p2.y
      const dist = Math.hypot(dx, dy)
      if (dist !== DESIRED_DISTANCE) {
        const angle = Math.atan2(dy, dx)
        p2.x = p1.x - Math.cos(angle) * DESIRED_DISTANCE
        p2.y = p1.y - Math.sin(angle) * DESIRED_DISTANCE
      }
    }
  }
}

function drawFish(ctx, points, t, cheer) {
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
    const size = SIZES[i] * (1 + Math.sin(t * 6 - i * 0.6) * 0.05 * (1 + cheer))
    top.push({ x: p.x + nx * size, y: p.y + ny * size })
    bottom.push({ x: p.x - nx * size, y: p.y - ny * size })
  }

  ctx.beginPath()
  ctx.moveTo(top[0].x, top[0].y)
  for (let i = 1; i < top.length; i++) ctx.lineTo(top[i].x, top[i].y)
  const tail = points[points.length - 1]
  const tailPrev = points[points.length - 2]
  const tailAngle = Math.atan2(tail.y - tailPrev.y, tail.x - tailPrev.x)
  const finWag = Math.sin(t * 7) * 0.5
  const finLen = 13 + cheer * 4
  ctx.lineTo(
    tail.x + Math.cos(tailAngle + 0.5 + finWag) * finLen,
    tail.y + Math.sin(tailAngle + 0.5 + finWag) * finLen
  )
  ctx.lineTo(tail.x, tail.y)
  ctx.lineTo(
    tail.x + Math.cos(tailAngle - 0.5 + finWag) * finLen,
    tail.y + Math.sin(tailAngle - 0.5 + finWag) * finLen
  )
  for (let i = bottom.length - 1; i >= 0; i--) ctx.lineTo(bottom[i].x, bottom[i].y)
  ctx.closePath()
  ctx.fillStyle = '#f0a93a'
  ctx.fill()

  // belly stripe
  ctx.beginPath()
  ctx.moveTo(bottom[0].x, bottom[0].y)
  for (let i = 1; i < Math.min(bottom.length, 5); i++) ctx.lineTo(bottom[i].x, bottom[i].y)
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'
  ctx.lineWidth = 2
  ctx.stroke()

  // eye
  const head = points[0]
  const headNext = points[1]
  const headDx = headNext.x - head.x
  const headDy = headNext.y - head.y
  const headLen = Math.hypot(headDx, headDy) || 1
  const enx = -headDy / headLen
  const eny = headDx / headLen
  const eyeOffset = SIZES[0] * 0.5
  ctx.beginPath()
  ctx.arc(head.x + enx * eyeOffset, head.y + eny * eyeOffset, 1.6 + cheer * 0.5, 0, Math.PI * 2)
  ctx.fillStyle = '#4a3c2e'
  ctx.fill()
}

export function initFishCompanion(canvas) {
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches
  if (isCoarsePointer) {
    canvas.style.display = 'none'
    return
  }

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

  const startX = w * 0.5
  const startY = h * 0.8
  const points = Array.from(SIZES, () => ({ x: startX, y: startY }))

  // Slight anticipation (negative-leaning response) gives the fish a subtle
  // "wind up" before it commits to a new direction, instead of just chasing.
  const sodX = new SecondOrderDynamics(1.4, 0.7, -0.4, startX)
  const sodY = new SecondOrderDynamics(1.4, 0.7, -0.4, startY)

  const mouse = { x: startX, y: startY }
  let hasMouse = false
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX
    mouse.y = e.clientY
    hasMouse = true
  })
  window.addEventListener('mouseleave', () => { hasMouse = false })

  const bubbles = []
  window.addEventListener('click', (e) => {
    const head = points[0]
    const dx = e.clientX - head.x
    const dy = e.clientY - head.y
    if (Math.hypot(dx, dy) > 90) return
    cheerTarget = 1
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2 + Math.random() * 0.4
      const speed = 0.6 + Math.random() * 1
      bubbles.push({
        x: head.x, y: head.y,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 0.6,
        life: 1, r: 1.5 + Math.random() * 2.2,
        color: BUBBLE_COLORS[i % BUBBLE_COLORS.length],
      })
    }
  })

  let cheer = 0
  let cheerTarget = 0
  let prevTime = performance.now()
  const start = prevTime

  function tick(now) {
    const t = (now - start) / 1000
    const dt = Math.min((now - prevTime) / 1000, 0.05) || 0.016
    prevTime = now

    let targetX, targetY
    if (hasMouse) {
      targetX = mouse.x
      targetY = mouse.y
    } else {
      targetX = w * 0.5 + Math.sin(t * 0.35) * Math.min(w * 0.28, 220)
      targetY = h * 0.78 + Math.cos(t * 0.5) * Math.min(h * 0.1, 60)
    }

    points[0].x = sodX.update(dt, targetX)
    points[0].y = sodY.update(dt, targetY)
    updateChain(points)

    cheer += (cheerTarget - cheer) * 0.1
    cheerTarget *= 0.95

    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i]
      b.vy -= 0.015
      b.x += b.vx
      b.y += b.vy
      b.life -= 0.02
      if (b.life <= 0) bubbles.splice(i, 1)
    }

    ctx.clearRect(0, 0, w, h)

    bubbles.forEach((b) => {
      ctx.beginPath()
      ctx.arc(b.x, b.y, b.r * b.life, 0, Math.PI * 2)
      ctx.strokeStyle = b.color
      ctx.lineWidth = 1.4
      ctx.globalAlpha = b.life
      ctx.stroke()
    })
    ctx.globalAlpha = 1

    drawFish(ctx, points, t, cheer)

    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}
