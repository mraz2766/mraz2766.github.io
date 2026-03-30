import React, { useEffect, useState } from 'react';
import { loadPhotosList } from '../lib/photoData';

const About = () => {
    const [randomPhoto, setRandomPhoto] = useState(null);

    useEffect(() => {
        loadPhotosList()
            .then(data => {
                if (data && data.length > 0) {
                    const randomIndex = Math.floor(Math.random() * data.length);
                    setRandomPhoto(data[randomIndex]);
                }
            })
            .catch(e => console.error("Failed to load photo for About:", e));
    }, []);

    return (
        <div style={styles.container}>
            <div style={styles.imageWrapper} className="about-image-wrapper">
                {randomPhoto ? (
                    <img
                        src={randomPhoto.medium || randomPhoto.src}
                        alt={randomPhoto.title || 'Gallery Image'}
                        width={randomPhoto.width}
                        height={randomPhoto.height}
                        style={styles.image}
                    />
                ) : (
                    <div style={styles.placeholder} />
                )}
            </div>

            <div style={styles.contactWrapper}>
                <span style={styles.label}>Get in touch</span>
                <a href="mailto:huangl2766@gmail.com" style={styles.email} className="about-email">
                    huangl2766@gmail.com
                </a>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '90vh', // Increased for better vertical centering
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        gap: '3rem',
    },
    imageWrapper: {
        width: '100%',
        maxWidth: '1200px',
        height: '65vh',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: 'var(--card-shadow)',
        backgroundColor: 'var(--surface-muted)',
        border: '1px solid var(--glass-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'contain', // Ensure full image is visible
    },
    placeholder: {
        width: '100%',
        height: '100%',
        backgroundColor: 'var(--btn-bg)',
    },
    contactWrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.8rem',
    },
    label: {
        fontSize: '0.85rem',
        textTransform: 'uppercase',
        letterSpacing: '0.2em',
        color: 'var(--text-secondary)',
        fontWeight: '500',
        fontFamily: "'Playfair Display', serif", // Editorial touch
        fontStyle: 'italic',
    },
    email: {
        fontSize: '1.4rem',
        color: 'var(--text-primary)',
        textDecoration: 'none',
        fontWeight: '400',
        borderBottom: '1px solid transparent',
        transition: 'border-color 0.2s ease, opacity 0.2s ease',
        fontFamily: "'Playfair Display', serif", // Editorial touch
    }
};

export default About;
