import { CATALOG, FRANCHISES } from './catalog.js';

export { FRANCHISES };

export const SITE_TITLE = 'mraz';
export const SITE_TITLE_ZH = '收藏图鉴';
export const SITE_SUBTITLE = 'A catalog of toys, pets & light';
export const SITE_DESCRIPTION_ZH = '桌上的玩具，家里的猫狗，和偶尔落在它们身上的光。';
export const SITE_DESCRIPTION = 'Toys on my desk, the cats and dogs at home, and the light that happens to land on them.';
export const CONTACT_EMAIL = 'huangl2766@gmail.com';

export const ABOUT_BODY_ZH = [
  '这是一本不太正经的私人图鉴。大部分照片拍于工位和书桌：可动人偶、变形金刚、偶尔混进几只猫狗。',
  '每一件都编了号，能想起来的名字、系列和入手年份写在展签上；想不起来的，就先让照片自己说话。',
];
export const ABOUT_BODY = [
  'An unserious, personal catalog. Most of these were shot at a desk — action figures, transformers, and the occasional cat or dog wandering into frame.',
  'Every piece gets a number. Whatever I remember — name, series, the year it arrived — goes on the label. The rest is left to the photograph.',
];

export const SERIES_ORDER = ['All', 'Toys', 'Pets', 'Daily'];
export const SERIES_SLUGS = {
  toys: 'Toys',
  pets: 'Pets',
  daily: 'Daily',
};

export const SERIES_CONTENT = {
  All: { label: 'All', labelZh: '全部', seriesTitle: 'Catalog', seriesTitleZh: '图鉴' },
  Toys: { label: 'Toys', labelZh: '玩具', seriesTitle: 'Toys', seriesTitleZh: '玩具' },
  Pets: { label: 'Pets', labelZh: '宠物', seriesTitle: 'Pets', seriesTitleZh: '宠物' },
  Daily: { label: 'Daily', labelZh: '日常', seriesTitle: 'Daily', seriesTitleZh: '日常' },
};

/** Home page "精选 Selected" — order matters; the first one is the lead image. */
export const HOME_SELECTION = [
  'r0003833',
  'r0000279',
  '022e2a10-920b-4c6c-be39-6e9212e4c093',
  'r0001113',
  'img-2301',
  'r0000778',
  'fullsizerender-vsco',
  'r0000215',
  'wechatimg903',
];

/** Shown first within the catalog. */
const FEATURED_SLUGS = new Set([
  ...HOME_SELECTION,
  'img-1109',
  'wechatimg837',
  'img-1499',
  'img-2277',
  'r0004721',
  'r0000701',
]);

const CATALOG_FIELDS = ['name', 'nameEn', 'franchise', 'maker', 'scale', 'year', 'note'];

// Camera / phone / messenger file names that carry no meaning as a title:
// IMG_1234, WechatIMG12, R0001234, hashes, UUIDs, timestamps, "1766…_R0005190",
// "FullSizeRender_VSCO", "20210918_095509-01".
const MACHINE_LIKE_TITLE = new RegExp([
  '^(',
  'img[_-]?\\d+',
  '|wechatimg\\d+',
  '|r\\d+',
  '|[0-9a-f]{8,}',
  '|[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}',
  '|[0-9]{8,}[_-]?[0-9-]*',
  '|\\d{10,}[_-][a-z]*\\d+',
  '|fullsizerender([_-].*)?',
  ')$',
].join(''), 'i');

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

export function getSeriesBySlug(slug) {
  return SERIES_SLUGS[String(slug || '').toLowerCase()] || null;
}

export function getSeriesSlug(category) {
  return Object.keys(SERIES_SLUGS).find((slug) => SERIES_SLUGS[slug] === category) || '';
}

export function getCategoryLabel(category) {
  return getSeriesContent(category).label || category;
}

