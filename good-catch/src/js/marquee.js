import { animate } from 'animejs'

export function initMarquee() {
  document.querySelectorAll('.marquee').forEach((marquee) => {
    const track = marquee.querySelector('.marquee__track')
    if (!track) return
    track.style.animation = 'none'
    const anim = animate(track, {
      translateX: ['0%', '-50%'],
      duration: 30000,
      loop: true,
      ease: 'linear',
    })
    marquee.addEventListener('mouseenter', () => anim.pause())
    marquee.addEventListener('mouseleave', () => anim.play())
  })
}
