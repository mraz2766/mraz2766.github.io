# 摄影作品集顺滑重构与 EXIF 展示

## 目标

将当前 React/Vite 摄影作品集重构成更顺滑、照片主导的浏览体验。整体借鉴 david-hckh/portfolio-2025 的气质：超大标题、沉浸首屏、细致转场和克制动效，但保留当前技术栈与站点内容，不复制参考项目代码或素材。

## 用户价值

访客进入首页时应立刻感受到这是一个个人摄影作品集；照片本身是第一视觉主角。进入作品后，浏览、筛选、打开大图和查看拍摄参数都应顺畅自然。每张照片的 EXIF 以极简胶片信息条呈现，让观看者快速理解相机、镜头与曝光信息，而不是被完整元数据淹没。

## 计划模板来源

规划阶段未找到项目内 `.agent/PLANS.md`，也未找到全局 `~/.codex/PLANS.md`。本 ExecPlan 直接按当前 AGENTS 指令要求组织。

## 范围

- 保留现有路由：`/`、`/works`、`/works/:slug`、`/about`。
- 保留 React、Vite、React Router、Framer Motion、Sharp、ExifReader。
- 不移植到 Vue，不引入 Three.js，不复制参考项目素材，不添加声音或自定义光标。
- 不展示 GPS/位置信息。

## 实施里程碑

1. 在实现前创建本 ExecPlan。
2. 将首页重构为照片主导的沉浸式入口，并使用现有精选照片。
3. 调整 Layout/Header/归档页/专题页，让页面之间的节奏连续。
4. 升级图库网格、视图模式切换、分页与大图查看器。
5. 将 EXIF 提取与格式化收敛为极简胶片式展示。
6. 替换视觉系统 CSS，形成冷静、克制、照片优先的作品集气质。
7. 重新生成图库数据，运行 lint/build，并做桌面与移动端浏览器检查。

## 计划修改文件

- `src/pages/Home.jsx`
- `src/pages/Works.jsx`
- `src/pages/SeriesPage.jsx`
- `src/pages/About.jsx`
- `src/components/Layout.jsx`
- `src/components/Header.jsx`
- `src/components/Gallery/GalleryBrowser.jsx`
- `src/components/Gallery/MasonryGrid.jsx`
- `src/components/Gallery/Lightbox.jsx`
- `src/data/siteContent.js`
- `scripts/update-gallery.js`
- `src/index.css`
- 重新生成后的 `public/photos.json`

## 进度

- [x] 已创建 ExecPlan。
- [x] 已重构首页与路由外壳。
- [x] 已升级图库与大图查看器。
- [x] 已规范 EXIF 格式化。
- [x] 已替换视觉系统。
- [x] 已重新生成图库并完成检查。
- [x] 已完成浏览器检查。

## 决策记录

- 保留当前 React/Vite 架构，不移植参考项目的 Vue/Three.js 结构。
- 参考项目只作为视觉与交互气质参考，不直接复用代码。
- 首页首屏使用现有精选照片作为视觉锚点。
- EXIF 只展示相机、镜头、光圈、快门、ISO；GPS 信息刻意忽略。
- 保留浅色/深色主题与 reduced-motion 支持。
- Markdown 文档使用中文。
- 首页改为精选照片主视觉、缩略图入口和更轻的 Header/Footer 外壳。
- 根据反馈再次简化首页：首屏只保留站名、短句和单个入口，精选缩略图下移，专题列表去掉长摘要。
- 大图查看器改为照片优先布局，EXIF 改为极简字段并过滤 Unknown/GPS。
- 大图上一张/下一张现在跨分页在当前筛选集合内连续浏览。
- 全站 CSS 改为中性照片作品集系统，保留深浅主题与 reduced-motion 支持。

## 意外发现

- 项目已经包含 `exifreader`、`sharp`、`framer-motion`，无需为本次功能新增依赖。
- 现有图库流水线已经能生成缩略图、优化 WebP 和 `public/photos.json`。
- `public/photos.json` 重新生成后共有 125 张照片，EXIF 字段只包含 `camera`、`lens`、`iso`、`aperture`、`shutter`，没有 GPS 字段。

## 验证方式

- 运行 `npm run gen-gallery`。
- 确认生成的 EXIF 数据不包含 GPS 字段，界面不展示 `Unknown`。
- 运行 `npm run lint`。
- 运行 `npm run build`。
- 启动 Vite 开发服务器，并检查桌面与移动端视口。
- 验证首页主视觉、图库切换、大图键盘操作、EXIF 信息条、无 EXIF 回退文案与 reduced-motion 表现。

## 结果与复盘

已完成图库生成、lint、生产构建与浏览器截图检查。首页在桌面与移动端已调整为更简约的照片封面；作品页可正常渲染，移动端未发现文字与控件重叠。
