import { animate, stagger, onScroll, createDrawable } from 'animejs'

function isAlreadyInView(el) {
  const r = el.getBoundingClientRect()
  return r.top < window.innerHeight && r.bottom > 0
}

export function initIconDraw() {
  document.querySelectorAll('.feature-card .icon svg').forEach((svg) => {
    const shapes = createDrawable(svg.querySelectorAll('path, circle, rect, line, polyline, polygon'))
    const card = svg.closest('.feature-card')
    const alreadyVisible = isAlreadyInView(card)
    animate(shapes, {
      draw: ['0 0', '0 1'],
      duration: 650,
      delay: stagger(70),
      ease: 'inOutQuad',
      autoplay: alreadyVisible
        ? true
        : onScroll({ target: card, enter: 'bottom-=40 top' }),
    })
  })
}
