export const SITE_TITLE = 'mraz';
export const SITE_TAGLINE = 'Photography';
export const SITE_DESCRIPTION = 'Pets, toys, light.';
export const ABOUT_BODY = 'Photographs of daily life, collections, and light.';

export const SERIES_ORDER = ['All', 'Pets', 'Toys'];
export const SERIES_SLUGS = {
  pets: 'Pets',
  toys: 'Toys',
};

export const SERIES_CONTENT = {
  All: {
    label: 'All',
    eyebrow: '',
    heroTitle: 'Works',
    heroText: '',
    seriesTitle: 'Works',
    seriesDescription: '',
    archiveTitle: 'Works',
    archiveSummary: '',
    issue: 'All',
    byline: '',
  },
  Pets: {
    label: 'Pets',
    eyebrow: '',
    heroTitle: 'Pets',
    heroText: '',
    seriesTitle: 'Pets',
    seriesDescription: '',
    archiveTitle: 'Pets',
    archiveSummary: '',
    issue: 'Pets',
    byline: '',
    readLabel: 'View Pets',
  },
  Toys: {
    label: 'Toys',
    eyebrow: '',
    heroTitle: 'Toys',
    heroText: '',
    seriesTitle: 'Toys',
    seriesDescription: '',
    archiveTitle: 'Toys',
    archiveSummary: '',
    issue: 'Toys',
    byline: '',
    readLabel: 'View Toys',
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

export function getCategoryLabel(category) {
  return getSeriesContent(category).label || category;
}

export function formatDisplayTitle(photo) {
  if (!photo) return '';
  if (photo.displayTitle) return photo.displayTitle;

  const rawTitle = String(photo.title || '').trim();
  if (!rawTitle) return `Photo ${String(photo.id || '').padStart(2, '0')}`;

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
