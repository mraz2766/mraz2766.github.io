# 收藏图鉴 — Design Reference

> A dark room for looking at toys: one photo on show, quiet strips to browse, almost no words.

## Concept

- **The photo is the only loud thing.** Dark, warm-neutral room (`#0f0f0e`); no frames, borders or decoration around photos. Text is small (11–14px, one 20px exhibit name) and sparse.
- **Exhibit + strips.** Home opens on one large photo with three quiet lines beside it (name; English name · series; No. · camera · exposure). It advances every 7s with a hairline timer, pauses on hover/focus, and has ← 01 / 09 → controls. Below, horizontal strips: 精选, the four largest series, 猫与狗. Strips scroll/drag sideways; names appear only on hover.
- **Catalog.** Masonry grid with one-line labels (name ··· No.). Series filters, franchise select, Grid / Index views, 随机一件. The viewer shows the full specimen sheet.
- **Bilingual, but Chinese first and minimal.** Navigation and filters are Chinese only; English appears as small uppercase secondary labels where helpful.
- **Name kept small.** "mraz" appears only in the browser title and the footer copyright.
- **Light room optional.** Dark is the default; the header dot switches to a light room (remembered per browser).

## Tokens

| Token | Dark (default) | Light | Use |
|---|---|---|---|
| `--bg` | `#0f0f0e` | `#f6f5f2` | Room |
| `--fg` | `#e9e7e1` | `#171716` | Names, active nav |
| `--muted` | `#7f7d77` | `#86837c` | Everything secondary |
| `--line` | fg @ 28% | fg @ 24% | Rare structural rules |
| `--line-soft` | fg @ 10% | fg @ 9% | Row dividers |
| `--tile` | `#1a1a18` | `#e7e5e0` | Image placeholder |
| `--accent` | `#d6ad68` | `#a2702a` | Progress bar, focus, link underline (sparingly) |

Type: Chinese in `--font-serif` (Songti SC → Source Han/Noto Serif → SimSun), Latin in Helvetica-style `--font-sans`, numbers in `--font-mono`. Sizes: logo 13px, nav 12px, strip titles 13px, labels 13px / numbers 10–11px, exhibit name 20px (17px on phones). Letter-spacing 0.06–0.2em on Chinese for an airy feel.

## Motion & interaction

All motion is CSS or native APIs; framer-motion only for page/viewer fades via `LazyMotion`. Everything is disabled under `prefers-reduced-motion` (the exhibit also stops auto-advancing).

| Effect | Where |
|---|---|
| Exhibit cross-fade + hairline timer | Home hero |
| Fade-up reveal on scroll | Strips, headings |
| Curtain reveal (clip-path) | Catalog grid photos |
| Shared-element flight tile ↔ viewer, directional slide, finger-follow swipe | Viewer |
| Click / double-tap zoom with pointer pan (native zoom cursor) | Viewer |
| Circular theme reveal | Header dot (View Transitions API) |
| Drag-to-scroll | Home strips |
| Reading progress | 2px accent bar at the top |

No custom cursors, no parallax, no marquee — they compete with the photos.

## Do / Don't

- Do add item info in `src/data/catalog.js`; the hero, strips, labels and filters pick it up.
- Do keep new text small and muted; if a line isn't needed to enjoy the photo, leave it out.
- Don't add borders, shadows, rounded corners or coloured UI around photos.
- Don't enlarge headings to fill space — let the photos fill it.
