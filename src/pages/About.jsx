import React, { useEffect, useMemo, useState } from 'react';
import { motion as Motion, useReducedMotion } from 'framer-motion';
import { SITE_DESCRIPTION, SITE_TAGLINE } from '../data/siteContent';
import { loadPhotos } from '../lib/gallery';

const About = () => {
  const reduceMotion = useReducedMotion();
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    loadPhotos()
      .then((data) => {
        if (!active) return;
        setPhotos(data);
      })
      .catch((loadError) => {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : '关于页图片加载失败');
      });

    return () => {
      active = false;
    };
  }, []);

  const heroPhoto = useMemo(() => {
    const featured = photos.filter((photo) => photo.featured);
    const pool = featured.length ? featured : photos;
    if (!pool.length) return null;
    return pool[Math.floor(pool.length / 2)];
  }, [photos]);

  return (
    <div style={styles.container}>
      <Motion.section
        className="about-panel"
        style={styles.panel}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <div style={styles.copyColumn}>
          <span style={styles.eyebrow}>About</span>
          <h1 style={styles.title}>把日常里真正会停下来的目光，整理成一个可以反复回看的作品集。</h1>
          <p style={styles.body}>{SITE_TAGLINE}</p>
          <p style={styles.body}>{SITE_DESCRIPTION}</p>
          <p style={styles.body}>Pets 更接近陪伴关系里的轻微情绪，Toys 更像对收藏与陈列秩序的持续观察。两组作品共同构成这个站点的观看节奏。</p>

          <div style={styles.contactBlock}>
            <span style={styles.contactLabel}>联系</span>
            <a href="mailto:huangl2766@gmail.com" style={styles.email} className="about-email">
              huangl2766@gmail.com
            </a>
          </div>
        </div>

        <Motion.div
          initial={{ opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
          style={styles.imageWrapper}
          className="about-image-wrapper"
        >
          {heroPhoto ? (
            <Motion.img
              src={heroPhoto.src}
              alt={heroPhoto.displayTitle}
              style={styles.image}
              initial={reduceMotion ? false : { scale: 1.06 }}
              animate={reduceMotion ? { scale: 1 } : { scale: 1 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 18, ease: 'linear', repeat: Infinity, repeatType: 'reverse' }}
            />
          ) : (
            <div style={styles.placeholder}>
              <span style={styles.placeholderText}>{error || '正在准备关于页图像…'}</span>
            </div>
          )}
        </Motion.div>
      </Motion.section>
    </div>
  );
};

const styles = {
  container: {
    minHeight: 'calc(100vh - 120px)',
    display: 'flex',
    alignItems: 'center',
    padding: '1.2rem 0 2rem',
  },
  panel: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 0.86fr) minmax(320px, 1.14fr)',
    gap: '1.6rem',
    alignItems: 'stretch',
  },
  copyColumn: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '1rem',
    padding: '0.6rem 0',
    maxWidth: '34rem',
  },
  eyebrow: {
    fontSize: '0.76rem',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
  },
  title: {
    fontSize: 'clamp(2.2rem, 4.6vw, 4.4rem)',
    lineHeight: 0.98,
    letterSpacing: '-0.04em',
  },
  body: {
    fontSize: '0.98rem',
    color: 'var(--text-secondary)',
  },
  imageWrapper: {
    width: '100%',
    minHeight: '65vh',
    borderRadius: '28px',
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
    objectFit: 'cover',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    background: 'var(--glass-bg)',
  },
  placeholderText: {
    color: 'var(--text-secondary)',
  },
  contactBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.55rem',
    marginTop: '1rem',
  },
  contactLabel: {
    fontSize: '0.78rem',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
  },
  email: {
    fontSize: '1.2rem',
    color: 'var(--text-primary)',
    textDecoration: 'none',
    fontWeight: '400',
    borderBottom: '1px solid transparent',
    transition: 'border-color 0.2s ease, opacity 0.2s ease',
    fontFamily: "'Playfair Display', serif",
    width: 'fit-content',
  },
};

export default About;
