import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import ExifReader from 'exifreader';
import sizeOf from 'image-size';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PHOTOS_DIR = path.join(__dirname, '../public/photos');
const OUTPUT_FILE = path.join(__dirname, '../src/photos.json');

// Ensure photos directory exists
if (!fs.existsSync(PHOTOS_DIR)) {
    fs.mkdirSync(PHOTOS_DIR, { recursive: true });
    console.log('Created photos directory:', PHOTOS_DIR);
}

async function generateGallery() {
    const photos = [];
    let photoId = 1;

    const processDirectory = async (directory, categoryPath) => {
        const entries = fs.readdirSync(directory, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(directory, entry.name);
            const relativePath = path.relative(PHOTOS_DIR, fullPath);

            if (entry.isDirectory()) {
                // Recursively process subdirectories
                await processDirectory(fullPath, relativePath);
            } else {
                const ext = path.extname(entry.name).toLowerCase();
                if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
                    continue;
                }

                let fileBuffer = fs.readFileSync(fullPath);
                
                try {
                    // Use sharp to auto-rotate based on EXIF and get a new buffer
                    const rotatedBuffer = await sharp(fileBuffer).rotate().toBuffer();
                    
                    // Overwrite the original file with the corrected, upright version
                    fs.writeFileSync(fullPath, rotatedBuffer);

                    // Use the new, corrected buffer for further processing
                    fileBuffer = rotatedBuffer;
                    console.log(`Checked/Corrected orientation for: ${relativePath}`);

                } catch (sharpError) {
                    console.error(`Could not process ${entry.name} with sharp:`, sharpError);
                    // Continue with the original buffer if sharp fails
                }
                
                let tags = {};
                try {
                    tags = ExifReader.load(fileBuffer);
                } catch (error) {
                    console.warn(`Warning: Could not read EXIF from ${entry.name}`);
                }

                // Get image dimensions from the corrected buffer
                const { width, height } = sizeOf(fileBuffer);

                const getTag = (tag) => tags[tag] ? tags[tag].description : '';
                
                let category = 'General';
                if (categoryPath) {
                    category = categoryPath.charAt(0).toUpperCase() + categoryPath.slice(1);
                }

                const photo = {
                    id: photoId++,
                    src: `/photos/${relativePath.replace(/\\/g, '/')}`,
                    title: entry.name.replace(/\.[^/.]+$/, "").replace(/-/g, ' '),
                    width,
                    height,
                    category,
                    exif: {
                        camera: getTag('Model') || 'Unknown Camera',
                        lens: getTag('LensModel') || getTag('Lens') || 'Unknown Lens',
                        iso: getTag('ISOSpeedRatings') || '',
                        aperture: getTag('FNumber') || '',
                        shutter: getTag('ExposureTime') || '',
                    }
                };

                photos.push(photo);
            }
        }
    };

    await processDirectory(PHOTOS_DIR, '');

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(photos, null, 2));
    console.log(`\nSuccessfully generated gallery with ${photos.length} photos!`);
    console.log(`Data saved to: ${OUTPUT_FILE}`);
}

generateGallery().catch(console.error);