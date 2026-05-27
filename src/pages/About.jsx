import React, { useEffect, useState } from 'react';
import { motion as Motion, useReducedMotion } from 'framer-motion';
import { ABOUT_BODY, ABOUT_TITLE, getCategoryLabel, SITE_DESCRIPTION, SITE_TAGLINE, SITE_TITLE } from '../data/siteContent';
import { loadPhotos } from '../lib/gallery';

const About = () => {
  const reduceMotion = useReducedMotion();
  const [heroPhoto, setHeroPhoto] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    loadPhotos()
      .then((data) => {
        if (!active) return;

        const featured = data.filter((photo) => photo.featured);
        const pool = featured.length ? featured : data;

        if (!pool.length) {
          setHeroPhoto(null);
          return;
        }

        const randomIndex = Math.floor(Math.random() * pool.length);
        setHeroPhoto(pool[randomIndex]);
      })
      .catch((loadError) => {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : 'Image failed');
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="about-page">
      <section className="about-lead">
        <Motion.div
          className="about-copy"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="about-eyebrow">About</span>
          <span className="about-brand">{SITE_TITLE}</span>
          <h1 className="about-title">{ABOUT_TITLE}</h1>
          <p className="about-body">{SITE_TAGLINE}</p>
          <p className="about-body">{SITE_DESCRIPTION}</p>
          <p className="about-body">{ABOUT_BODY}</p>

          <div className="about-contact">
            <span className="about-contact-label">Contact</span>
            <a href="mailto:huangl2766@gmail.com" className="about-email">
              huangl2766@gmail.com
            </a>
          </div>
        </Motion.div>

        <Motion.div
          className="about-visual"
          initial={{ opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        >
          {heroPhoto ? (
            <Motion.img
              src={heroPhoto.src}
              alt={heroPhoto.displayTitle}
              className="about-image"
              initial={reduceMotion ? false : { scale: 1.05 }}
              animate={reduceMotion ? { scale: 1 } : { scale: 1 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 18, ease: 'linear', repeat: Infinity, repeatType: 'reverse' }}
            />
          ) : (
            <div className="about-placeholder">
              <span>{error || 'Loading image'}</span>
            </div>
          )}

          {heroPhoto ? (
            <div className="about-image-note">
              <span>{getCategoryLabel(heroPhoto.category)}</span>
              <span>{heroPhoto.displayTitle}</span>
            </div>
          ) : null}
        </Motion.div>
      </section>
    </div>
  );
};

export default About;
