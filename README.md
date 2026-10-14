# mraz — 收藏图鉴 · A Catalog

Personal photo catalog of toys, pets and light, deployed to GitHub Pages at <https://mraz2766.github.io/>.
Design system (Swiss grid + museum labels, bilingual, light/dark) is documented in [`DESIGN.md`](./DESIGN.md).

## Features

*   **Home 首页** — masthead, a curated "Selected 精选" set on the first screen, a franchise index (目录) and a pets special collection.
*   **Catalog 图鉴** — `/works`, `/works/toys`, `/works/pets`; franchise filter (`?f=marvel`) and Grid / Index table views (`?view=index`). Masonry keeps tiles in place as more load.
*   **Specimen sheet** — the lightbox shows the catalog label (name, series, maker, scale, year) next to the photo plus EXIF. The open photo lives in the URL (`?photo=<slug>`); arrow keys, Esc, swipe and Back all work.
*   **Light / dark** — follows the system, with a toggle in the header.
*   **Static image pipeline** — WebP thumbnails (720px) and viewing images (1920px), EXIF-aware dimensions, per-photo frame colour, orphan cleanup.

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
