# mraz — Photography

Personal photo archive (pets, toys, light) deployed to GitHub Pages at <https://mraz2766.github.io/>.
Visual language — white gallery wall, giant black wordmark, chromatic hairline frames — is documented in [`DESIGN.md`](./DESIGN.md).

## Features

*   **Home** — oversized wordmark plus a curated wall of featured Pets / Toys photographs.
*   **Works** — `/works`, `/works/pets`, `/works/toys`; masonry grid that loads in batches and keeps tiles in place as more load.
*   **Lightbox** — the open photo lives in the URL (`/works?photo=<slug>`), so links are shareable and Back closes it. Arrow keys, Esc, swipe on phones, neighbour preloading and cleaned-up EXIF.
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

To feature a photo on Home / at the top of a series, add its slug to `FEATURED_SLUGS` in `src/data/siteContent.js`.

### Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`. The original photos are removed from `dist`; `index.html` is copied to `404.html` so deep links work on GitHub Pages.

## License

© 2026 mraz. All rights reserved.
