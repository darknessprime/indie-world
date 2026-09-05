// A tile grid you can hover and click to send a color pulse rippling
// outward - distance-based delay per tile, recolored to the site palette,
// framed as the pond every catch disturbs.

const PALETTE = ['#7fb8b0', '#a8c04e', '#f0a93a', '#a9773f']

export function initPondGrid() {
  const container = document.getElementById('pond-grid')
  if (!container) return

  const COLS = 18
  const ROWS = 9
  const tiles = []

  for (let i = 0; i < COLS * ROWS; i++) {
    const tile = document.createElement('div')
    tile.className = 'pond-tile'
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
