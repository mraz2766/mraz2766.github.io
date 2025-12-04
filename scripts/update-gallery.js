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
// CHANGE: Output to public directory so it's accessible in production
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
    }
};

// Ensure directories exist
if (!fs.existsSync(PHOTOS_DIR)) {
    fs.mkdirSync(PHOTOS_DIR, { recursive: true });
}
if (!fs.existsSync(THUMBS_DIR)) {
    fs.mkdirSync(THUMBS_DIR, { recursive: true });
}

async function generateGallery() {
    const photos = [];
    let photoId = 1;

    console.log('Scanning for photos in:', PHOTOS_DIR);

    const processDirectory = async (directory, categoryPath) => {
        const entries = fs.readdirSync(directory, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(directory, entry.name);
            const relativePath = path.relative(PHOTOS_DIR, fullPath);

            const thumbDir = path.join(THUMBS_DIR, path.dirname(relativePath));
            if (!fs.existsSync(thumbDir)) {
                fs.mkdirSync(thumbDir, { recursive: true });
            }

            if (entry.isDirectory()) {
                await processDirectory(fullPath, relativePath);
            } else {
                const ext = path.extname(entry.name).toLowerCase();
                if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
                    continue;
                }

                console.log(`Processing: ${relativePath}...`);

                let fileBuffer = fs.readFileSync(fullPath);
                let needsUpdate = false;

                try {
                    const image = sharp(fileBuffer);
                    const metadata = await image.metadata();

                    const isTooLarge = metadata.width > CONFIG.full.maxWidth || metadata.height > CONFIG.full.maxWidth;
                    const needsRotation = metadata.orientation && metadata.orientation !== 1;

                    if (needsRotation || isTooLarge) {
                        console.log(`  - Optimizing original...`);
                        let pipeline = image.rotate();
                        if (isTooLarge) {
                            pipeline = pipeline.resize(CONFIG.full.maxWidth, CONFIG.full.maxWidth, {
                                fit: 'inside',
                                withoutEnlargement: true
                            });
                        }
                        pipeline = pipeline.withMetadata().jpeg({ quality: CONFIG.full.quality });
                        const optimizedBuffer = await pipeline.toBuffer();
                        fs.writeFileSync(fullPath, optimizedBuffer);
                        fileBuffer = optimizedBuffer;
                        needsUpdate = true;
                    }
                } catch (e) {
                    console.warn(`  - Warning: Optimization failed for ${entry.name}: ${e.message}`);
                }

                const thumbName = path.basename(relativePath, ext) + '.webp';
                const thumbRelativePath = path.join(path.dirname(relativePath), thumbName);
                const thumbPath = path.join(THUMBS_DIR, thumbRelativePath);
                const thumbUrl = `/thumbnails/${thumbRelativePath.replace(/\\/g, '/')}`;

                try {
                    if (!fs.existsSync(thumbPath) || needsUpdate) {
                        await sharp(fileBuffer)
                            .resize(CONFIG.thumbnail.width, null, { withoutEnlargement: true })
                            .webp({ quality: CONFIG.thumbnail.quality })
                            .toFile(thumbPath);
                    }
                } catch (e) {
                    console.warn(`  - Warning: Thumbnail generation failed: ${e.message}`);
                }

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
                if (categoryPath) {
                    category = categoryPath.split(path.sep)[0];
                    category = category.charAt(0).toUpperCase() + category.slice(1);
                }

                const photo = {
                    id: photoId++,
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

                photos.push(photo);
            }
        }
    };

    if (fs.existsSync(PHOTOS_DIR)) {
        await processDirectory(PHOTOS_DIR, '');
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(photos, null, 2));
        console.log(`\nSuccessfully generated gallery with ${photos.length} photos!`);
        console.log(`Data saved to: ${OUTPUT_FILE}`);
    } else {
        console.log('Photos directory not found.');
    }
}

generateGallery().catch(console.error);
