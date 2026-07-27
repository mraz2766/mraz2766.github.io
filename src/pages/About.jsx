import React, { useEffect, useState } from 'react';
import { motion as Motion, useReducedMotion } from 'framer-motion';
import { ABOUT_BODY, SITE_DESCRIPTION, SITE_TITLE } from '../data/siteContent';
import { loadPhotos } from '../lib/gallery';

const About = () => {
  const reduceMotion = useReducedMotion();
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    loadPhotos()
      .then((data) => {
        if (!active) return;
        setPhoto(data.find((item) => item.featured && item.category === 'Toys') || data[0] || null);
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
    <Motion.div
      className="about-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.35 }}
    >
      <section className="about-heading">
        <span className="about-index">01 / About</span>
        <h1>About<br />{SITE_TITLE}</h1>
      </section>

      <section className="about-editorial">
        <div className="about-copy">
          <p className="about-lead">{SITE_DESCRIPTION}</p>
          <p>{ABOUT_BODY}</p>
          <div className="about-contact">
            <span>Contact</span>
            <a href="mailto:huangl2766@gmail.com">huangl2766@gmail.com</a>
          </div>
        </div>

        <Motion.figure
          className="about-figure"
          style={{ '--frame-color': `var(--color-${photo?.frameColor || 'cobalt'}-frame)` }}
          initial={reduceMotion ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.8, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        >
          {photo ? (
            <>
              <img
                src={photo.src}
                alt={photo.displayTitle}
                width={photo.width}
                height={photo.height}
              />
              <figcaption>
                <span>{photo.category}</span>
                <span>{photo.displayTitle}</span>
              </figcaption>
            </>
          ) : (
            <div className="about-placeholder">{error || 'Loading photograph'}</div>
          )}
        </Motion.figure>
      </section>
    </Motion.div>
  );
};

export default About;
