# Hyperplexed CodePen catalog — technique reference

Full read-through of all 119 unique public pens (codepen.io/Hyperplexed), 2017–2026.
Organized by the underlying technique/pattern, not chronologically. Hash = the CodePen
pen ID, e.g. `codepen.io/Hyperplexed/pen/<hash>`.

## Mouse-follow / cursor-driven effects
- **Canva's Magic Mouse Effect** (`OJdpEME`) — spawns star-shaped divs at intervals along
  the cursor path (throttled by distance + time), each animated with CSS `@keyframes` and
  removed after. Glow trail via a second lagging "glow point" layer.
- **Intelligent Mouse Trailer** (`abYJQxP`) — single trailing dot using `Element.animate()`
  (Web Animations API, not CSS transitions) to tween to `clientX/Y - offset` over 800ms;
  scales up 8x when hovering an interactive element.
- **Hover Glide Image Gallery** (`VwXXPKJ`) — a big image pans opposite to mouse position
  (parallax) by mapping mouse decimal (0-1 across viewport) to `translate` within the
  image's overflow bounds.
- **Interactive Liquid Footer** (`abYjPXx`) — literally just spawns small `.bubble` divs at
  cursor X on every `mousemove`, styled/animated via CSS to float and fade — "just divs,"
  no canvas.
- **Mousemove Image Gallery** (`BaxROox`) — images placed at cursor position on move,
  only if moved >N px from the last placed image (distance-gated), stacked with
  incrementing z-index — classic "trailing image gallery" effect.
- **Magic Wand Reveal** (`wvQzbGz`) — a wand image follows the cursor; tiles underneath
  reveal/light up based on distance from the wand tip.
- **Musical Blob [GPT-4o prompted]** (`wvbyoLJ`) — real WebGL fragment shader (hash-based
  noise, `u_time`/`u_audioData` uniforms) driving an audio-reactive blob. Notable as an
  example of an AI-generated shader effect.

## Card / element hover effects
- **Magical Hover Effect** (`MWQeYLW`) — the classic spotlight-follows-cursor card: sets
  `--mouse-x`/`--mouse-y` CSS custom properties from `getBoundingClientRect()`-relative
  cursor position, used in a `radial-gradient` for the glow (pure CSS + one JS listener).
- **Gradient Hover Card Effect**, **Fancy Gradient Hover Links** — same custom-property
  + radial-gradient pattern, applied to text links and card subtitles (staggered per-word
  reveal via per-span `transitionDelay`).
- **Evervault Hover Effect** (`VwqLQbo`) — scrambles a card's overlay text through random
  characters within a radius of the cursor (classic "encrypted card" look).
- **Hacked Text Effect** / **Hover, If You Dare** — the "matrix decode" text scramble:
  on hover, repeatedly randomizes each character then locks it in left-to-right via an
  iteration counter, using `setInterval`.
- **Kippo Hover Card Effect**, **The Circle (Netflix) UI** — swap/carousel of stacked
  cards via a `data-index` attribute and CSS attribute-selector transitions (no JS
  animation library, just toggling data attributes and letting CSS transitions do the work
  — this is a recurring pattern across many of his pens).
- **Tilt Hover Effect + Flying Chef** — 3D tilt card (mouse position → rotateX/Y) combined
  with a separate playful sprite animation triggered on hover.
- **Turbulent Hover Effect**, **Accent Shard (On Hover)**, **Gradient Border Effect** —
  pure-CSS pens (no JS at all) — worth opening directly in-browser since the technique is
  entirely in the CSS (custom properties + `filter`/`mask`/gradient tricks).
- **Futuristic Card Effect** / **Glowing Blob Effect** (`vYzgeYE`, `KKBjvbG`) — a glow
  blob that follows the pointer via `Element.animate()` (WAAPI, `fill:"forwards"`, 3000ms)
  combined with the hacked-text scramble on the heading — this is the "Sprite Zero Limits"
  recreation, his most-loved pen (70,959 views).

## Menus / navigation
- **Curtain Reveal Menu** (`gOzJgWm`) — studied in full earlier: two elements with opposite
  synchronized `translateY` transforms + `overflow:hidden` clipping = a "curtain lifts"
  full-screen nav reveal. No JS animation, just one toggled `data-nav` attribute.
- **Off The Wall Image Menu**, **Parallax Menu Effect** — nav links each get an
  associated image; on hover, `menu.dataset.activeIndex` is set and CSS attribute
  selectors show/position the matching image (same data-attribute-driven CSS pattern).
