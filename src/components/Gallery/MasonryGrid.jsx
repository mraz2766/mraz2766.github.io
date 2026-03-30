import React from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const getCardRatio = (photo) => {
    if (!photo.width || !photo.height) return '4 / 5';

    const ratio = photo.width / photo.height;
    if (ratio >= 1.55) return '3 / 2';
    if (ratio >= 1.1) return '4 / 3';
    if (ratio >= 0.82) return '1 / 1';
    return '4 / 5';
};

const MasonryGrid = ({ photos, onPhotoClick, styles }) => {
    const [enableEnterAnimation, setEnableEnterAnimation] = React.useState(false);

    React.useEffect(() => {
        if (photos.length > 0 && !enableEnterAnimation) {
            setEnableEnterAnimation(true);
        }
    }, [photos.length, enableEnterAnimation]);

    return (
        <div className={`gallery-grid ${styles.gridClassName}`} style={styles.grid}>
            <AnimatePresence initial={false} mode="popLayout">
                {photos.map((photo) => (
                    <Motion.div
                        key={photo.id}
                        initial={enableEnterAnimation ? { opacity: 0, y: 12 } : false}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        style={styles.item}
                        onClick={() => onPhotoClick(photo.id)}
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.99 }}
                    >
                        <div
                            className="gallery-card"
                            style={{
                                ...styles.imageWrapper,
                                aspectRatio: getCardRatio(photo),
                            }}
                        >
                            <img
                                src={photo.thumbnail || photo.src}
                                alt={photo.title}
                                width={photo.width}
                                height={photo.height}
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
