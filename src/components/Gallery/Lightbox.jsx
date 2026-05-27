import React from 'react';
import { motion as Motion } from 'framer-motion';
import { getCategoryLabel, getExifDisplayItems } from '../../data/siteContent';

const Lightbox = ({ photo, photoIndex, total, viewLabel, onClose, onNext, onPrev, styles }) => {
  if (!photo) return null;

  const exifItems = getExifDisplayItems(photo.exif);
  const positionLabel = total > 0 ? `${photoIndex + 1} / ${total}` : '';

  return (
    <Motion.div
      style={styles.lightbox}
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <Motion.div
        className="lightbox-content"
        style={styles.lightboxContent}
        onClick={(event) => event.stopPropagation()}
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 8, opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="viewer-stage" style={styles.viewerStage}>
          <div className="viewer-image-shell" style={styles.imageShell}>
            <img
              src={photo.src}
              alt={photo.displayTitle}
              className="lightbox-image"
              width={photo.width}
              height={photo.height}
              style={styles.lightboxImage}
              loading="eager"
              decoding="sync"
            />
          </div>

          <Motion.aside
            className="metadata-panel"
            style={styles.metadata}
            initial={{ opacity: 0, y: 12 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ delay: 0.03, duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div style={styles.metadataHeader}>
              <span style={styles.metadataEyebrow}>{viewLabel}</span>
              <h2 style={styles.metadataTitle} className="metadata-title">{photo.displayTitle}</h2>
            </div>

            <div style={styles.metadataMeta} className="metadata-meta">
              {photo.category && <span style={styles.metaBadge}>{getCategoryLabel(photo.category)}</span>}
              {photo.featured && <span style={styles.metaBadge}>Selected</span>}
              {positionLabel && <span style={styles.metaMuted}>{positionLabel}</span>}
              {photo.width && photo.height ? <span style={styles.metaMuted}>{photo.width} × {photo.height}</span> : null}
            </div>

            {exifItems.length ? (
              <dl style={styles.exifGrid} className="exif-grid">
                {exifItems.map((item) => (
                  <div key={`${item.label}-${item.value}`} className="exif-item">
                    <dt style={styles.exifLabel}>{item.label}</dt>
                    <dd style={styles.exifValue}>{item.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p style={styles.metaMuted}>No EXIF</p>
            )}
          </Motion.aside>
        </div>

        <button type="button" className="nav-btn nav-left" style={{ ...styles.navBtn, left: '18px' }} onClick={(event) => { event.stopPropagation(); onPrev(); }} aria-label="Previous photo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button type="button" className="nav-btn nav-right" style={{ ...styles.navBtn, right: '18px' }} onClick={(event) => { event.stopPropagation(); onNext(); }} aria-label="Next photo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
        <button type="button" className="close-btn" style={styles.closeBtn} onClick={onClose} aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </Motion.div>
    </Motion.div>
  );
};

export default Lightbox;
