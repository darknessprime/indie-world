import { animate } from 'animejs'

export function initPreloader(onDone) {
  const el = document.getElementById('preloader')
  if (!el) {
    onDone && onDone()
    return
  }
  const bar = el.querySelector('.preloader__bar span')
  const duration = 850
  const start = performance.now()

  function tick(now) {
    const p = Math.min((now - start) / duration, 1)
    bar.style.width = `${p * 100}%`
    if (p < 1) requestAnimationFrame(tick)
    else finish()
  }

  function finish() {
    animate(el, {
      opacity: [1, 0],
      duration: 550,
      ease: 'outQuad',
      onComplete: () => {
        el.remove()
        onDone && onDone()
      },
    })
  }

  requestAnimationFrame(tick)
}
