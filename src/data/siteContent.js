export const SITE_TITLE = 'Minimalist Lens';
export const SITE_TAGLINE = '摄影栏目';
export const SITE_DESCRIPTION = 'Minimalist Lens 以中文摄影博客的方式整理宠物与玩具两组长期图像观察，让观看更像阅读一篇缓慢展开的专题。';
export const HOME_HERO_TITLE = '把陪伴与收藏，写成两篇可以反复翻看的摄影专题。';
export const HOME_HERO_TEXT = '这里不再是单纯的作品瀑布流，而是一份按系列整理的摄影栏目。先读题头，再进入图像本身。';
export const HOME_SECTION_TITLE = '最新专题';
export const HOME_SECTION_BODY = '两个系列构成目前的全部栏目：一个更靠近生活关系，一个更靠近物件陈列。';
export const WORKS_ARCHIVE_TITLE = '作品';
export const WORKS_ARCHIVE_BODY = '所有内容都按系列整理，你可以直接进入不同主题浏览。';
export const ABOUT_TITLE = '关于这个站点';
export const ABOUT_BODY = '我习惯把日常里值得回看的瞬间整理成专题，而不是简单存成相册。宠物与玩具是目前最稳定的两条线索：前者记录关系与情绪，后者记录陈列、表面与收藏的秩序。';

export const VIEW_MODES = [
  { key: 'default', label: '标准', hint: '保留更舒展的阅读节奏' },
  { key: 'compact', label: '稠密', hint: '提高每屏可见的画面数量' },
  { key: 'micro', label: '归档', hint: '快速查看完整图像目录' },
];

export const SERIES_ORDER = ['All', 'Pets', 'Toys'];
export const SERIES_SLUGS = {
  pets: 'Pets',
  toys: 'Toys',
};

export const SERIES_CONTENT = {
  All: {
    label: '全部',
    eyebrow: '',
    heroTitle: '从陪伴与收藏出发，整理两组持续更新的图像专题。',
    heroText: '这里更像归档页而不是传统图库。先浏览每个专题的题头与摘要，再决定进入哪一条观看线索。',
    seriesTitle: '全部作品',
    seriesDescription: '宠物与玩具交替出现，构成这个站点最稳定的两条观察路径。',
    archiveTitle: '全部作品',
    archiveSummary: '按系列整理的摄影归档，适合从摘要进入，再回到图像序列。',
    issue: '2026 春',
    byline: '栏目整理',
  },
  Pets: {
    label: '宠物',
    eyebrow: '专题一',
    heroTitle: '宠物：在陪伴关系里，捕捉那些轻微却反复出现的情绪。',
    heroText: '这一组更靠近生活现场，画面里常常有停顿、有注视，也有亲密关系里最轻的波动。',
    seriesTitle: '宠物专题',
    seriesDescription: '关于陪伴、栖居与目光停留的记录，画面更柔软，也更接近日常。',
    archiveTitle: '宠物：亲密关系里的轻声注视',
    archiveSummary: '从卧室、沙发、窗边到临时停留的角落，这个系列记录陪伴关系中最不需要解释的部分。',
    issue: '专题一',
    byline: '日常观察',
    readLabel: '继续阅读宠物专题',
  },
  Toys: {
    label: '玩具',
    eyebrow: '专题二',
    heroTitle: '玩具：把收藏与陈列，整理成一组有秩序的静物肖像。',
    heroText: '这一组更强调材质、比例和摆放关系，让物件本身在安静背景中慢慢建立自己的气质。',
    seriesTitle: '玩具专题',
    seriesDescription: '关于收藏、表面细节与陈列关系的观察，画面更克制，也更有结构。',
    archiveTitle: '玩具：收藏如何在桌面上形成自己的秩序',
    archiveSummary: '从单体肖像到成组陈列，这个系列记录物件如何通过摆放、质感与比例获得新的表情。',
    issue: '专题二',
    byline: '静物整理',
    readLabel: '继续阅读玩具专题',
  },
};

