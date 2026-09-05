// A little Nimbit creature that follows the cursor around the page -
// pure canvas + trig/lerp math, same spirit as the background blobs.

function drawCreature(ctx, pos, vx, lean, squashX, squashY, bob, t, excited, blink) {
  ctx.save()
  ctx.translate(pos.x, pos.y + bob)
  ctx.rotate(lean)
  ctx.scale(squashX, squashY)

  const R = 22

  // ground shadow (counter-scaled so it doesn't squash with the body)
  ctx.save()
  ctx.scale(1 / squashX, 1 / squashY)
  ctx.beginPath()
  ctx.ellipse(0, R + 8, R * 0.65, 5, 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(43,36,64,0.14)'
  ctx.fill()
  ctx.restore()

  // body
  ctx.beginPath()
  ctx.arc(0, 0, R, 0, Math.PI * 2)
  ctx.fillStyle = '#5f8d63'
  ctx.fill()

  // belly
  ctx.beginPath()
  ctx.ellipse(0, R * 0.38, R * 0.52, R * 0.36, 0, 0, Math.PI * 2)
  ctx.fillStyle = '#fbf3e3'
  ctx.globalAlpha = 0.9
  ctx.fill()
  ctx.globalAlpha = 1

  // sprout on top, swaying
  ctx.save()
  ctx.translate(0, -R + 2)
  ctx.rotate(Math.sin(t * 2.2) * 0.18 - lean * 0.4)
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.quadraticCurveTo(-7, -9, 0, -17)
  ctx.quadraticCurveTo(7, -9, 0, 0)
  ctx.fillStyle = '#f0ac3f'
  ctx.fill()
  ctx.restore()

  // eyes (blink squashes vertical scale, excitement widens them)
  const eyeY = -R * 0.1
  const eyeOffsetX = R * 0.34
  const eyeH = Math.max(0.6, 3.4 * (1 - blink) + excited * 1.6)
  ;[-1, 1].forEach((side) => {
    ctx.beginPath()
    ctx.ellipse(side * eyeOffsetX, eyeY, 3.1 + excited, eyeH, 0, 0, Math.PI * 2)
    ctx.fillStyle = '#2b2440'
    ctx.fill()
  })

  // blush cheeks
  ctx.globalAlpha = 0.45
  ;[-1, 1].forEach((side) => {
    ctx.beginPath()
    ctx.arc(side * R * 0.58, R * 0.08, 3.4, 0, Math.PI * 2)
    ctx.fillStyle = '#ef6a53'
    ctx.fill()
  })
  ctx.globalAlpha = 1

  ctx.restore()
}

export function initCompanion(canvas) {
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

  const pos = { x: w * 0.5, y: h * 0.82 }
  const mouse = { x: pos.x, y: pos.y }
  let hasMouse = false
  let prevX = pos.x, prevY = pos.y

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX
    mouse.y = e.clientY
    hasMouse = true
  })
  window.addEventListener('mouseleave', () => { hasMouse = false })

  let excited = 0
  document.querySelectorAll('a, button, .btn, .feature-card, .gallery__item, .studio-card').forEach((el) => {
    el.addEventListener('mouseenter', () => { excited = 1 })
  })

  const burstColors = ['#ef6a53', '#f0ac3f', '#2f8f95', '#5f8d63']
  const burst = []
  window.addEventListener('click', (e) => {
    const dx = e.clientX - pos.x
    const dy = e.clientY - pos.y
    if (Math.hypot(dx, dy) > 90) return
    excited = 1.6
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2 + Math.random() * 0.3
      const speed = 1.4 + Math.random() * 1.8
      burst.push({
        x: pos.x,
        y: pos.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        life: 1,
        r: 2 + Math.random() * 2.4,
        color: burstColors[i % burstColors.length],
      })
    }
  })

  let blink = 0
  let nextBlinkAt = performance.now() + 1800 + Math.random() * 2500

  const trail = []
  const start = performance.now()

  function tick(now) {
    const t = (now - start) / 1000

    if (hasMouse) {
      pos.x += (mouse.x - pos.x) * 0.14
      pos.y += (mouse.y - pos.y) * 0.14
    } else {
      pos.x = w * 0.5 + Math.sin(t * 0.3) * 46
      pos.y = h * 0.82 + Math.cos(t * 0.5) * 12
    }

    const vx = pos.x - prevX
    const vy = pos.y - prevY
    prevX = pos.x
    prevY = pos.y
    const speed = Math.min(Math.hypot(vx, vy), 32)

    excited *= 0.93

    if (now > nextBlinkAt) {
      blink = 1
      nextBlinkAt = now + 2000 + Math.random() * 3000
    }
    blink *= 0.72

    if (speed > 5) {
      trail.push({ x: pos.x, y: pos.y - 6, life: 1, r: 1.5 + Math.random() * 2 })
    }
    for (let i = trail.length - 1; i >= 0; i--) {
      const p = trail[i]
      p.life -= 0.04
      p.y -= 0.25
      if (p.life <= 0) trail.splice(i, 1)
    }

    for (let i = burst.length - 1; i >= 0; i--) {
      const p = burst[i]
      p.vy += 0.08
      p.x += p.vx
      p.y += p.vy
      p.life -= 0.025
      if (p.life <= 0) burst.splice(i, 1)
    }

    ctx.clearRect(0, 0, w, h)

    trail.forEach((p) => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2)
      ctx.fillStyle = '#f0ac3f'
      ctx.globalAlpha = p.life * 0.5
      ctx.fill()
    })
    burst.forEach((p) => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2)
      ctx.fillStyle = p.color
      ctx.globalAlpha = p.life
      ctx.fill()
    })
    ctx.globalAlpha = 1

    const idleBob = Math.sin(t * 3) * 2.5 * (1 - Math.min(speed / 18, 1))
    const lean = Math.max(-0.32, Math.min(0.32, vx * 0.035))
    const squashX = 1 + Math.min(speed / 55, 0.22) - excited * 0.08
    const squashY = 1 - Math.min(speed / 55, 0.16) + excited * 0.16
    const bob = idleBob - excited * 6

    drawCreature(ctx, pos, vx, lean, squashX, squashY, bob, t, excited, blink)

    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}
