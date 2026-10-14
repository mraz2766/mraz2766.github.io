import React, { useEffect, useRef, useState } from 'react';
import { m as Motion, useReducedMotion } from 'framer-motion';
import { getExifDisplayItems, getLabelItems } from '../../data/siteContent';
import { SpecimenLabel } from '../Specimen';

const SWIPE_THRESHOLD = 48;

/**
 * Shows the (already cached) thumbnail immediately, then fades the full-size
 * image in on top once it has loaded — no black gap while it downloads.
 */
const LightboxImage = ({ photo }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="lightbox-image-stage">
      {photo.thumbnail ? (
        <img
          className="lightbox-image lightbox-image-preview"
          src={photo.thumbnail}
          alt=""
          aria-hidden="true"
          width={photo.width}
          height={photo.height}
        />
      ) : null}
      <img
        className={loaded ? 'lightbox-image is-loaded' : 'lightbox-image'}
        src={photo.src}
        alt={photo.displayTitle}
        width={photo.width}
        height={photo.height}
        decoding="async"
        fetchPriority="high"
        onLoad={() => setLoaded(true)}
        // Clicking the photo itself shouldn't dismiss; the dark area around it does.
        onClick={(event) => event.stopPropagation()}
      />
      {!loaded ? <span className="lightbox-loading" aria-hidden="true">Loading</span> : null}
    </div>
  );
};

const Lightbox = ({ photo, photoIndex, total, neighbors = [], onClose, onNext, onPrev }) => {
  const reduceMotion = useReducedMotion();
  const closeButtonRef = useRef(null);
  const touchStart = useRef(null);

  // Lock page scroll and move focus into the dialog.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowRight') onNext();
      else if (event.key === 'ArrowLeft') onPrev();
      else if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev]);

  // Warm the cache for the neighbours so arrow / swipe navigation feels instant.
  useEffect(() => {
    neighbors.forEach((neighbor) => {
      if (!neighbor || neighbor.slug === photo.slug) return;
      const image = new Image();
      image.decoding = 'async';
      image.src = neighbor.src;
    });
  }, [neighbors, photo.slug]);

  const handleTouchStart = (event) => {
    if (event.touches.length !== 1) {
      touchStart.current = null;
      return;
    }
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;

    if (Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0) onNext();
      else onPrev();
    } else if (deltaY > SWIPE_THRESHOLD * 2 && deltaY > Math.abs(deltaX) * 1.5) {
      onClose();
    }
  };

  const exifItems = getExifDisplayItems(photo.exif);
  const labelItems = getLabelItems(photo);
  const counter = `${String(photoIndex + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;

  return (
    <Motion.div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`Photograph: ${photo.displayTitle}`}
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.2 }}
    >
      <div className="lightbox-topbar" onClick={(event) => event.stopPropagation()}>
        <div className="lightbox-counter">
          <button type="button" className="lightbox-step" onClick={onPrev} aria-label="Previous photograph">←</button>
          <span aria-live="polite">{counter}</span>
          <button type="button" className="lightbox-step" onClick={onNext} aria-label="Next photograph">→</button>
        </div>
        <button type="button" ref={closeButtonRef} onClick={onClose}>关闭 <span lang="en">Close</span></button>
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
        initial={reduceMotion ? false : { y: 18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 12, opacity: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <LightboxImage key={photo.slug} photo={photo} />

        <figcaption className="lightbox-sheet" onClick={(event) => event.stopPropagation()}>
          <SpecimenLabel photo={photo} />

          {labelItems.length ? (
            <dl className="sheet-list">
              {labelItems.map((item) => (
                <div key={item.label}>
                  <dt>{item.labelZh} <span lang="en">{item.label}</span></dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {photo.note ? <p className="sheet-note">{photo.note}</p> : null}

          <div className="sheet-section">
            <span className="sheet-heading">拍摄 <span lang="en">Photographed</span></span>
            <dl className="sheet-list" lang="en">
              {exifItems.map((item) => (
                <div key={item.label}>
                  <dt>{item.labelZh} <span lang="en">{item.label}</span></dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
              {photo.width && photo.height ? (
                <div>
                  <dt>尺寸 <span lang="en">Size</span></dt>
                  <dd>{photo.width} × {photo.height}</dd>
                </div>
              ) : null}
            </dl>
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
