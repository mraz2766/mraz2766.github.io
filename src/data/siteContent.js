export const SITE_TITLE = 'Minimalist Lens';
export const SITE_TAGLINE = '一组围绕陪伴、收藏与日常注视展开的个人图像练习。';
export const SITE_DESCRIPTION = 'Minimalist Lens 是一个克制的个人作品集，收录 Pets 与 Toys 两组持续更新的图像观察。';

export const VIEW_MODES = [
  { key: 'default', label: '精选', hint: '更有呼吸感的编排' },
  { key: 'compact', label: '标准', hint: '保持节奏与密度平衡' },
  { key: 'micro', label: '速览', hint: '快速扫览全部作品' },
];

export const SERIES_ORDER = ['All', 'Pets', 'Toys'];

export const SERIES_CONTENT = {
  All: {
    label: '全部',
    eyebrow: 'Curated Selection',
    heroTitle: '从陪伴与收藏里，整理出日常观看的秩序。',
    heroText: '这里不是按时间堆叠的相册，而是一组经过重新排序的个人图像。先看精选，再进入完整系列。',
    seriesTitle: '本期选集',
    seriesDescription: 'Pets 与 Toys 交替出现，构成这个站点最稳定的两条观看线索。',
  },
  Pets: {
    label: '宠物',
    eyebrow: 'Series / 宠物',
    heroTitle: '在亲密关系里捕捉情绪最轻的瞬间。',
    heroText: '更靠近生活现场，保留临场感、停顿感和被陪伴包围时的温度。',
    seriesTitle: '宠物系列',
    seriesDescription: '关于陪伴、栖居与目光停留的记录，画面更柔软，也更接近日常。',
  },
  Toys: {
    label: '玩具',
    eyebrow: 'Series / 玩具',
    heroTitle: '把收藏陈列成一组带有秩序感的静物肖像。',
    heroText: '更强调材质、比例和摆放关系，让物件本身在安静背景中建立自己的气质。',
    seriesTitle: '玩具系列',
    seriesDescription: '关于收藏、表面细节与陈列关系的观察，画面更克制，也更有结构。',
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

export function getViewModeMeta(viewMode) {
  return VIEW_MODES.find((mode) => mode.key === viewMode) || VIEW_MODES[0];
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

export function getVisibleExif(exif = {}) {
  const items = [
    exif.camera,
    exif.lens,
    exif.iso ? `ISO ${exif.iso}` : '',
    exif.aperture,
    exif.shutter ? `${exif.shutter}s` : '',
  ];

  return items.filter((item) => item && !String(item).startsWith('Unknown'));
}
