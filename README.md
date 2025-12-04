# Portfolio

A minimalist photography portfolio built with modern web technologies. Designed to showcase visual work with zero distractions.

![License](https://img.shields.io/badge/license-MIT-000000.svg?style=flat-square)
![React](https://img.shields.io/badge/react-19.0-000000.svg?style=flat-square)
![Vite](https://img.shields.io/badge/vite-6.0-000000.svg?style=flat-square)

## Philosophy

**"Obsidian & Glass"**

The design language focuses on two elements:
- **Obsidian**: Deep, immersive backgrounds that allow photographs to pop with vivid color.
- **Glass**: Translucent, frosted UI elements that provide context without obscuring the content.

## Features

- **Smart Gallery**:
  - **Auto-Shuffle**: A fresh layout on every visit.
  - **Masonry Grid**: Perfectly aligned waterfall layout for mixed aspect ratios.
  - **Lazy Loading**: Blazing fast performance with WebP thumbnails.

- **Automated Workflow**:
  - Simply drop photos into `public/photos`.
  - The build script automatically rotates, resizes, compresses, and extracts EXIF data.
  - No database required.

- **Premium UX**:
  - **Dark/Light Mode**: Seamless switching with smooth transitions.
  - **Glassmorphism**: Adaptive frosted glass effects for headers and overlays.
  - **Mobile First**: Optimized touch interactions and responsive layouts.

## Tech Stack

- **Core**: React 19, Vite
- **Animation**: Framer Motion
- **Image Processing**: Sharp (Node.js)
- **Metadata**: ExifReader

## Usage

### 1. Add Photos
Place your high-res JPG/PNG files into the `public/photos` directory. You can organize them into subfolders (e.g., `public/photos/Portrait`), which will automatically become categories.

### 2. Generate Gallery
Run the script to process images and generate the data file:

```bash
npm run gen-gallery
```

### 3. Develop
Start the local development server:

```bash
npm run dev
```

### 4. Deploy
Build for production (automatically regenerates gallery data):

```bash
npm run build
```

The output in `dist` is ready to be deployed to GitHub Pages or any static host.

---

© 2025 Photography Portfolio. All rights reserved.
