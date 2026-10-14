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
const FRAME_HUES = [
  { name: 'vermillion', hue: 1 },
  { name: 'marigold', hue: 17 },
  { name: 'brass', hue: 39 },
  { name: 'fern', hue: 105 },
  { name: 'cobalt', hue: 202 },
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

const skippedFiles = [];

function walkImages(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (['thumbnails', 'optimized', 'large'].includes(entry.name)) {
        return [];
      }

      return walkImages(fullPath);
    }

    if (entry.name.startsWith('.')) return [];

    if (!VALID_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      skippedFiles.push(path.relative(SOURCE_DIR, fullPath));
      return [];
    }

    return [fullPath];
  });
}

// Remove derivatives whose source photo no longer exists (renamed/deleted
// originals, or files from older naming schemes such as "x.JPG.webp").
function pruneOrphans(dir, keep) {
  if (!fs.existsSync(dir)) return 0;
  let removed = 0;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      removed += pruneOrphans(fullPath, keep);
      if (!fs.readdirSync(fullPath).length) fs.rmdirSync(fullPath);
    } else if (!keep.has(fullPath)) {
      fs.rmSync(fullPath);
      removed += 1;
    }
  }

  return removed;
}

// sharp reports the stored (pre-rotation) size. Derivatives are written with
// .rotate(), so swap width/height for EXIF orientations 5–8 to keep the
// layout aspect ratio in sync with the actual image.
function getDisplaySize(metadata) {
  const width = metadata.width || 0;
  const height = metadata.height || 0;
  return (metadata.orientation || 1) >= 5 ? { width: height, height: width } : { width, height };
}

function getTag(tags, name) {
  if (tags[name]?.description) return tags[name].description;
  if (tags[name]?.value) return tags[name].value;
  return '';
}

function cleanExifValue(value) {
  const normalized = String(value ?? '').trim();
  if (!normalized || /^unknown/i.test(normalized)) return '';
  return normalized;
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

function rgbToHsv(red, green, blue) {
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let hue = 0;

  if (delta) {
    if (max === r) hue = 60 * (((g - b) / delta) % 6);
    else if (max === g) hue = 60 * ((b - r) / delta + 2);
    else hue = 60 * ((r - g) / delta + 4);
  }

  if (hue < 0) hue += 360;

  return {
    hue,
    saturation: max === 0 ? 0 : delta / max,
    value: max,
  };
}

function circularHueDistance(left, right) {
  const distance = Math.abs(left - right);
  return Math.min(distance, 360 - distance);
}

async function getFrameColor(sourcePath, fallbackIndex) {
  const { data, info } = await sharp(sourcePath)
    .rotate()
    .resize({ width: 64, height: 64, fit: 'inside', withoutEnlargement: true })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const buckets = Array.from({ length: 30 }, () => 0);
  const channels = info.channels;

  for (let offset = 0; offset < data.length; offset += channels) {
    const { hue, saturation, value } = rgbToHsv(
      data[offset],
      data[offset + 1],
      data[offset + 2]
    );

    if (saturation < 0.14 || value < 0.12 || value > 0.98) continue;

    const bucket = Math.floor(hue / 12) % buckets.length;
    buckets[bucket] += saturation * Math.sqrt(value);
  }

  const dominantWeight = Math.max(...buckets);
  if (dominantWeight <= 0) {
    return FRAME_HUES[fallbackIndex % FRAME_HUES.length].name;
  }

  const dominantBucket = buckets.indexOf(dominantWeight);
  const dominantHue = dominantBucket * 12 + 6;

  return FRAME_HUES.reduce((closest, candidate) => (
    circularHueDistance(candidate.hue, dominantHue)
      < circularHueDistance(closest.hue, dominantHue)
      ? candidate
      : closest
  )).name;
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
  const keepDerivatives = new Set();

  for (const [index, sourcePath] of imageFiles.entries()) {
    const info = getRelativeInfo(sourcePath);

    await buildDerivative(sourcePath, info.thumbPath, 720, 72);
    await buildDerivative(sourcePath, info.optimizedPath, 1920, 84);
    keepDerivatives.add(info.thumbPath);
    keepDerivatives.add(info.optimizedPath);

    const metadata = await sharp(sourcePath).metadata();
    const { width, height } = getDisplaySize(metadata);
    const frameColor = await getFrameColor(sourcePath, index);
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
      width,
      height,
      category: info.category,
      title: info.baseName,
      displayTitle: formatDisplayTitle({ id: index + 1, title: info.baseName, category: info.category }),
      frameColor,
      exif: {
        camera: cleanExifValue(getTag(tags, 'Model') || getTag(tags, 'Make')),
        lens: cleanExifValue(getTag(tags, 'LensModel') || getTag(tags, 'Lens') || getTag(tags, 'LensInfo')),
        iso: cleanExifValue(getTag(tags, 'ISOSpeedRatings') || getTag(tags, 'ISO')),
        aperture: cleanExifValue(getTag(tags, 'FNumber') || getTag(tags, 'ApertureValue')),
        shutter: cleanExifValue(getTag(tags, 'ExposureTime') || getTag(tags, 'ShutterSpeedValue')),
      },
    };

    photos.push(enrichPhoto(basePhoto));
  }

  fs.writeFileSync(OUTPUT_FILE, `${JSON.stringify(photos, null, 2)}\n`);
  console.log(`Generated ${photos.length} photo records.`);

  const pruned = pruneOrphans(THUMBNAIL_DIR, keepDerivatives) + pruneOrphans(OPTIMIZED_DIR, keepDerivatives);
  if (pruned) console.log(`Pruned ${pruned} orphaned derivative files.`);

  if (skippedFiles.length) {
    console.warn(
      `Skipped ${skippedFiles.length} unsupported file(s) (convert HEIC to JPEG to include them, e.g. \`sips -s format jpeg x.HEIC --out x.jpg\` on macOS):\n  ${skippedFiles.join('\n  ')}`
    );
  }
}

generateGallery().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
