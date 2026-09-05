// A tile grid you can hover and click to send a color pulse rippling
// outward - same distance-based delay idea as a classic ripple effect,
// just recolored to the site's palette and tucked into a themed section
// instead of taking over the whole page.

const PALETTE = ['#ef6a53', '#f0ac3f', '#2f8f95', '#5f8d63']

export function initUnderwildGrid() {
  const container = document.getElementById('underwild-grid')
  if (!container) return

  const COLS = 18
  const ROWS = 9
  const tiles = []

  for (let i = 0; i < COLS * ROWS; i++) {
    const tile = document.createElement('div')
    tile.className = 'underwild-tile'
    tile.dataset.row = Math.floor(i / COLS)
    tile.dataset.col = i % COLS
    container.appendChild(tile)
    tiles.push(tile)
  }

  const randomColor = () => PALETTE[Math.floor(Math.random() * PALETTE.length)]

  tiles.forEach((tile) => {
    tile.addEventListener('mouseenter', () => {
      tile.style.backgroundColor = randomColor()
    })
    tile.addEventListener('mouseleave', () => {
      tile.style.backgroundColor = ''
    })
    tile.addEventListener('click', () => ripple(tile))
  })

  function ripple(clickedTile) {
    const clickedRow = +clickedTile.dataset.row
    const clickedCol = +clickedTile.dataset.col

    tiles.forEach((tile) => {
      const row = +tile.dataset.row
      const col = +tile.dataset.col
      const distance = Math.hypot(row - clickedRow, col - clickedCol)
      const delay = distance * 55
      const color = randomColor()

      setTimeout(() => {
        tile.style.backgroundColor = color
        tile.classList.add('is-pulsing')
      }, delay)

      setTimeout(() => {
        tile.classList.remove('is-pulsing')
        tile.style.backgroundColor = ''
      }, delay + 280)
    })
  }
}