- **Radial Nav Menu** (React) — menu options arranged in a circle, staggered
  `transitionDelay` per item based on index for a cascading fan-out reveal.
- **Space Nav**, **Discord Side Nav** — full nav-toggle patterns via class toggling;
  Discord one recreates the whole tab-switching sidebar in vanilla JS with a content-ID
  enum switch statement.
- **Infinite Context Menu** (`VwQaWWw`, 40KB, TypeScript-compiled) — the largest/most
  complex menu pen; a context menu with vertical/horizontal direction enums, appears to
  implement infinitely-nested submenus with directional flip logic (worth a full read if
  building a real context-menu component).

## Text effects
- **Magical Text Effect** — randomly repositions small "star" divs (`--star-left/top`
  custom props) and restarts their CSS animation by toggling `element.style.animation`
  off then on (forces animation restart — a useful vanilla-JS trick in general).
- **Hulu Originals Intro** — GSAP `SplitText` + timeline sequencing multiple blur/opacity/
  scale keyframes for a logo-reveal intro, chained with relative-position labels (`"-=50%"`).
- **Crazy Rumble Type Effect**, **Codevember Typing Speed Test** — character-by-character
  DOM manipulation for typing effects/games.

## Canvas / generative / physics
- **Polyrhythmic Spiral** (`XWxqgGE`) — hand-reverse-engineered from a YouTube video;
  pure canvas 2D math, spiral generated from layered sine waves at different frequencies
  ("polyrhythmic" = multiple independent periodic motions summed). Good canvas-math
  reference distinct from the procedural-animation chain technique already studied.
- **Living Shapes** (`poVpKdQ`) — organic blob shapes morphing between preset
  `{configuration, roundness}` combinations (likely CSS `border-radius` % combinations
  animated between random presets) — cheap, no canvas needed.
- **Squid Game Prize Counter** — slot-machine/odometer digit roulette: each digit column
  cycles through 0-9 with staggered stop times and extra "spin" iterations before landing
  on the target digit, formatted via `Intl.NumberFormat`.
- **Target Practice** (`QWOEVJW`) — canvas-based balloon-popping game with a `State`
  object tracking balloon physics.
- **Audio Visualizer w/ ParticlesJS** — combines the particles.js library with real-time
  `AnalyserNode` audio data to modulate particle color/magnitude.
- **Fancy Digital Clock**, **Watch Timer** — React components mapping digit arrays to
  animated character-slide displays.

## Full-page redesigns/clones (structure reference, not novel effects)
Goodreads, Netflix, Amazon, Google Search, Roblox Login, Twitter, Serebii, Steam
(mobile ×2), Costco, Quora, Wiki, Rotten Tomatoes, Ticketmaster→YT Music, Mario UI,
Sassy Search Bar, App Menu With Lock Screen, Google Pixel Lock Screen. These are mostly
useful for layout/UX patterns and the "data-attribute + CSS transition" state-toggling
style he uses everywhere rather than any single unique effect.

## Recurring architectural pattern worth adopting broadly
Across almost every pen, the same lightweight pattern repeats instead of a JS animation
library: **toggle a `data-*` attribute (or class) on a parent element via one JS one-liner,
and let CSS attribute-selectors (`[data-nav="true"] > .thing`) + `transition`/`animation`
do 100% of the visual work.** This keeps JS tiny (many pens are under 1KB of JS) and
performance cheap since the browser handles the actual animation. Worth using this as the
default approach for simple toggle-driven UI (menus, tabs, settings panels) instead of
reaching for JS animation on every interaction.

## Deep-dived separately (full source studied, not just skimmed)
- Curtain Reveal Menu — CSS-only curtain nav (see above)
- Double Helix Gallery (github.com/githyperplexed/double-helix-gallery) — CSS3D rotating
  cylinder gallery, two strands via phase offset, drag+momentum physics
- Futuristic Card Effect / Evervault Hover Effect — see Card effects section above

## Deep dive: the four flagged pens, fully read (not skimmed)

