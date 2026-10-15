# mraz 收藏图鉴 — Design Reference

> A Swiss-grid photo site that reads like a museum catalog: every photograph is an item with a number and a label.

## Concept

- **Content first.** 116 of 125 photos are toys and figures, so the site is organised as a *collection catalog*, not a fashion-style portfolio. Pets appear as a "special collection" (特别收录).
- **Name kept small.** "mraz" appears only in the header logo, the browser title and the footer copyright; the masthead and footer use 收藏图鉴 instead.
- **Swiss base.** Flat surfaces, hairline rules, a strict grid, one strong grotesk wordmark. No shadows, gradients, rounded corners or cards.
- **Museum labels.** Under every photo sits a specimen label: catalog number in mono, Chinese name in serif, English name in grotesk, franchise in small caps.
- **Bilingual.** Chinese leads, English follows on the same line (`图鉴 CATALOG`). Chinese uses a serif (Songti), English uses Helvetica-style grotesk, numbers use mono.
- **Light + dark.** Follows the OS; a toggle in the header overrides it (remembered per browser). The photo viewer is always near-black.

## Tokens

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#ffffff` | `#0e0e0d` | Page background |
| `--fg` | `#0b0b0b` | `#ecebe6` | Text, structural rules |
| `--muted` | `#6f6f6c` | `#8d8c87` | Secondary text, English sub-labels |
| `--line` | = fg | = fg | Section rules, label top rule |
| `--line-soft` | fg @ 14% | fg @ 16% | Row dividers, idle photo frames |
| `--tile` | `#ecebe7` | `#1b1b19` | Image placeholder |
| `--accent` | `#e5251d` | `#ff4a3d` | Active nav / link underline, focus ring |

Chromatic frames (`--color-{vermillion,cobalt,marigold,fern,brass}-frame`) are sampled per photo by `scripts/update-gallery.js` and only appear on hover/focus.

### Type

| Role | Family | Notes |
|---|---|---|
| Masthead 收藏图鉴 | `--font-serif` 700 | 64–156px, characters rise in one by one |
| Logo `mraz` | `--font-sans` 700 | Header only, 22px |
| Chinese | `--font-serif` (Songti SC → Source Han Serif → Noto Serif SC → SimSun) | System fonts only — no web-font download |
| English labels | `--font-sans` 700, uppercase, ~0.74em of the Chinese | Always follows the Chinese |
| Numbers | `--font-mono` | Catalog numbers `No.047`, counts, EXIF |

Use the `<Bi zh="…" en="…" />` component for any bilingual label so spacing and sizing stay consistent.

### Spacing

`--gutter` 28px (16px on phones), `--gap` 15px (10px), `--section-gap` 96px (64px).

## Components

- **Specimen card** (`.specimen-card` + `<SpecimenLabel>`): photo in a hairline frame, then a 1px rule and the label. Frame takes the photo's colour on hover.
- **Section head** (`.section-head`): top rule, mono number (`01`), bilingual title, optional link on the right.
- **Index list** (`.index-list`): franchise rows with mono number, dotted leader and count — like a book's table of contents.
- **Catalog toolbar**: sticky; series links, franchise `<select>`, Grid / Index view toggle. All state lives in the URL (`/works/toys?f=marvel&view=index&photo=…`).
- **Index table**: accession-register view with No., thumbnail, name, series, maker, scale, year, camera.
- **Specimen sheet** (lightbox): photo left, label + data list right (stacked on phones), always on near-black.

## Motion & interaction

All motion is CSS or native APIs (IntersectionObserver, Web Animations, View Transitions); framer-motion is only used for page/lightbox fades via `LazyMotion`. Everything is disabled under `prefers-reduced-motion`. Helpers live in `src/lib/motion.jsx` and `src/lib/flight.js`.

| Effect | Where | How |
|---|---|---|
| Curtain reveal | Photos (catalog, home, about) | `<Reveal>` adds `.is-revealed`; `.specimen-frame` clip-path opens bottom→top, image settles from 1.18 scale, label follows 350ms later; siblings staggered with `delay` |
| Rule draw | Section heads | `::before` hairline scales in from the left |
| Character rise | Home masthead | `.stagger-char` with `--i` delay |
| Count-up | Home meta, About inventory | `<CountUp>` (rAF, ease-out cubic) when first visible |
| Shared-element flight | Grid tile ↔ viewer | `rememberFlightSource` on click → `fly()` clones the image and animates rect→rect; reverse on close |
| Directional slide | Viewer prev/next | `.enter-next` / `.enter-prev` keyframes; swipe drags the photo with the finger |
| Zoom & pan | Viewer | Click (double-tap on phones) → 2.4× scale, `transform-origin` follows the pointer |
| Theme reveal | Header toggle | View Transitions API circular clip from the click point |
| Hover preview | Home index | Fixed thumbnail follows the cursor over franchise rows |
| View cursor | Any `[data-cursor]` | Trailing 78px disc with a bilingual label (desktop only) |
| Ticker | Footer | Seamless `translateX(-50%)` loop, pauses on hover |
| Progress | Top of page | 2px accent bar scaled by scroll position |

Guidelines: durations 0.4–1.0s with `--ease-editorial`; stagger 40–80ms; never animate layout properties; anything that moves must have a reason (reveal, continuity or feedback).

## Do / Don't

- Do let the photograph carry colour; chrome stays black/white (or white/black in dark).
- Do put new item info in `src/data/catalog.js` — labels, index and filters update automatically.
- Don't add shadows, rounded corners, filled buttons or gradients.
- Don't show English without Chinese for navigation and headings (long English body copy may stand alone).
