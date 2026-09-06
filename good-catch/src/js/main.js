import { animate, stagger, onScroll } from 'animejs'
import { initBackgroundCanvas } from './background-canvas.js'
import { initFishCompanion } from './fish-companion.js'
import { initPreloader } from './preloader.js'
import { initKineticText } from './kinetic-text.js'
import { initIconDraw } from './icon-draw.js'
import { initMarquee } from './marquee.js'
import { initPondGrid } from './pond-grid.js'
import { initSpotTrack } from './spot-track.js'
import { initCurtainNav } from './curtain-nav.js'
import { initCharFlip } from './char-flip.js'
import {
  initCursor,
  initMagneticButtons,
  initCardTilt,
  initHeroParallax,
  initNavIndicator,
  initDraggableSticker,
  initHeroScrollFade,
} from './interactions.js'

initBackgroundCanvas(document.getElementById('bg-canvas'))
initFishCompanion(document.getElementById('companion-canvas'))
initCursor()
initMagneticButtons()
initCardTilt()
initHeroParallax()
initNavIndicator()
initDraggableSticker()
initHeroScrollFade()
initCurtainNav()
initCharFlip()
initSpotTrack()

// ---------- nav scroll state ----------
const nav = document.querySelector('.nav')
window.addEventListener('scroll', () => {
  nav.classList.toggle('is-scrolled', window.scrollY > 60)
}, { passive: true })

// ---------- marquee duplicate + anime.js-driven loop (pauses on hover) ----------
document.querySelectorAll('.marquee__track').forEach((track) => {
  track.innerHTML += track.innerHTML
})
initMarquee()

function isAlreadyInView(el) {
  const r = el.getBoundingClientRect()
  return r.top < window.innerHeight && r.bottom > 0
}

// ---------- scroll reveals (gated behind the preloader so the intro reads as one sequence) ----------
function initReveals() {
  const revealGroups = new Map()
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    const groupKey = el.getAttribute('data-reveal-group') || el
    if (!revealGroups.has(groupKey)) revealGroups.set(groupKey, [])
    revealGroups.get(groupKey).push(el)
  })

  revealGroups.forEach((els) => {
    const isGallery = els[0].classList.contains('gallery__item')
    const alreadyVisible = isAlreadyInView(els[0])
    const autoplay = alreadyVisible ? true : onScroll({ target: els[0], enter: 'bottom-=40 top' })

    if (isGallery) {
      animate(els, {
        clipPath: ['inset(0 0 100% 0)', 'inset(0% 0 0% 0)'],
        duration: 1000,
        delay: stagger(90),
        ease: 'outExpo',
        autoplay,
      })
      animate(els.map((el) => el.querySelector('img')), {
        scale: [1.18, 1],
        duration: 1100,
        delay: stagger(90),
        ease: 'outExpo',
        autoplay: alreadyVisible ? true : onScroll({ target: els[0], enter: 'bottom-=40 top' }),
      })
      return
    }

    animate(els, {
      opacity: [0, 1],
      translateY: [28, 0],
      duration: 900,
      delay: stagger(90),
      ease: 'outQuart',
      autoplay,
    })
  })
}

initPreloader(() => {
  initKineticText()
  initReveals()
  initIconDraw()
  initPondGrid()
})

// ---------- gentle hover bounce on cards (feature-card / char-card have their own tilt/hover) ----------
document.querySelectorAll('.gallery__item').forEach((el) => {
  el.addEventListener('mouseenter', () => {
    animate(el, { scale: [1, 1.03, 1], duration: 500, ease: 'outElastic(1, .6)' })
  })
})

// ---------- screenshot lightbox ----------
const galleryItems = Array.from(document.querySelectorAll('.gallery__item'))
const lightbox = document.getElementById('lightbox')
const lightboxImg = lightbox.querySelector('img')
let currentIndex = 0

function openLightbox(index) {
  currentIndex = index
  lightboxImg.src = galleryItems[index].querySelector('img').src
  lightbox.classList.add('is-open')
  animate(lightboxImg, { opacity: [0, 1], scale: [0.92, 1], duration: 350, ease: 'outQuad' })
}
function closeLightbox() {
  lightbox.classList.remove('is-open')
}
function showDelta(delta) {
  currentIndex = (currentIndex + delta + galleryItems.length) % galleryItems.length
  lightboxImg.src = galleryItems[currentIndex].querySelector('img').src
  animate(lightboxImg, { opacity: [0.3, 1], duration: 250, ease: 'outQuad' })
}

galleryItems.forEach((item, i) => item.addEventListener('click', () => openLightbox(i)))
lightbox.querySelector('[data-close]').addEventListener('click', closeLightbox)
lightbox.querySelector('[data-prev]').addEventListener('click', () => showDelta(-1))
lightbox.querySelector('[data-next]').addEventListener('click', () => showDelta(1))
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox() })
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('is-open')) return
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowRight') showDelta(1)
  if (e.key === 'ArrowLeft') showDelta(-1)
})