### Polyrhythmic Spiral (`XWxqgGE`) — the pendulum-wave technique
N concentric rings (21), each an independent oscillator with a **linearly-scaled angular
velocity**: `velocity = ((maxCycles - index) * 2π) / duration`. Ring 0 has the most cycles
(fastest), the outermost ring the fewest (slowest). All rings start in phase at t=0; because
their speeds differ by a constant step, they drift apart and then **periodically re-align**
at the shared `duration` — this is the classic physics "pendulum wave" demo, purely in
2D canvas. Each ring draws a static track (arc with a gap, opacity pulses briefly after
each "impact"), two fixed impact-point markers, and one moving dot at
`angle = (π + elapsedTime·velocity) mod 2π`. Sound: each ring owns a note (vibraphone
sample); played when `currentTime >= nextImpactTime`, and the next impact is scheduled
recursively as `nextImpactTime += (π/velocity)·1000` (each half-turn = one beat). Net
result: an audio-visual instrument that's periodic, self-syncing, and needs no external
timing engine — just N independent constant-velocity oscillators.
**Reusable idea**: any "N elements at linearly-scaled speeds, same start point" setup
self-organizes into a pendulum-wave visual — works for dots, bars, particles, anything.

### Musical Blob (`wvbyoLJ`) — SDF gooey blob, and an honest AI-collab case study
The comment block documents all 32 ChatGPT prompts used to build this, **including the
failures**: mouse-interactive liquid distortion was attempted three times and abandoned,
audio-reactive "spike" tendrils were attempted and abandoned, giving the blob a face was
abandoned. Worth reading as a realistic picture of iterative shader prompting — most
ambitious asks didn't survive, the shipped version is the fallback that worked.
The technique that *did* ship: a signed-distance-field circle (`dist = length(uv) - radius`)
warped by two octaves of gradient noise before the edge test — `smoothstep(edgeThickness,
0.0, dist + noise)` — producing "lava lamp" splotchy edges cheaply, no fluid sim needed.
Color is a seamless-looping 2-tone gradient: `t = fract(uv.x·scale - time·speed)`, mixed
via a triangle wave (`t<0.5 ? mix(a,b,2t) : mix(b,a,2(t-0.5))`) so the start/end color match
and the loop never jump-cuts. Audio reactivity: `AnalyserNode.getByteFrequencyData()`
averaged and normalized into `u_audioData`, which scales the SDF radius — the blob pulses
to the beat. Single-pass shader, no ping-pong render targets — far cheaper than the full
GPGPU wave sim studied earlier, good enough for an ambient "breathing" hero blob.

### Magic Todo List (`abEqWxe`) — manual FLIP shared-element transitions
Not drag physics — it's a **shared-element transition system**, hand-rolled without any
animation library (no Framer Motion, no GSAP Flip plugin). Mechanism: click a category
icon → for each matching item, capture its *current* rect via
`document.getElementById(...).getBoundingClientRect()` (the "initial" position) → render it
positioned there → one tick later (`setTimeout(..., 1)`, just long enough to force a paint)
→ update its position to a computed target (a circular layout:
`angle = index·(2π/count)`, `pos = center + radius·[cos,sin] − size/2`) → let a CSS
`transition: left, top` animate between the two. This is a manual implementation of the
FLIP technique (First-Last-Invert-Play). The nice extra touch: when the *previous* category's
items return to the scrolling track, their target position is offset by
`sumSize·0.6·(duration/trackDuration)` to compensate for how far the track itself will have
scrolled during the transition — so they land back where the moving train actually is, not
where it was when the transition started.
**Reusable idea**: click a thumbnail from a grid, have it (and its siblings) fly into a
focused circular/detail layout, fly back on close — no library required, ~40 lines of
position math plus a CSS transition.

### Infinite Context Menu (`VwQaWWw`) — boundary-aware cascading submenus
The genuinely valuable part has nothing to do with the "infinite" joke content (it's an
easter egg: a submenu action that recursively spawns "More options" → "Even more options"
→ ... → "ಠ_ಠ" if you keep clicking it). The real engineering: **every new submenu checks
viewport boundaries before choosing which direction to expand.** Each level tracks a
`{lateral: Left|Right|None, vertical: Up|Down}` direction, computed from the *previous*
level's `getBoundingClientRect()` versus `window.innerWidth/innerHeight`: if expanding
right would overflow the viewport, flip to left (and vice versa); if both directions would
overflow, collapse to `None`; same up/down logic vertically. Each submenu's direction
decision is pushed onto a `history` array so nested chains inherit and re-validate their
ancestor's choice rather than recomputing from scratch. This is the same core problem every
dropdown/tooltip/context-menu library solves (Radix, Floating UI, etc.) — implemented here
in plain TypeScript with no dependency.
**Reusable idea**: this exact boundary-flip logic is what any nested menu, tooltip, or
popover on our sites needs so it never renders off-screen near an edge.
