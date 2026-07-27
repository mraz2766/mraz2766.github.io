# mraz 照片博客画廊墙重构

## 目标

将现有 React/Vite 摄影博客重构为 `DESIGN.md` 定义的白色画廊墙：照片是内容主体，黑色超大 `mraz` 字标是页面建筑，照片主色映射出的彩色细框是唯一装饰。保留现有照片、路由、EXIF 与 Lightbox 能力，移除深色主题、卡片化界面、分页和视图切换。

## 用户价值

访客打开站点即可识别摄影作者与作品气质，不被常规博客导航、卡片和控制器分散注意力；完整作品可以连续浏览、按 Pets/Toys 筛选，并以键盘友好的大图模式查看拍摄信息。手机端应保留同样的视觉身份，同时保持快速、清晰和可操作。

## 计划模板来源

项目内不存在 `.agent/PLANS.md`，默认全局路径 `~/.codex/PLANS.md` 也不存在。本 ExecPlan 按仓库 `AGENTS.md` 的强制字段与已确认实施计划组织。

## 视觉、内容与交互论点

- 视觉论点：白色画廊墙上，超大黑色 `mraz` 字标与带彩色细框的真实照片共同形成编辑性建筑。
- 内容计划：首页展示约 18 张稳定精选与唯一 Works 入口；Works 展示完整档案；About 只保留作者、短说明、照片与联系方式。
- 交互论点：字标与照片分层进入、滚动产生轻微深度、图片 hover/focus 强调边框；reduced-motion 下全部降级为静态。

## 范围

- 保留 `/`、`/works`、`/works/:slug`、`/about`。
- 保留 React、Vite、React Router、Framer Motion、Sharp、ExifReader。
- 使用现有 125 张照片，不新增或生成替代素材。
- 不展示或写入 GPS；不新增第三方依赖；不保留深色主题。
- 最终将代码、`DESIGN.md`、本 ExecPlan 和生成后的 `photos.json` 提交并推送到 `origin/main`。

## 实施里程碑

1. 创建本 ExecPlan 并记录设计与交付决策。
2. 扩展图库生成流水线：计算照片主色并映射到五种 `frameColor`，重新生成 `public/photos.json`。
3. 重构站点内容、路由外壳、Header 与 metadata，统一为 `mraz` 浅色品牌。
4. 重构首页为超大字标穿插精选照片的画廊墙。
5. 重构 Works、专题页、筛选、瀑布流自动加载和 Lightbox。
6. 重构 About 页面与全站响应式视觉系统。
7. 运行图库生成、数据断言、lint、build 和桌面/移动端 Playwright 检查，并修复发现的问题。
8. 更新结果与复盘，清理验证产物，提交并 push 到 `origin/main`。

## 计划修改路径

- `scripts/update-gallery.js` 与生成后的 `public/photos.json`
- `src/data/siteContent.js`、`src/App.jsx`
- `src/components/Layout.jsx`、`src/components/Header.jsx`
- `src/pages/Home.jsx`、`src/pages/Works.jsx`、`src/pages/SeriesPage.jsx`、`src/pages/About.jsx`
- `src/components/Gallery/FilterBar.jsx`、`GalleryBrowser.jsx`、`MasonryGrid.jsx`、`Lightbox.jsx`
- `src/index.css`、`index.html`
- `DESIGN.md` 与本 ExecPlan

## 进度

- [x] 已创建 ExecPlan。
- [x] 已扩展主色框数据流水线并重新生成图库。
- [x] 已重构站点外壳与内容配置。
- [x] 已重构首页画廊墙。
- [x] 已重构 Works、专题、连续加载和 Lightbox。
- [x] 已重构 About 与响应式视觉系统。
- [x] 已完成数据、lint、build 和浏览器验证。
- [ ] 已完成本地提交；推送等待 GitHub 凭据。

## 决策记录

- 使用小写 `mraz` 作为正式显示品牌，界面使用英文短标签。
- 严格采用浅色白墙体系，移除主题状态、切换控件和本地存储逻辑。
- 首页是约 18 张精选组成的画廊墙，Works 是全部照片的连续档案。
- Works 每批渲染 24 张，通过 IntersectionObserver 自动追加，取消分页和视图模式。
- 照片边框色只能取 `vermillion | cobalt | marigold | fern | brass`。
- 主色计算在构建期完成，运行时只读取生成字段，避免浏览器端图像分析。
- 保留 Lightbox 的 Esc、方向键和跨当前筛选集合连续浏览。
- 直接在当前 `main` 提交并推送 `origin/main`，这是用户已确认的交付方式。

## 意外发现

- 125 张有效照片的边框色分布为 Cobalt 23、Brass 43、Marigold 28、Vermillion 30、Fern 1；数据中没有 GPS 或 `Unknown`。
- 原有 Sharp 流水线可直接完成小尺寸 raw pixel 采样，不需要新增颜色分析依赖。
- CSS columns 在桌面和手机端都能保留真实图片比例与连续墙面节奏，同时保持按钮的 DOM 顺序与键盘可达性。
- IntersectionObserver 在桌面与手机端均能从 24 张首批记录追加到 48 张，筛选 Pets 后正确收敛为 9 张并显示 End 状态。

## 验证方式

- `npm run gen-gallery`
- 已断言 125 条记录均含合法 `frameColor`，且 JSON 不含 GPS 或 `Unknown`。
- 已运行 `npm run lint`。
- 已运行 `npm run build`，并确认 `dist` 不含原始 source photos。
- 已用 Playwright 检查 1440×1000、390×844 的 Home、Works、Pets/Toys、About 与 Lightbox。
- 已验证自动追加、筛选重置、键盘操作、Lightbox EXIF、移动端布局与无控制台错误。

## 结果与复盘

- 所有页面已统一为 `mraz` 白墙画廊语言；首页与 Works 的职责清晰，访客可从精选墙进入完整档案。
- 生成期主色框字段让视觉系统可扩展且不增加浏览器端负担；自动加载消除了分页打断。
- 后续若照片数量显著增长，可仅调整 `BATCH_SIZE` 或列宽阈值，不需要改变路由和数据接口。
- 实现、设计文档与本 ExecPlan 已合并为单一本地提交；HTTPS、SSH 与 `gh` 均无可用 GitHub 凭据，推送等待用户完成认证。
