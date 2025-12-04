import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import ExifReader from 'exifreader';
import sizeOf from 'image-size';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PHOTOS_DIR = path.join(__dirname, '../public/photos');
const THUMBS_DIR = path.join(__dirname, '../public/thumbnails');
const OUTPUT_FILE = path.join(__dirname, '../public/photos.json');

// Configuration
const CONFIG = {
    thumbnail: {
        width: 600,
        quality: 80,
        format: 'webp'
    },
    full: {
        maxWidth: 2500,
        quality: 90,
        keepExif: true
    },
    concurrency: 4 // Process 4 images at a time
};

// Ensure directories exist
if (!fs.existsSync(PHOTOS_DIR)) {
    fs.mkdirSync(PHOTOS_DIR, { recursive: true });
}
if (!fs.existsSync(THUMBS_DIR)) {
    fs.mkdirSync(THUMBS_DIR, { recursive: true });
}

async function processImage(entry, directory, relativePath, photoId) {
    const fullPath = path.join(directory, entry.name);
    const ext = path.extname(entry.name).toLowerCase();

    const thumbName = path.basename(relativePath, ext) + '.webp';
    const thumbRelativePath = path.join(path.dirname(relativePath), thumbName);
    const thumbPath = path.join(THUMBS_DIR, thumbRelativePath);
    const thumbUrl = `/thumbnails/${thumbRelativePath.replace(/\\/g, '/')}`;

    // Ensure thumbnail directory exists
    const thumbDir = path.dirname(thumbPath);
    if (!fs.existsSync(thumbDir)) {
        fs.mkdirSync(thumbDir, { recursive: true });
    }

    let fileBuffer = fs.readFileSync(fullPath);
    const fileStats = fs.statSync(fullPath);
    let thumbStats = null;
    if (fs.existsSync(thumbPath)) {
        thumbStats = fs.statSync(thumbPath);
    }

    // Check if we need to regenerate (if thumb is missing or older than source)
    const needsRegeneration = !thumbStats || fileStats.mtime > thumbStats.mtime;
    let needsUpdate = false;

    if (needsRegeneration) {
        console.log(`Processing: ${relativePath}...`);
        try {
            const image = sharp(fileBuffer);
            const metadata = await image.metadata();

            const isTooLarge = metadata.width > CONFIG.full.maxWidth || metadata.height > CONFIG.full.maxWidth;
            const needsRotation = metadata.orientation && metadata.orientation !== 1;

            // Optimize Original (Only if strictly necessary and not already optimized)
            // Note: Modifying source file in place can be tricky with mtime checks. 
            // Ideally we should output to a 'dist' folder, but for this setup we modify in place.
            // To avoid infinite loops, we could check a metadata flag or just rely on size.
            // For now, we'll skip aggressive in-place optimization to save build time, 
            // OR only do it if the file is HUGE.
            if ((needsRotation || isTooLarge) && needsRegeneration) {
                // console.log(`  - Optimizing original...`);
                // let pipeline = image.rotate();
                // if (isTooLarge) {
                //    pipeline = pipeline.resize(CONFIG.full.maxWidth, CONFIG.full.maxWidth, { 
                //        fit: 'inside', 
                //        withoutEnlargement: true 
                //    });
                // }
                // pipeline = pipeline.withMetadata().jpeg({ quality: CONFIG.full.quality });
                // const optimizedBuffer = await pipeline.toBuffer();
                // fs.writeFileSync(fullPath, optimizedBuffer);
                // fileBuffer = optimizedBuffer;
                // needsUpdate = true;

                // SKIP IN-PLACE OPTIMIZATION FOR BUILD SPEED unless explicitly requested.
                // It causes re-uploads and cache busting issues if not careful.
                // We will just handle rotation for the thumbnail.
            }

            // Generate Thumbnail
            await sharp(fileBuffer)
                .rotate() // Auto-rotate based on EXIF
                .resize(CONFIG.thumbnail.width, null, { withoutEnlargement: true })
                .webp({ quality: CONFIG.thumbnail.quality })
                .toFile(thumbPath);

        } catch (e) {
            console.warn(`  - Warning: Optimization failed for ${entry.name}: ${e.message}`);
        }
    }

    // Extract EXIF (Fast)
    let tags = {};
    try {
        tags = ExifReader.load(fileBuffer);
    } catch (error) { }

    const getTag = (name) => {
        if (tags[name]) {
            return tags[name].description || tags[name].value || '';
        }
        return '';
    };

    const formatShutter = (val) => {
        if (!val) return '';
        if (val.toString().includes('/')) return val;
        const num = parseFloat(val);
        if (num >= 1 || num === 0) return val;
        return `1/${Math.round(1 / num)}`;
    };

    const formatAperture = (val) => {
        if (!val) return '';
        const s = val.toString();
        return s.toLowerCase().startsWith('f') ? s : `f/${s}`;
    };

    let width = 0;
    let height = 0;
    try {
        const dimensions = sizeOf(fileBuffer);
        width = dimensions.width;
        height = dimensions.height;
    } catch (e) { }

    let category = 'General';
    if (relativePath.includes(path.sep)) {
        category = relativePath.split(path.sep)[0];
        category = category.charAt(0).toUpperCase() + category.slice(1);
    }

    return {
        id: photoId,
        src: `/photos/${relativePath.replace(/\\/g, '/')}`,
        thumbnail: thumbUrl,
        title: entry.name.replace(/\.[^/.]+$/, "").replace(/-/g, ' '),
        width,
        height,
        category,
        exif: {
            camera: getTag('Model') || getTag('Make') || 'Unknown Camera',
            lens: getTag('LensModel') || getTag('Lens') || getTag('LensInfo') || 'Unknown Lens',
            iso: getTag('ISOSpeedRatings') || getTag('ISO') || '',
            aperture: formatAperture(getTag('FNumber') || getTag('ApertureValue')),
            shutter: formatShutter(getTag('ExposureTime') || getTag('ShutterSpeedValue')),
        }
    };
}

