import React from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const MasonryGrid = ({ photos, onPhotoClick, styles }) => {
    return (
        <div className={`gallery-grid ${styles.gridClassName}`} style={styles.grid}>
            <AnimatePresence mode="popLayout">
                {photos.map((photo) => (
                    <Motion.div
                        key={photo.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        style={styles.item}
                        onClick={() => onPhotoClick(photo.id)}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.99 }}
                    >
                        <div className="gallery-card" style={styles.imageWrapper}>
                            <img
                                src={photo.thumbnail || photo.src}
                                alt={photo.title}
                                style={styles.image}
                                loading="lazy"
                                decoding="async"
                            />
                            <div style={styles.overlay}></div>
                        </div>
                    </Motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default MasonryGrid;
