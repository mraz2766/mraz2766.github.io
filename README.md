# mraz — 收藏图鉴 · A Catalog

Personal photo catalog of toys, pets and light, deployed to GitHub Pages at <https://mraz2766.github.io/>.
Design reference (dark room, minimal type) is in [`DESIGN.md`](./DESIGN.md).

## Features

*   **Home 首页** — a dark-room exhibit: one large photo with name / series / EXIF that slowly cycles through the selection, then horizontal strips for 精选, the largest series and 猫与狗.
*   **Catalog 图鉴** — `/works`, `/works/toys`, `/works/pets`; franchise filter (`?f=marvel`), Grid / Index table views (`?view=index`), 随机一件 random pick.
*   **Viewer** — specimen sheet beside the photo; the open photo lives in the URL (`?photo=<slug>`). Arrow keys, Esc, swipe, click / double-tap zoom with pan, tile ↔ viewer flight.
*   **Dark by default** — light room available from the header dot.
*   **Static image pipeline** — WebP thumbnails (720px) and viewing images (1920px), EXIF-aware dimensions, orphan cleanup.

## Tech Stack

*   React 19, React Router 7, Framer Motion (via `LazyMotion`), Vite
*   Sharp + ExifReader for the image pipeline
*   GitHub Actions → GitHub Pages

## Development

```bash
npm install
npm run dev           # local dev server
npm run gen-gallery   # regenerate derivatives + public/photos.json
npm run build         # gen-gallery + vite build + trim (also writes dist/404.html)
```

### Adding photos

Put originals under `public/photos/<series>/` (e.g. `pets`, `toys`) and run `npm run gen-gallery`.
Supported: JPEG / PNG / WebP. HEIC is skipped (the script lists skipped files) — convert first, e.g. on macOS:

```bash
sips -s format jpeg IMG_1234.HEIC --out IMG_1234.jpg
```

### Cataloguing photos

Item labels live in `src/data/catalog.js`, keyed by photo slug (file name lower-cased, `_` → `-`, no extension: `R0003833.JPG` → `r0003833`):

```js
r0003833: { name: '阿尼亚', nameEn: 'Anya Forger', franchise: 'anime', maker: 'S.H.Figuarts', scale: '1/12', year: '2024', note: '…' },
```

All fields are optional. Add new franchises to `FRANCHISES` in the same file. The pre-filled names were identified from the photos — please double-check them.

The Home "Selected" set is `HOME_SELECTION` in `src/data/siteContent.js` (first slug = lead image); `FEATURED_SLUGS` controls what is shown first in the catalog.

### Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`. The original photos are removed from `dist`; `index.html` is copied to `404.html` so deep links work on GitHub Pages.

## License

© 2026 mraz. All rights reserved.
