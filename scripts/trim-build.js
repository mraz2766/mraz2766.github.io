import fs from 'fs';
import path from 'path';

const distDir = path.join(process.cwd(), 'dist');
const distPhotosDir = path.join(distDir, 'photos');

if (fs.existsSync(distPhotosDir)) {
  fs.rmSync(distPhotosDir, { recursive: true, force: true });
  console.log('Removed original source photos from dist.');
}

// GitHub Pages serves 404.html for unknown paths. Shipping the SPA shell there
// lets deep links such as /works/pets or /works?photo=xxx load directly
// without a redirect round-trip.
const indexHtml = path.join(distDir, 'index.html');
if (fs.existsSync(indexHtml)) {
  fs.copyFileSync(indexHtml, path.join(distDir, '404.html'));
  console.log('Copied index.html to 404.html for SPA deep links.');
}
