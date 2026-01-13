import fs from 'fs';
import path from 'path';
import ExifReader from 'exifreader';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PHOTOS_DIR = path.join(__dirname, '../public/photos');
const THUMBNAILS_DIR = path.join(__dirname, '../public/photos/thumbnails');
const LARGE_DIR = path.join(__dirname, '../public/photos/large');
const OUTPUT_FILE = path.join(__dirname, '../public/photos.json'); // Changed to public for fetch access

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

async function generateGallery() {
    console.log('Scanning for photos in:', PHOTOS_DIR);

    if (!fs.existsSync(PHOTOS_DIR)) {
        console.log('Photos directory does not exist.');
        return;
    }

    const files = fs.readdirSync(PHOTOS_DIR).filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
    });

    if (files.length === 0) {
        console.log('No photos found in', PHOTOS_DIR);
        return;
    }

    const photos = [];

    console.log(`Found ${files.length} photos. Processing...`);

    for (const [index, file] of files.entries()) {
        const filePath = path.join(PHOTOS_DIR, file);
        const thumbPath = path.join(THUMBNAILS_DIR, file); // Keep original extension for simplicity
        const largePath = path.join(LARGE_DIR, file);
        
        // 1. Generate Thumbnail
        if (!fs.existsSync(thumbPath)) {
            console.log(`Generating thumbnail for ${file}...`);
            try {
                // Resize to width 600px, maintain aspect ratio
                await sharp(filePath)
                    .resize(600, null, { withoutEnlargement: true })
                    .withMetadata() // Keep orientation
                    .jpeg({ quality: 70, mozjpeg: true })
                    .toFile(thumbPath);
            } catch (err) {
                console.error(`Error generating thumbnail for ${file}:`, err);
            }
        }

        // 2. Generate Large Web Version
        if (!fs.existsSync(largePath)) {
            console.log(`Generating large web version for ${file}...`);
            try {
                // Resize to width 1920px (HD), maintain aspect ratio
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

        const photo = {
            id: index + 1,
            src: `/photos/${file}`, // Original (fallback)
            large: `/photos/large/${file}`, // Web Optimized
            thumbnail: `/photos/thumbnails/${file}`,
            title: file.replace(/\.[^/.]+$/, "").replace(/-/g, ' '),
            category: 'Photography',
            exif: {
                camera: getTag('Model') || getTag('Make') || 'Unknown Camera',
                lens: getTag('LensModel') || getTag('Lens') || getTag('LensInfo') || 'Unknown Lens',
                iso: getTag('ISOSpeedRatings') || getTag('ISO') || '',
                aperture: getTag('FNumber') || getTag('ApertureValue') || '',
                shutter: getTag('ExposureTime') || getTag('ShutterSpeedValue') || '',
            }
        };

        photos.push(photo);
        // console.log(`Processed: ${file}`);
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(photos, null, 2));
    console.log(`\nSuccessfully generated gallery with ${photos.length} photos!`);
    console.log(`Data saved to: ${OUTPUT_FILE}`);
}

generateGallery().catch(console.error);