export function getFranchise(key) {
  return key ? FRANCHISES[key] || { en: key, zh: '' } : null;
}

export function formatCatalogNumber(id) {
  return String(id || 0).padStart(3, '0');
}

export function formatDisplayTitle(photo) {
  if (!photo) return '';

  const rawTitle = String(photo.title || '').trim();
  if (!rawTitle || MACHINE_LIKE_TITLE.test(rawTitle)) {
    return `${getCategoryLabel(photo.category)} No.${formatCatalogNumber(photo.id)}`;
  }

  return rawTitle.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim();
}

export function enrichPhoto(photo) {
  const slug = getPhotoSlug(photo);
  const entry = CATALOG[slug] || {};
  // Always overwrite catalog fields so stale values baked into photos.json
  // never win over the current catalog.js.
  const catalogFields = Object.fromEntries(CATALOG_FIELDS.map((field) => [field, entry[field] || '']));
  const fallbackTitle = formatDisplayTitle(photo);
  const names = [catalogFields.name, catalogFields.nameEn].filter(Boolean);

  return {
    ...photo,
    ...catalogFields,
    slug,
    no: formatCatalogNumber(photo.id),
    featured: FEATURED_SLUGS.has(slug),
    catalogued: names.length > 0,
    displayTitle: names.length ? names.join(' · ') : fallbackTitle,
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

  const grouped = SERIES_ORDER.filter((item) => item !== 'All').map((item) => ({
    featured: enriched.filter((photo) => photo.category === item && photo.featured),
    regular: enriched.filter((photo) => photo.category === item && !photo.featured),
  }));

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

  return [...ordered, ...grouped.flatMap((group) => group.regular)];
}

/** Franchise → count for the catalogued photos, most common first. */
export function getFranchiseIndex(photos) {
  const counts = new Map();
  photos.forEach((photo) => {
    if (photo.franchise) counts.set(photo.franchise, (counts.get(photo.franchise) || 0) + 1);
  });

  return [...counts.entries()]
    .map(([key, count]) => ({ key, count, ...getFranchise(key) }))
    .sort((left, right) => right.count - left.count || left.en.localeCompare(right.en));
}

// EXIF model codes → readable names.
const CAMERA_NAMES = {
  'SM-G9730': 'Samsung Galaxy S10',
};

export function getCameraName(camera) {
  return CAMERA_NAMES[camera] || camera || '';
}

/** Camera → count from EXIF. */
export function getCameraIndex(photos) {
  const counts = new Map();
  photos.forEach((photo) => {
    const camera = getCameraName(photo.exif?.camera);
    if (camera) counts.set(camera, (counts.get(camera) || 0) + 1);
  });
  return [...counts.entries()].sort((left, right) => right[1] - left[1]);
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
    { label: 'Camera', labelZh: '相机', value: getCameraName(exif.camera) },
    { label: 'Lens', labelZh: '镜头', value: exif.lens },
    { label: 'Aperture', labelZh: '光圈', value: exif.aperture },
    { label: 'Shutter', labelZh: '快门', value: formatShutter(exif.shutter) },
    { label: 'ISO', labelZh: '感光度', value: exif.iso ? `ISO ${exif.iso}` : '' },
  ];

  return items.filter((item) => isMeaningfulExifValue(item.value));
}

export function getLabelItems(photo) {
  const franchise = getFranchise(photo.franchise);
  return [
    { label: 'Series', labelZh: '系列', value: franchise ? [franchise.zh, franchise.en].filter(Boolean).join(' ') : '' },
    { label: 'Maker', labelZh: '品牌', value: photo.maker },
    { label: 'Scale', labelZh: '比例', value: photo.scale },
    { label: 'Acquired', labelZh: '入手', value: photo.year },
    { label: 'Category', labelZh: '分类', value: `${getSeriesContent(photo.category).labelZh} ${getCategoryLabel(photo.category)}` },
  ].filter((item) => item.value);
}