const FEATURED_SLUGS = new Set([
  'img-2301',
  'img-1109',
  'wechatimg837',
  'wechatimg903',
  '022e2a10-920b-4c6c-be39-6e9212e4c093',
  'fullsizerender-vsco',
  'img-1499',
  'img-2277',
  'r0004721',
  'r0003833',
]);

const MACHINE_LIKE_TITLE = /^(img[_-]?\d+|wechatimg\d+|r\d+|[0-9a-f]{8,}|[0-9]{8,}[_-]?[0-9-]*)$/i;

export function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\.[^/.]+$/, '')
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function getPhotoSlug(photo) {
  return slugify(photo?.title || photo?.src || '');
}

export function getSeriesContent(category) {
  return SERIES_CONTENT[category] || SERIES_CONTENT.All;
}

export function getSeriesBySlug(slug, asContent = false) {
  const key = SERIES_SLUGS[String(slug || '').toLowerCase()];
  if (!key) return null;
  return asContent ? getSeriesContent(key) : key;
}

export function getViewModeMeta(viewMode) {
  return VIEW_MODES.find((mode) => mode.key === viewMode) || VIEW_MODES[0];
}

export function getCategoryLabel(category) {
  return getSeriesContent(category).label || category;
}

export function formatDisplayTitle(photo) {
  if (!photo) return '';
  if (photo.displayTitle) return photo.displayTitle;

  const rawTitle = String(photo.title || '').trim();
  if (!rawTitle) return `作品 ${String(photo.id || '').padStart(2, '0')}`;

  const normalized = rawTitle.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim();

  if (MACHINE_LIKE_TITLE.test(rawTitle)) {
    const serial = String(photo.id || '').padStart(2, '0');
    return `${getSeriesContent(photo.category).label} ${serial}`;
  }

  return normalized;
}

export function enrichPhoto(photo) {
  const slug = getPhotoSlug(photo);
  const series = getSeriesContent(photo.category);

  return {
    ...photo,
    slug,
    featured: photo.featured ?? FEATURED_SLUGS.has(slug),
    displayTitle: photo.displayTitle || formatDisplayTitle(photo),
    seriesDescription: photo.seriesDescription || series.seriesDescription,
    year: photo.year || '',
  };
}

export function sortPhotosForDisplay(photos, category = 'All') {
  const enriched = photos.map(enrichPhoto);

  if (category !== 'All') {
    return [
      ...enriched.filter((photo) => photo.featured),
      ...enriched.filter((photo) => !photo.featured),
    ];
  }

  const grouped = SERIES_ORDER.filter((item) => item !== 'All').map((item) => {
    const featured = enriched.filter((photo) => photo.category === item && photo.featured);
    const regular = enriched.filter((photo) => photo.category === item && !photo.featured);
    return { featured, regular };
  });

  const ordered = [];
  let changed = true;

  while (changed) {
    changed = false;

    grouped.forEach((group) => {
      if (group.featured.length) {
        ordered.push(group.featured.shift());
        changed = true;
      }
    });
  }

  return [
    ...ordered,
    ...grouped.flatMap((group) => group.regular),
  ];
}

function isMeaningfulExifValue(value) {
  const normalized = String(value ?? '').trim();
  return normalized && !/^unknown/i.test(normalized);
}

function formatShutter(value) {
  if (!isMeaningfulExifValue(value)) return '';
  const normalized = String(value).trim();
  if (normalized.endsWith('s')) return normalized;
  return normalized.includes('/') ? `${normalized}s` : normalized;
}

export function getExifDisplayItems(exif = {}) {
  const items = [
    { label: 'CAMERA', value: exif.camera },
    { label: 'LENS', value: exif.lens },
    { label: 'F', value: exif.aperture },
    { label: 'SPEED', value: formatShutter(exif.shutter) },
    { label: 'ISO', value: exif.iso ? `ISO ${exif.iso}` : '' },
  ];

  return items.filter((item) => isMeaningfulExifValue(item.value));
}
