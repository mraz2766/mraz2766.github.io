import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import photosData from '../photos.json'; // Import photos data

const About = () => {
    // Select a random photo from the available photos
    const randomPhoto = useMemo(() => {
        if (!photosData || photosData.length === 0) {
            // Fallback if no photos are available
            return {
                src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
                alt: 'Default Portrait'
            };
        }
        const randomIndex = Math.floor(Math.random() * photosData.length);
        return {
            src: photosData[randomIndex].src,
            alt: photosData[randomIndex].title || 'Gallery Image'
        };
    }, [photosData]);

    return (
        <div style={styles.container}>
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                style={styles.content}
            >
                <h1 style={styles.title}>No excuse</h1>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                style={styles.imageContainer}
            >
                <img
                    src={randomPhoto.src}
                    alt={randomPhoto.alt}
                    style={styles.image}
                />
            </motion.div>
        </div>
    );
};

const styles = {
    container: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 'var(--spacing-xl)',
        alignItems: 'center',
        minHeight: '70vh',
    },
    content: {
        maxWidth: '550px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
    },
    title: {
        fontSize: '4.5rem',
        fontWeight: '700',
        color: 'var(--text-color-primary)',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: '-0.03em',
    },
    imageContainer: {
        width: '100%',
        height: '600px',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    }
};

export default About;