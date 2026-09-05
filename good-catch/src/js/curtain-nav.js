// Full-screen curtain-reveal nav, studied from Hyperplexed's "Curtain Reveal
// Menu": no JS animation at all, just one toggled data attribute + CSS
// transitions on two layers moving in sync (blur the page back, slide the
// link panel up).
export function initCurtainNav() {
  const burger = document.getElementById('nav-burger')
  const curtain = document.getElementById('curtain-nav')
  if (!burger || !curtain) return

  const close = () => { document.body.dataset.curtain = 'false' }
  const toggle = () => {
    document.body.dataset.curtain = document.body.dataset.curtain === 'true' ? 'false' : 'true'
  }

  burger.addEventListener('click', toggle)
  curtain.querySelectorAll('a').forEach((a) => a.addEventListener('click', close))
  curtain.addEventListener('click', (e) => { if (e.target === curtain) close() })
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close() })
}
