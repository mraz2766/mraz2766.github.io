import fs from 'fs';
import path from 'path';

const distPhotosDir = path.join(process.cwd(), 'dist', 'photos');

if (fs.existsSync(distPhotosDir)) {
  fs.rmSync(distPhotosDir, { recursive: true, force: true });
  console.log('Removed original source photos from dist.');
}
