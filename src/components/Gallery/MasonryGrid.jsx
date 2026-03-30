import React from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const getVariantStyle = (photo) => {
    switch (photo.layoutVariant) {
        case 'hero':
            return {
                wrapper: { aspectRatio: '16 / 10' },
                image: { objectFit: 'cover' },
                className: 'variant-hero',
            };
        case 'wide':
            return {
                wrapper: { aspectRatio: '3 / 2' },
                image: { objectFit: 'cover' },
                className: 'variant-wide',
            };
        case 'landscape':
            return {
                wrapper: { aspectRatio: '4 / 3' },
                image: { objectFit: 'cover' },
                className: 'variant-landscape',
            };
        case 'tall':
            return {
                wrapper: { aspectRatio: '4 / 5', padding: '0.55rem' },
                image: { objectFit: 'contain' },
                className: 'variant-tall',
            };
        case 'portrait':
            return {
                wrapper: { aspectRatio: '4 / 5', padding: '0.45rem' },
                image: { objectFit: 'contain' },
                className: 'variant-portrait',
            };
        case 'square-wide':
            return {
                wrapper: { aspectRatio: '1 / 1' },
                image: { objectFit: 'cover' },
                className: 'variant-square-wide',
            };
        case 'square':
            return {
                wrapper: { aspectRatio: '1 / 1' },
                image: { objectFit: 'cover' },
                className: 'variant-square',
            };
        case 'micro':
            return {
                wrapper: { aspectRatio: '1 / 1', padding: photo.orientation === 'portrait' ? '0.16rem' : 0 },
                image: { objectFit: photo.orientation === 'portrait' ? 'contain' : 'cover' },
                className: 'variant-micro',
            };
        default:
            return {
                wrapper: { aspectRatio: '4 / 5' },
                image: { objectFit: 'cover' },
                className: 'variant-standard',
            };
    }
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
                    <Motion.article
                        key={photo.id}
                        initial={enableEnterAnimation ? { opacity: 0, y: 12 } : false}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        style={styles.item}
                        className={`gallery-cell ${getVariantStyle(photo).className}`}
                        onClick={() => onPhotoClick(photo.id)}
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.99 }}
                    >
                        <div
                            className="gallery-card"
                            style={{
                                ...styles.imageWrapper,
                                ...getVariantStyle(photo).wrapper,
                            }}
                        >
                            <img
                                src={photo.thumbnail || photo.src}
                                alt={photo.title}
                                width={photo.width}
                                height={photo.height}
                                style={{ ...styles.image, ...getVariantStyle(photo).image }}
                                loading="lazy"
                                decoding="async"
                            />
                            <div style={styles.overlay}></div>
                        </div>
                    </Motion.article>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default MasonryGrid;
