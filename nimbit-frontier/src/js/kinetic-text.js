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
      translateY: ['115%', '0%'],
      rotateZ: [4, 0],
      duration: 950,
      delay: stagger(45),
      ease: 'outExpo',
      autoplay: alreadyVisible
        ? true
        : onScroll({ target: el, enter: 'bottom-=60 top' }),
    })
  })
}
