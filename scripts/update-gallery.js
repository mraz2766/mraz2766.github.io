import fs from 'fs';
import path from 'path';
import ExifReader from 'exifreader';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { enrichPhoto, formatDisplayTitle } from '../src/data/siteContent.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_DIR = path.join(__dirname, '../public/photos');
const THUMBNAIL_DIR = path.join(__dirname, '../public/thumbnails');
const OPTIMIZED_DIR = path.join(__dirname, '../public/optimized');
const OUTPUT_FILE = path.join(__dirname, '../public/photos.json');
const VALID_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function walkImages(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (['thumbnails', 'optimized', 'large'].includes(entry.name)) {
        return [];
      }

      return walkImages(fullPath);
    }

    if (!VALID_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      return [];
    }

    return [fullPath];
  });
}

function getTag(tags, name) {
  if (tags[name]?.description) return tags[name].description;
  if (tags[name]?.value) return tags[name].value;
  return '';
}

function getRelativeInfo(filePath) {
  const relativePath = path.relative(SOURCE_DIR, filePath);
  const category = relativePath.split(path.sep)[0] || 'Archive';
  const ext = path.extname(relativePath);
  const baseName = path.basename(relativePath, ext);
  const webName = `${baseName}.webp`;

  return {
    category: category.charAt(0).toUpperCase() + category.slice(1),
    relativePath,
    baseName,
    thumbPath: path.join(THUMBNAIL_DIR, category, webName),
    optimizedPath: path.join(OPTIMIZED_DIR, category, webName),
    thumbWebPath: `/thumbnails/${category}/${webName}`,
    optimizedWebPath: `/optimized/${category}/${webName}`,
  };
}

async function buildDerivative(sourcePath, outputPath, width, quality) {
  ensureDir(path.dirname(outputPath));

  const sourceStat = fs.statSync(sourcePath);
  const outputExists = fs.existsSync(outputPath);
  const outputStat = outputExists ? fs.statSync(outputPath) : null;

  if (outputExists && outputStat.mtimeMs >= sourceStat.mtimeMs) {
    return;
  }

  await sharp(sourcePath)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality })
    .toFile(outputPath);
}

async function generateGallery() {
  ensureDir(THUMBNAIL_DIR);
  ensureDir(OPTIMIZED_DIR);

  const imageFiles = walkImages(SOURCE_DIR).sort((left, right) => left.localeCompare(right));

  if (!imageFiles.length) {
    fs.writeFileSync(OUTPUT_FILE, '[]\n');
    console.log('No photos found.');
    return;
  }

  const photos = [];

  for (const [index, sourcePath] of imageFiles.entries()) {
    const info = getRelativeInfo(sourcePath);

    await buildDerivative(sourcePath, info.thumbPath, 720, 72);
    await buildDerivative(sourcePath, info.optimizedPath, 1920, 84);

    const metadata = await sharp(sourcePath).metadata();
    const fileBuffer = fs.readFileSync(sourcePath);
    let tags = {};

    try {
      tags = ExifReader.load(fileBuffer);
    } catch (error) {
      console.warn(`跳过 EXIF：${info.relativePath} (${error.message})`);
    }

    const basePhoto = {
      id: index + 1,
      src: info.optimizedWebPath,
      thumbnail: info.thumbWebPath,
      width: metadata.width || 0,
      height: metadata.height || 0,
      category: info.category,
      title: info.baseName,
      displayTitle: formatDisplayTitle({ id: index + 1, title: info.baseName, category: info.category }),
      exif: {
        camera: getTag(tags, 'Model') || getTag(tags, 'Make') || 'Unknown Camera',
        lens: getTag(tags, 'LensModel') || getTag(tags, 'Lens') || getTag(tags, 'LensInfo') || 'Unknown Lens',
        iso: getTag(tags, 'ISOSpeedRatings') || getTag(tags, 'ISO') || '',
        aperture: getTag(tags, 'FNumber') || getTag(tags, 'ApertureValue') || '',
        shutter: getTag(tags, 'ExposureTime') || getTag(tags, 'ShutterSpeedValue') || '',
      },
    };

    photos.push(enrichPhoto(basePhoto));
  }

  fs.writeFileSync(OUTPUT_FILE, `${JSON.stringify(photos, null, 2)}\n`);
  console.log(`Generated ${photos.length} photo records.`);
}

generateGallery().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
