# prem.tamanam — portfolio

A personal portfolio for Prem Tamanam, ninth grade, San Diego. Four real
projects and almost nothing else, because that is the actual state of things.
The page is a demonstration of craft the work hasn't caught up to yet.

Type-led, monochrome, mostly empty on purpose.

## Run it

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
npm run preview  # serve the built site
```

Deploys as a Render static site; `render.yaml` is at the repo root. Build
command `npm run build`, publish path `./dist`. There is no server and no
runtime dependency.

## Stack

| Piece | Why |
| --- | --- |
| Astro 7, static output | Ships HTML with no framework runtime. |
| `@astrojs/react` | Only for the three React Bits components. |
| GSAP 3.13 + ScrollTrigger + SplitText | Scrub, entrances, the horizontal run. |
| Lenis | Smooth scroll, driven from the GSAP ticker. |
| `@fontsource-variable` Archivo + JetBrains Mono | Self-hosted, latin subset, no CDN. |
| React Bits | `VariableProximity`, `CountUp`, `BlurText`. Adapted, not dropped in. |

No CSS framework. All styling is hand-written against custom properties in
`src/styles/`.

## Motion

- One ticker: `lenis.on('scroll', ScrollTrigger.update)`, then
  `gsap.ticker.add(t => lenis.raf(t * 1000))` and `gsap.ticker.lagSmoothing(0)`.
- `gsap.defaults({ duration: 0.5, overwrite: false })`. Entrances are fast and
  dry; the weight comes from the scrub.
- Every text scrub is `start: 'top center'`, `end: 'bottom center'`,
  `scrub: true`.
- **No ScrollTrigger pins.** The hero and the four work rows use CSS
  `position: sticky`, and the playground's horizontal run lives inside a
  sticky stage whose height is `100svh` plus the measured travel distance.
- Two theme groups flip by scrubbing `background-color` with
  `start: 'top 12%', end: 'bottom 12%'`.
- Masked text wrappers use `overflow: clip`, not `hidden`, so there is no
  scroll-anchoring jump.
- `prefers-reduced-motion: reduce` kills Lenis, kills the scrub, unpins
  everything and paints final states immediately.

## Imagery

There are no photographs, no stock images and no AI-generated faces anywhere.
Every visual is drawn at runtime:

- `src/scripts/art.ts` — four canvas pieces, one per project, each drawn from
  that project's own subject matter and only animating while on screen.
- `src/scripts/field.ts` — the playground's pointer-reactive lattice.
- `public/favicon.svg` — a hand-written mark.

## Content

Project facts live in `src/data/projects.ts`. Everything there was supplied and
measured; nothing is invented. Two repos are private and are labelled as such
rather than linked.

## Third-party

`src/react/` is adapted from [React Bits](https://reactbits.dev) under MIT +
Commons Clause. See `src/react/NOTICE.md` for what changed.