async function generateGallery() {
    const photos = [];
    let photoId = 1;

    console.log('Scanning for photos in:', PHOTOS_DIR);

    const entriesToProcess = [];

    const scanDirectory = (directory, relativeDir) => {
        const entries = fs.readdirSync(directory, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(directory, entry.name);
            const relativePath = path.join(relativeDir, entry.name);

            if (entry.isDirectory()) {
                scanDirectory(fullPath, relativePath);
            } else {
                const ext = path.extname(entry.name).toLowerCase();
                if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
                    entriesToProcess.push({ entry, directory, relativePath });
                }
            }
        }
    };

    if (fs.existsSync(PHOTOS_DIR)) {
        scanDirectory(PHOTOS_DIR, '');
    } else {
        console.log('Photos directory not found.');
        return;
    }

    console.log(`Found ${entriesToProcess.length} photos.`);

    // Process in chunks to limit concurrency
    const chunkedResults = [];
    for (let i = 0; i < entriesToProcess.length; i += CONFIG.concurrency) {
        const chunk = entriesToProcess.slice(i, i + CONFIG.concurrency);
        const promises = chunk.map((item, index) =>
            processImage(item.entry, item.directory, item.relativePath, photoId + i + index)
        );
        const results = await Promise.all(promises);
        chunkedResults.push(...results);
        process.stdout.write(`\rProgress: ${Math.min(i + CONFIG.concurrency, entriesToProcess.length)}/${entriesToProcess.length}`);
    }

    console.log('\nSorting photos...');
    // Sort by ID (which effectively is by folder structure order) or date if we wanted
    chunkedResults.sort((a, b) => a.id - b.id);

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(chunkedResults, null, 2));
    console.log(`\nSuccessfully generated gallery with ${chunkedResults.length} photos!`);
    console.log(`Data saved to: ${OUTPUT_FILE}`);
}

generateGallery().catch(console.error);
