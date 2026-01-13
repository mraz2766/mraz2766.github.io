import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MasonryGrid = ({ photos, onPhotoClick, styles }) => {
    return (
        <motion.div className="grid-container" style={styles.grid} layout>
            <AnimatePresence mode='popLayout'>
                {photos.map((photo) => (
                    <motion.div
                        key={photo.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4 }}
                        style={styles.item}
                        onClick={() => onPhotoClick(photo.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div style={styles.imageWrapper}>
                            <img
                                src={photo.thumbnail || photo.src}
                                alt={photo.title}
                                style={styles.image}
                                loading="lazy"
                                decoding="async"
                            />
                            <div style={styles.overlay}></div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </motion.div>
    );
};

export default MasonryGrid;
