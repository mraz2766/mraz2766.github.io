import React, { useMemo, useSyncExternalStore } from 'react';
import { m as Motion, useReducedMotion } from 'framer-motion';
import { SpecimenLabel } from '../Specimen';

// Column count mirrors the old CSS `columns` breakpoints.
const TWO_COLUMN_QUERY = '(max-width: 900px)';
// Approximate caption height as a fraction of tile width, so columns balance
// on what is actually rendered rather than on image area alone.
const LABEL_RATIO = 0.16;

function subscribe(callback) {
  const query = window.matchMedia(TWO_COLUMN_QUERY);
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}

function useColumnCount() {
  return useSyncExternalStore(
    subscribe,
    () => (window.matchMedia(TWO_COLUMN_QUERY).matches ? 2 : 3),
    () => 3
  );
}

/**
 * Greedy "shortest column first" placement using the known aspect ratios.
 * Unlike CSS multi-column layout, a tile's column depends only on the tiles
 * before it, so appending the next batch never reshuffles what is on screen,
 * and the reading order runs left to right.
 */
function distribute(photos, columnCount) {
  const columns = Array.from({ length: columnCount }, () => ({ height: 0, items: [] }));

  photos.forEach((photo, index) => {
    const ratio = photo.width && photo.height ? photo.height / photo.width : 1;
    let target = columns[0];
    for (const column of columns) {
      if (column.height < target.height - 0.001) target = column;
    }
    target.items.push({ photo, index });
    target.height += ratio + LABEL_RATIO;
  });

  return columns.map((column) => column.items);
}

const MasonryGrid = ({ photos, onPhotoClick }) => {
  const reduceMotion = useReducedMotion();
  const columnCount = useColumnCount();
  const columns = useMemo(() => distribute(photos, columnCount), [photos, columnCount]);

  return (
    <div className="masonry-grid" style={{ '--masonry-columns': columnCount }}>
      {columns.map((items, columnIndex) => (
        <div className="masonry-column" key={columnIndex}>
          {items.map(({ photo, index }) => (
            <Motion.button
              key={photo.id}
              type="button"
              className="masonry-tile specimen-card"
              data-photo-slug={photo.slug}
              style={{ '--frame-color': `var(--color-${photo.frameColor || 'vermillion'}-frame)` }}
              onClick={() => onPhotoClick(photo.slug)}
              aria-label={`No.${photo.no} ${photo.displayTitle}`}
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reduceMotion ? 0 : 0.45,
                delay: reduceMotion ? 0 : Math.min(index % 8, 4) * 0.025,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <span className="specimen-frame">
                <img
                  src={photo.thumbnail || photo.src}
                  alt=""
                  width={photo.width}
                  height={photo.height}
                  loading={index < 6 ? 'eager' : 'lazy'}
                  fetchPriority={index < 3 ? 'high' : undefined}
                  decoding="async"
                />
              </span>
              <SpecimenLabel photo={photo} />
            </Motion.button>
          ))}
        </div>
      ))}
    </div>
  );
};

export default MasonryGrid;
