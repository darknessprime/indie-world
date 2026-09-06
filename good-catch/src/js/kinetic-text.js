import { animate, stagger, onScroll, splitText } from 'animejs'

function isAlreadyInView(el) {
  const r = el.getBoundingClientRect()
  return r.top < window.innerHeight && r.bottom > 0
}

export function initKineticText() {
  document.querySelectorAll('[data-kinetic]').forEach((el) => {
    const splitter = splitText(el, { words: { wrap: 'hidden' } })
    el.classList.add('is-split')
    const alreadyVisible = isAlreadyInView(el)
    animate(splitter.words, {
      translateY: ['110%', '0%'],
      duration: 1500,
      delay: stagger(80),
      ease: 'outQuad',
      autoplay: alreadyVisible
        ? true
        : onScroll({ target: el, enter: 'bottom-=60 top' }),
    })
  })
}
