# Minimalist Lens

一个以克制浏览、精选编排与系列叙事为核心的个人图像作品集。

## Design Philosophy

*   **Obsidian & Glass**: A visual language built on deep contrasts (pure black/white) and translucent glassmorphism elements.
*   **Editorial Typography**: Utilizing `Inter` for clean UI elements and `Playfair Display` for artistic accents, creating a magazine-like reading experience.
*   **Cinematic Motion**: Subtle animations, such as the Ken Burns effect on the About page and smooth layout transitions, bring static images to life.
*   **Adaptive Layout**: A responsive masonry grid that shifts density based on device and user preference (Compact/Default modes).

## Features

*   **系列化首页**：All / Pets / Toys 三个入口共用一套克制编排，首页默认优先展示精选作品。
*   **作品详情视图**：Lightbox 不只显示图片，还补充系列语境、当前位置和清洗后的拍摄信息。
*   **关于页表达**：增加作者陈述与联系信息，让站点更像正式作品集而不是单纯相册。
*   **静态资源生成**：构建时自动生成 WebP 缩略图与浏览图，并只保留运行时真正使用的资源到 `dist`。

## Tech Stack

*   **Frontend**: React, Vite
*   **Styling**: CSS, Framer Motion
*   **Image Processing**: Sharp, ExifReader
*   **Deployment**: GitHub Pages

## Development

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Add Photos**:
    Place your source photos under `public/photos/<series-name>`.

3.  **Generate Gallery**:
    Run the script to generate optimized images, thumbnails, and `photos.json`:
    ```bash
    npm run gen-gallery
    ```

4.  **Start Dev Server**:
    ```bash
    npm run dev
    ```

5.  **Build & Deploy**:
    ```bash
    npm run build
    # 构建产物位于 dist，原始 source photos 不会被带入最终站点
    ```

## License

© 2025 Minimalist Lens. All rights reserved.
