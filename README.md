# Minimalist Lens

A curated photography portfolio designed with a focus on minimalism, fine typography, and immersive viewing experiences.

## Design Philosophy

*   **Obsidian & Glass**: A visual language built on deep contrasts (pure black/white) and translucent glassmorphism elements.
*   **Editorial Typography**: Utilizing `Inter` for clean UI elements and `Playfair Display` for artistic accents, creating a magazine-like reading experience.
*   **Cinematic Motion**: Subtle animations, such as the Ken Burns effect on the About page and smooth layout transitions, bring static images to life.
*   **Adaptive Layout**: A responsive masonry grid that shifts density based on device and user preference (Compact/Default modes).

## Features

*   **Smart Gallery**:
    *   **Masonry Grid**: Perfectly aligned waterfall layout for mixed aspect ratios.
    *   **View Modes**: Switch between Default (immersive) and Compact (high-density) views.
        *   *PC*: 3 columns / 7 columns
        *   *Mobile*: 2 columns / 5 columns
    *   **Infinite Scroll**: Seamlessly loads more photos as you scroll, optimized with pre-fetching.
*   **Immersive Lightbox**:
    *   **Distraction-Free**: Full-screen viewing with minimal UI.
    *   **Floating Metadata**: EXIF data (Camera, Lens, ISO, Aperture, Shutter) displayed in a non-intrusive, floating glass capsule below the image.
    *   **Keyboard Navigation**: Support for Arrow keys and Escape.
*   **About Page**:
    *   **Cinematic Intro**: A random selection from the portfolio displayed with a slow-motion breathing effect.
    *   **Minimalist Contact**: Clean, editorial-style contact information.
*   **Performance**:
    *   **Automated Build**: Node.js script (`update-gallery.js`) automatically generates thumbnails and extracts EXIF data.
    *   **Incremental Builds**: Only processes new or modified images to save build time.
    *   **Lazy Loading**: Native lazy loading for grid images.

## Tech Stack

*   **Frontend**: React, Vite
*   **Styling**: CSS Modules, Framer Motion (Animations)
*   **Image Processing**: Sharp, ExifReader (Node.js)
*   **Deployment**: GitHub Pages

## Development

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Add Photos**:
    Place your high-res photos in `public/photos`.

3.  **Generate Gallery**:
    Run the script to generate thumbnails and `photos.json`:
    ```bash
    npm run update-gallery
    ```

4.  **Start Dev Server**:
    ```bash
    npm run dev
    ```

5.  **Build & Deploy**:
    ```bash
    npm run build
    # The build output is in the 'dist' folder
    ```

## License

© 2025 Minimalist Lens. All rights reserved.
