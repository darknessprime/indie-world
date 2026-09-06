// Cursor, magnetic buttons, card tilt, hero parallax, the nav's magic-line
// indicator, and the draggable hero sticker - the small pointer-driven
// touches that make a page feel premium.

import { animate, createDraggable, onScroll } from 'animejs'

const isFinePointer = () => window.matchMedia('(pointer: fine)').matches

export function initCursor() {
  if (!isFinePointer()) return
  document.documentElement.classList.add('has-custom-cursor')

  const ring = document.getElementById('cursor-ring')
  const dot = document.getElementById('cursor-dot')
  if (!ring || !dot) return

  const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
  const ringPos = { ...mouse }

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX
    mouse.y = e.clientY
    dot.style.transform = `translate(${mouse.x}px, ${mouse.y}px) translate(-50%, -50%)`
  })

  document.querySelectorAll('a, button, .btn, .ticket-card, .gallery__item, .studio-card, .char-card, .spot-card').forEach((el) => {
    el.addEventListener('mouseenter', () => ring.classList.add('is-hover'))
    el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'))
  })

  function tick() {
    ringPos.x += (mouse.x - ringPos.x) * 0.22
    ringPos.y += (mouse.y - ringPos.y) * 0.22
    ring.style.transform = `translate(${ringPos.x}px, ${ringPos.y}px) translate(-50%, -50%)`
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

export function initMagneticButtons() {
  if (!isFinePointer()) return
  document.querySelectorAll('.btn').forEach((el) => {
    let tx = 0, ty = 0
    let pressed = false
    const apply = () => {
      el.style.transform = `translate(${tx}px, ${ty}px) scale(${pressed ? 0.94 : 1})`
    }
    el.addEventListener('mouseenter', () => {
      el.style.transition = 'transform 0.15s ease-out'
    })
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect()
      tx = (e.clientX - (r.left + r.width / 2)) * 0.28
      ty = (e.clientY - (r.top + r.height / 2)) * 0.32
      apply()
    })
    el.addEventListener('mousedown', () => {
      pressed = true
      el.style.transition = 'transform 0.1s ease-out'
      apply()
    })
    el.addEventListener('mouseup', () => {
      pressed = false
      el.style.transition = 'transform 0.25s ease-out'
      apply()
    })
    el.addEventListener('mouseleave', () => {
      tx = 0
      ty = 0
      pressed = false
      el.style.transition = 'transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)'
      apply()
    })
  })
}

export function initCardTilt() {
  if (!isFinePointer()) return
  document.querySelectorAll('.ticket-card, .char-card').forEach((card) => {
    const glare = document.createElement('div')
    glare.className = 'card-glare'
    card.appendChild(glare)

    card.addEventListener('mouseenter', () => card.classList.add('is-tilting'))
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width
      const py = (e.clientY - r.top) / r.height
      const rx = (py - 0.5) * -10
      const ry = (px - 0.5) * 10
      card.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`
      glare.style.background = `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,0.55), transparent 60%)`
    })
    card.addEventListener('mouseleave', () => {
      card.classList.remove('is-tilting')
      card.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.3s, box-shadow 0.35s'
      card.style.transform = ''
      glare.style.background = 'transparent'
      setTimeout(() => { card.style.transition = '' }, 520)
    })
  })
}

export function initHeroParallax() {
  if (!isFinePointer()) return
  const hero = document.querySelector('.hero')
  const content = document.querySelector('.hero__content')
  const art = document.querySelector('.hero__art')
  if (!hero) return

  hero.addEventListener('mousemove', (e) => {
    const r = hero.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    if (content) content.style.transform = `translate(${px * -12}px, ${py * -10}px)`
    if (art) art.style.transform = `translateY(-50%) translate(${px * 20}px, ${py * 16}px)`
  })
  hero.addEventListener('mouseleave', () => {
    if (content) content.style.transform = ''
    if (art) art.style.transform = 'translateY(-50%)'
  })
}

export function initNavIndicator() {
  const container = document.querySelector('.nav__links')
  const indicator = document.querySelector('.nav__indicator')
  if (!container || !indicator) return

  container.querySelectorAll('a').forEach((link) => {
    link.addEventListener('mouseenter', () => {
      const cRect = container.getBoundingClientRect()
      const r = link.getBoundingClientRect()
      animate(indicator, {
        left: r.left - cRect.left - 10,
        width: r.width + 20,
        opacity: 1,
        duration: 350,
        ease: 'outQuint',
      })
    })
  })
  container.addEventListener('mouseleave', () => {
    animate(indicator, { opacity: 0, duration: 250, ease: 'outQuad' })
  })
}

export function initDraggableSticker() {
  const el = document.getElementById('hero-sticker')
  const hero = document.querySelector('.hero')
  if (!el || !hero) return
  createDraggable(el, {
    container: hero,
    releaseStiffness: 40,
    releaseEase: 'outElastic(1, .5)',
  })
}

export function initHeroScrollFade() {
  const hero = document.querySelector('.hero')
  const content = document.querySelector('.hero__content')
  const art = document.querySelector('.hero__art')
  if (!hero) return
  const targets = [content, art].filter(Boolean)
  if (!targets.length) return

  animate(targets, {
    opacity: [1, 0.1],
    ease: 'linear',
    autoplay: onScroll({ target: hero, enter: 'top top', leave: 'top bottom', sync: true }),
  })
}
