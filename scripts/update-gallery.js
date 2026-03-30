import fs from 'fs';
import path from 'path';
import ExifReader from 'exifreader';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PHOTOS_DIR = path.join(__dirname, '../public/photos');
const THUMBNAILS_DIR = path.join(__dirname, '../public/thumbnails');
const MEDIUM_DIR = path.join(__dirname, '../public/photos/medium');
const LARGE_DIR = path.join(__dirname, '../public/photos/large');
const OUTPUT_FILE = path.join(__dirname, '../public/photos.json'); // Changed to public for fetch access
const EXIF_OUTPUT_FILE = path.join(__dirname, '../public/photos-exif.json');

// Ensure directories exist
if (!fs.existsSync(PHOTOS_DIR)) {
    fs.mkdirSync(PHOTOS_DIR, { recursive: true });
    console.log('Created photos directory:', PHOTOS_DIR);
}
if (!fs.existsSync(THUMBNAILS_DIR)) {
    fs.mkdirSync(THUMBNAILS_DIR, { recursive: true });
    console.log('Created thumbnails directory:', THUMBNAILS_DIR);
}
if (!fs.existsSync(LARGE_DIR)) {
    fs.mkdirSync(LARGE_DIR, { recursive: true });
    console.log('Created large photos directory:', LARGE_DIR);
}
if (!fs.existsSync(MEDIUM_DIR)) {
    fs.mkdirSync(MEDIUM_DIR, { recursive: true });
    console.log('Created medium photos directory:', MEDIUM_DIR);
}

function walkPhotos(dir, parent = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        const relativePath = parent ? path.join(parent, entry.name) : entry.name;
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            files.push(...walkPhotos(fullPath, relativePath));
            continue;
        }

        const ext = path.extname(entry.name).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
            files.push(relativePath);
        }
    }

    return files;
}

async function generateGallery() {
    console.log('Scanning for photos in:', PHOTOS_DIR);

    if (!fs.existsSync(PHOTOS_DIR)) {
        console.log('Photos directory does not exist.');
        return;
    }

    const files = walkPhotos(PHOTOS_DIR).filter((file) => {
        const dirname = path.dirname(file);
        return !dirname.startsWith('large') && !dirname.startsWith('medium') && !dirname.startsWith('thumbnails');
    });

    if (files.length === 0) {
        console.log('No photos found in', PHOTOS_DIR);
        return;
    }

    const photos = [];
    const exifById = {};

    console.log(`Found ${files.length} photos. Processing...`);

    for (const [index, file] of files.entries()) {
        const filePath = path.join(PHOTOS_DIR, file);
        const relativeDir = path.dirname(file) === '.' ? '' : path.dirname(file);
        const baseName = path.basename(file, path.extname(file));
        const thumbnailRelative = path.join(relativeDir, `${baseName}.webp`);
        const mediumRelative = path.join(relativeDir, `${baseName}.webp`);
        const thumbPath = path.join(THUMBNAILS_DIR, thumbnailRelative);
        const mediumPath = path.join(MEDIUM_DIR, mediumRelative);
        const largePath = path.join(LARGE_DIR, file);

        fs.mkdirSync(path.dirname(thumbPath), { recursive: true });
        fs.mkdirSync(path.dirname(mediumPath), { recursive: true });
        fs.mkdirSync(path.dirname(largePath), { recursive: true });
        
        // 1. Generate Thumbnail
        if (!fs.existsSync(thumbPath)) {
            console.log(`Generating thumbnail for ${file}...`);
            try {
                await sharp(filePath)
                    .resize(420, null, { withoutEnlargement: true })
                    .webp({ quality: 68 })
                    .toFile(thumbPath);
            } catch (err) {
                console.error(`Error generating thumbnail for ${file}:`, err);
            }
        }

        // 2. Generate Medium Web Version
        if (!fs.existsSync(mediumPath)) {
            console.log(`Generating medium image for ${file}...`);
            try {
                await sharp(filePath)
                    .resize(1200, null, { withoutEnlargement: true })
                    .webp({ quality: 76 })
                    .toFile(mediumPath);
            } catch (err) {
                console.error(`Error generating medium image for ${file}:`, err);
            }
        }

        // 3. Generate Large Web Version
        if (!fs.existsSync(largePath)) {
            console.log(`Generating large web version for ${file}...`);
            try {
                await sharp(filePath)
                    .resize(1920, null, { withoutEnlargement: true })
                    .withMetadata()
                    .jpeg({ quality: 85, mozjpeg: true })
                    .toFile(largePath);
            } catch (err) {
                console.error(`Error generating large image for ${file}:`, err);
            }
        }

        const fileBuffer = fs.readFileSync(filePath);
        const metadata = await sharp(filePath).metadata();
        let tags = {};

        try {
            tags = ExifReader.load(fileBuffer);
        } catch (error) {
            console.warn(`Warning: Could not read EXIF from ${file}:`, error.message);
        }

        // Helper to get tag value safely
        const getTag = (name) => {
            if (tags[name] && tags[name].description) {
                return tags[name].description;
            }
            if (tags[name] && tags[name].value) {
                return tags[name].value;
            }
            return '';
        };

        const photoId = index + 1;
        const photo = {
            id: photoId,
            src: `/photos/${file}`, // Original (fallback)
            medium: `/photos/medium/${mediumRelative.replace(/\\/g, '/')}`,
            large: `/photos/large/${file.replace(/\\/g, '/')}`, // Web Optimized
            thumbnail: `/thumbnails/${thumbnailRelative.replace(/\\/g, '/')}`,
            title: file.replace(/\.[^/.]+$/, "").replace(/-/g, ' '),
            width: metadata.width || null,
            height: metadata.height || null,
            category: relativeDir ? relativeDir.split(path.sep)[0].replace(/^\w/, (char) => char.toUpperCase()) : 'Photography',
        };

        photos.push(photo);
        exifById[String(photoId)] = {
            camera: getTag('Model') || getTag('Make') || 'Unknown Camera',
            lens: getTag('LensModel') || getTag('Lens') || getTag('LensInfo') || 'Unknown Lens',
            iso: getTag('ISOSpeedRatings') || getTag('ISO') || '',
            aperture: getTag('FNumber') || getTag('ApertureValue') || '',
            shutter: getTag('ExposureTime') || getTag('ShutterSpeedValue') || '',
        };
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(photos, null, 2));
    fs.writeFileSync(EXIF_OUTPUT_FILE, JSON.stringify(exifById, null, 2));
    console.log(`\nSuccessfully generated gallery with ${photos.length} photos!`);
    console.log(`Data saved to: ${OUTPUT_FILE}`);
    console.log(`EXIF saved to: ${EXIF_OUTPUT_FILE}`);
}

generateGallery().catch(console.error);
