import React from 'react';
import { motion as Motion, useReducedMotion } from 'framer-motion';

const MasonryGrid = ({ photos, onPhotoClick }) => {
  const reduceMotion = useReducedMotion();

  return (
    <div className="masonry-grid" aria-live="polite">
      {photos.map((photo, index) => (
        <Motion.button
          key={photo.id}
          type="button"
          className="masonry-tile"
          style={{ '--frame-color': `var(--color-${photo.frameColor || 'vermillion'}-frame)` }}
          onClick={() => onPhotoClick(photo.id)}
          aria-label={`View ${photo.displayTitle}`}
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduceMotion ? 0 : 0.45,
            delay: reduceMotion ? 0 : Math.min(index % 8, 4) * 0.025,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <span className="masonry-image-frame">
            <img
              src={photo.thumbnail || photo.src}
              alt={photo.displayTitle}
              width={photo.width}
              height={photo.height}
              loading="lazy"
              decoding="async"
            />
          </span>
          <span className="photo-label">
            <span>{photo.category}</span>
            <span>{photo.displayTitle}</span>
          </span>
        </Motion.button>
      ))}
    </div>
  );
};

export default MasonryGrid;
