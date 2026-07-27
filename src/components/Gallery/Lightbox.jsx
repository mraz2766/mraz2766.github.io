import React, { useEffect } from 'react';
import { motion as Motion, useReducedMotion } from 'framer-motion';
import { getCategoryLabel, getExifDisplayItems } from '../../data/siteContent';

const Lightbox = ({ photo, photoIndex, total, onClose, onNext, onPrev }) => {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (!photo) return null;

  const exifItems = getExifDisplayItems(photo.exif);

  return (
    <Motion.div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`Photograph: ${photo.displayTitle}`}
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.2 }}
    >
      <div className="lightbox-topbar">
        <span>{String(photoIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
        <button type="button" onClick={onClose}>Close</button>
      </div>

      <button
        type="button"
        className="lightbox-nav lightbox-prev"
        onClick={(event) => {
          event.stopPropagation();
          onPrev();
        }}
        aria-label="Previous photograph"
      >
        ←
      </button>

      <Motion.figure
        className="lightbox-figure"
        onClick={(event) => event.stopPropagation()}
        initial={reduceMotion ? false : { y: 18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 12, opacity: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="lightbox-image-stage">
          <img
            src={photo.src}
            alt={photo.displayTitle}
            width={photo.width}
            height={photo.height}
            loading="eager"
            decoding="sync"
          />
        </div>

        <figcaption className="lightbox-caption">
          <div className="lightbox-title">
            <span>{getCategoryLabel(photo.category)}</span>
            <h2>{photo.displayTitle}</h2>
          </div>

          <div className="lightbox-details">
            <span>{photo.width && photo.height ? `${photo.width} × ${photo.height}` : ''}</span>
            {exifItems.length ? (
              <dl>
                {exifItems.map((item) => (
                  <div key={`${item.label}-${item.value}`}>
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <span>No EXIF</span>
            )}
          </div>
        </figcaption>
      </Motion.figure>

      <button
        type="button"
        className="lightbox-nav lightbox-next"
        onClick={(event) => {
          event.stopPropagation();
          onNext();
        }}
        aria-label="Next photograph"
      >
        →
      </button>
    </Motion.div>
  );
};

export default Lightbox;
