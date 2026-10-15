import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { m as Motion, useReducedMotion } from 'framer-motion';
import { getExifDisplayItems, getLabelItems } from '../../data/siteContent';
import { containRect, fly, takeFlightSource } from '../../lib/flight';
import { SpecimenLabel } from '../Specimen';

const SWIPE_THRESHOLD = 56;
const DOUBLE_TAP_MS = 280;

function setZoomOrigin(stage, clientX, clientY) {
  if (!stage) return;
  const rect = stage.getBoundingClientRect();
  const x = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
  const y = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100));
  stage.style.setProperty('--zx', `${x}%`);
  stage.style.setProperty('--zy', `${y}%`);
}

/**
 * Shows the cached thumbnail immediately, fades the full image in on top,
 * slides in from the navigation direction, and supports click / double-tap
 * zoom that follows the pointer.
 */
const LightboxImage = ({ photo, direction, zoomed, onToggleZoom }) => {
  const [loaded, setLoaded] = useState(false);
  const stageRef = useRef(null);
  const lastTap = useRef(0);

  const toggleAt = (clientX, clientY) => {
    setZoomOrigin(stageRef.current, clientX, clientY);
    onToggleZoom();
  };

  const stageClass = [
    'lightbox-image-stage',
    direction > 0 ? 'enter-next' : '',
    direction < 0 ? 'enter-prev' : '',
    zoomed ? 'is-zoomed' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={stageRef}
      className={stageClass}
      data-cursor={zoomed ? '缩小 Out' : '放大 Zoom'}
      onMouseMove={(event) => { if (zoomed) setZoomOrigin(stageRef.current, event.clientX, event.clientY); }}
      onTouchMove={(event) => {
        if (zoomed && event.touches.length === 1) {
          setZoomOrigin(stageRef.current, event.touches[0].clientX, event.touches[0].clientY);
        }
      }}
      onTouchEnd={(event) => {
        if (event.changedTouches.length !== 1) return;
        const now = performance.now();
        if (now - lastTap.current < DOUBLE_TAP_MS) {
          const touch = event.changedTouches[0];
          event.preventDefault();
          toggleAt(touch.clientX, touch.clientY);
          lastTap.current = 0;
        } else {
          lastTap.current = now;
        }
      }}
    >
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
        // Clicking the photo zooms; the dark area around it closes.
        onClick={(event) => {
          event.stopPropagation();
          // Touch devices use double-tap instead of a single click.
          if (event.nativeEvent.pointerType === 'touch' || event.detail === 0) return;
          toggleAt(event.clientX, event.clientY);
        }}
      />
      {!loaded ? <span className="lightbox-loading" aria-hidden="true">载入 Loading</span> : null}
    </div>
  );
};

const Lightbox = ({
  photo,
  photoIndex,
  total,
  neighbors = [],
  direction = 0,
  onClose,
  onNext,
  onPrev,
  onRandom,
}) => {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef(null);
  const closeButtonRef = useRef(null);
  const touchStart = useRef(null);
  const [zoomedSlug, setZoomedSlug] = useState(null);
  const zoomed = zoomedSlug === photo.slug;

  // Lock page scroll and move focus into the dialog.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // Shared-element flight from the clicked tile into the stage.
  useLayoutEffect(() => {
    const source = takeFlightSource(photo.slug);
    const stage = rootRef.current?.querySelector('.lightbox-image-stage');
    if (!source || !stage || !photo.width || !photo.height) return;

    // Only fly when the tile shows the whole photo (same aspect ratio);
    // cropped thumbnails would visibly stretch.
    const sourceRatio = source.rect.width / source.rect.height;
    const photoRatio = photo.width / photo.height;
    if (Math.abs(sourceRatio - photoRatio) / photoRatio > 0.06) return;

    const target = containRect(stage.getBoundingClientRect(), photo.width, photo.height);
    stage.classList.add('is-hidden');
    fly({ src: source.src, from: source.rect, to: target }).then(() => {
      stage.classList.remove('is-hidden');
    });
    // Only on mount: later photos arrive via prev/next.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowRight') onNext();
      else if (event.key === 'ArrowLeft') onPrev();
      else if (event.key === 'Escape') {
        if (zoomed) setZoomedSlug(null);
        else onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev, zoomed]);

  // Warm the cache for the neighbours so arrow / swipe navigation feels instant.
  useEffect(() => {
    neighbors.forEach((neighbor) => {
      if (!neighbor || neighbor.slug === photo.slug) return;
      const image = new Image();
      image.decoding = 'async';
      image.src = neighbor.src;
    });
  }, [neighbors, photo.slug]);

  const setDrag = (value, dragging) => {
    const root = rootRef.current;
    if (!root) return;
    root.style.setProperty('--drag-x', `${value}px`);
    root.classList.toggle('is-dragging', dragging);
  };

  const handleTouchStart = (event) => {
    if (zoomed || event.touches.length !== 1) {
      touchStart.current = null;
      return;
    }
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY, horizontal: null };
  };

  // The photo follows the finger horizontally while swiping.
  const handleTouchMove = (event) => {
    const start = touchStart.current;
    if (!start || event.touches.length !== 1) return;
    const touch = event.touches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (start.horizontal === null && Math.abs(deltaX) + Math.abs(deltaY) > 8) {
      start.horizontal = Math.abs(deltaX) > Math.abs(deltaY);
    }
    if (start.horizontal) setDrag(deltaX, true);
  };

  const handleTouchEnd = (event) => {
    const start = touchStart.current;
    touchStart.current = null;
    setDrag(0, false);
    if (!start) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;

    const horizontal = start.horizontal ?? Math.abs(deltaX) > Math.abs(deltaY);

    if (horizontal && Math.abs(deltaX) > SWIPE_THRESHOLD) {
      if (deltaX < 0) onNext();
      else onPrev();
    } else if (!horizontal && deltaY > SWIPE_THRESHOLD * 2) {
      onClose();
    }
  };

  const exifItems = getExifDisplayItems(photo.exif);
  const labelItems = getLabelItems(photo);
  const counter = `${String(photoIndex + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;

  return (
    <Motion.div
      ref={rootRef}
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`Photograph: ${photo.displayTitle}`}
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.25 }}
    >
      <div className="lightbox-topbar" onClick={(event) => event.stopPropagation()}>
        <div className="lightbox-counter">
          <button type="button" className="lightbox-step" onClick={onPrev} aria-label="Previous photograph">←</button>
          <span aria-live="polite">{counter}</span>
          <button type="button" className="lightbox-step" onClick={onNext} aria-label="Next photograph">→</button>
        </div>
        <div className="lightbox-actions">
          {onRandom ? (
            <button type="button" className="lightbox-random" onClick={onRandom}>
              随机 <span lang="en">Random</span>
            </button>
          ) : null}
          <button type="button" className="lightbox-close" ref={closeButtonRef} onClick={onClose}>
            关闭 <span lang="en">Close</span>
          </button>
        </div>
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

      <figure className="lightbox-figure">
        <LightboxImage
          key={photo.slug}
          photo={photo}
          direction={direction}
          zoomed={zoomed}
          onToggleZoom={() => setZoomedSlug(zoomed ? null : photo.slug)}
        />

        <figcaption
          key={`sheet-${photo.slug}`}
          className="lightbox-sheet"
          onClick={(event) => event.stopPropagation()}
        >
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

          <p className="sheet-hint" aria-hidden="true">
            ← → 切换 · 点击放大 · Esc 关闭
          </p>
        </figcaption>
      </figure>

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
