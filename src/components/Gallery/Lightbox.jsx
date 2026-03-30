import React from 'react';
import { motion as Motion } from 'framer-motion';

const ExifItem = ({ value }) => {
    if (!value || value.toString().startsWith('Unknown')) return null;
    return (
        <span style={styles.exifValue}>{value}</span>
    );
};

const Lightbox = ({ photo, onClose, onNext, onPrev, styles }) => {
    if (!photo) return null;

    return (
        <Motion.div
            style={styles.lightbox}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <Motion.div
                className="lightbox-content"
                style={styles.lightboxContent}
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
            >
                {/* Use the optimized large image if available, fallback to original src */}
                <img
                    src={photo.large || photo.src}
                    alt={photo.title}
                    className="lightbox-image"
                    style={styles.lightboxImage}
                />

                <div className="metadata-panel" style={styles.metadata}>
                    <div style={styles.exifGrid} className="exif-grid">
                        <span style={styles.metadataTitle} className="metadata-title">{photo.title}</span>
                        {photo.exif && (
                            <>
                                <span style={styles.separator} className="separator">|</span>
                                <ExifItem value={photo.exif.camera} />
                                <ExifItem value={photo.exif.lens} />
                                <ExifItem value={photo.exif.iso ? `ISO ${photo.exif.iso}` : ''} />
                                <ExifItem value={photo.exif.aperture} />
                                <ExifItem value={photo.exif.shutter ? `${photo.exif.shutter}s` : ''} />
                            </>
                        )}
                    </div>
                </div>

                <button className="nav-btn nav-left" style={{ ...styles.navBtn, left: '30px' }} onClick={(e) => { e.stopPropagation(); onPrev(); }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                <button className="nav-btn nav-right" style={{ ...styles.navBtn, right: '30px' }} onClick={(e) => { e.stopPropagation(); onNext(); }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                </button>
                <button className="close-btn" style={styles.closeBtn} onClick={onClose}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </Motion.div>
        </Motion.div>
    );
};

const styles = {
    // Re-using styles from Home.jsx, but they will be passed as props or imported.
    // For now we assume they are passed or basic inline styles for specific parts.
    // Ideally we should move styles to a separate file or CSS module.
    exifValue: {
        color: 'var(--text-secondary)',
        fontWeight: '400',
    },
    // ... other internal lightbox styles if not passed via props (we will pass them for now to minimize refactor risk)
};

export default Lightbox;
