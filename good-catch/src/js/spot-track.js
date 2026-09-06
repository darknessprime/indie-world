// Drag-to-scroll horizontal strip, the classic percentage-based "Sliding
// Image Track" technique: track position is a percentage clamped to
// [-100, 0], driven by pointer delta relative to the container width.
export function initSpotTrack() {
  const track = document.getElementById('spot-track')
  if (!track) return

  track.dataset.percentage = '0'
  track.dataset.prevPercentage = '0'
  track.dataset.down = 'false'
  let downAtX = 0

  const wrap = track.parentElement

  function pointerX(e) {
    return e.touches ? e.touches[0].clientX : e.clientX
  }

  function onDown(e) {
    track.dataset.down = 'true'
    downAtX = pointerX(e)
    track.style.transition = 'none'
  }

  function onUp() {
    if (track.dataset.down !== 'true') return
    track.dataset.down = 'false'
    track.dataset.prevPercentage = track.dataset.percentage
  }

  function onMove(e) {
    if (track.dataset.down !== 'true') return
    const delta = downAtX - pointerX(e)
    const maxDelta = wrap.clientWidth
    const percentage = (delta / maxDelta) * -100
    const next = Math.max(Math.min(parseFloat(track.dataset.prevPercentage) + percentage, 0), -100)
    track.dataset.percentage = next
    track.style.transform = `translateX(${next}%)`
  }

  wrap.addEventListener('mousedown', onDown)
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
  wrap.addEventListener('touchstart', onDown, { passive: true })
  window.addEventListener('touchmove', onMove, { passive: true })
  window.addEventListener('touchend', onUp)
  wrap.style.cursor = 'grab'
  wrap.addEventListener('mousedown', () => { wrap.style.cursor = 'grabbing' })
  window.addEventListener('mouseup', () => { wrap.style.cursor = 'grab' })
}
