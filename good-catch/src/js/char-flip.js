// Shared-element transition inspired by Hyperplexed's "Magic Todo List":
// capture the clicked card's on-screen position (the FLIP "First"), render
// the focus card there with zero scale, then one tick later transition it to
// its centered target ("Last") - all via a single CSS transition, no library.

const DATA = {
  bear: {
    emoji: '🐻',
    name: 'Bear',
    tag: 'Unlocked',
    desc: 'Gain +1 more XP from all fish. Perfect catches restore 15 energy.',
  },
  locked1: { emoji: '❔', name: '???', tag: 'Locked', desc: 'Still being revealed before launch.' },
  locked2: { emoji: '❔', name: '???', tag: 'Locked', desc: 'Still being revealed before launch.' },
  locked3: { emoji: '❔', name: '???', tag: 'Locked', desc: 'Still being revealed before launch.' },
}

export function initCharFlip() {
  const focus = document.getElementById('char-focus')
  const cards = document.querySelectorAll('.char-card')
  if (!focus || !cards.length) return

  let card = null

  function buildCard(data) {
    const el = document.createElement('div')
    el.className = 'char-focus-card'
    el.innerHTML = `
      <button class="char-focus-card__close" aria-label="Close">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
      <div class="char-focus-card__portrait">${data.emoji}</div>
      <h3>${data.name}</h3>
      <p>${data.desc}</p>
      <span class="char-card__tag">${data.tag}</span>
    `
    el.querySelector('.char-focus-card__close').addEventListener('click', close)
    return el
  }

  function open(sourceEl) {
    const key = sourceEl.dataset.char
    const data = DATA[key]
    if (!data) return

    const rect = sourceEl.getBoundingClientRect()
    card = buildCard(data)
    document.body.appendChild(card)

    // First: pin it exactly over the clicked card, no transition yet.
    card.style.transition = 'none'
    card.style.left = `${rect.left + rect.width / 2}px`
    card.style.top = `${rect.top + rect.height / 2}px`
    card.style.width = `${rect.width}px`
    card.style.transform = 'translate(-50%, -50%) scale(1)'
    card.style.opacity = '0.4'

    focus.classList.add('is-open')

    // Force a paint of the "First" state before animating to "Last".
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        card.style.transition = 'left 450ms var(--ease), top 450ms var(--ease), width 450ms var(--ease), transform 450ms var(--ease), opacity 300ms var(--ease)'
        card.style.left = '50%'
        card.style.top = '50%'
        card.style.width = 'min(420px, 86vw)'
        card.style.transform = 'translate(-50%, -50%) scale(1)'
        card.style.opacity = '1'
      })
    })

    sourceEl.__flipRect = rect
    card.__sourceEl = sourceEl
  }

  function close() {
    if (!card) return
    const sourceEl = card.__sourceEl
    const rect = sourceEl ? sourceEl.getBoundingClientRect() : null
    focus.classList.remove('is-open')

    if (rect) {
      card.style.left = `${rect.left + rect.width / 2}px`
      card.style.top = `${rect.top + rect.height / 2}px`
      card.style.width = `${rect.width}px`
      card.style.opacity = '0'
    } else {
      card.style.opacity = '0'
    }

    const toRemove = card
    setTimeout(() => toRemove.remove(), 460)
    card = null
  }

  cards.forEach((c) => c.addEventListener('click', () => open(c)))
  focus.querySelector('.char-focus__backdrop').addEventListener('click', close)
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close() })
}
