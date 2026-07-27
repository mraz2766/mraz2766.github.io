import React, { useEffect, useMemo, useState } from 'react';
import { motion as Motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SITE_DESCRIPTION, SITE_TAGLINE, SITE_TITLE } from '../data/siteContent';
import { loadPhotos } from '../lib/gallery';

const CURATED_COUNT = 18;

function curatePhotos(photos) {
  const categories = ['Pets', 'Toys'];
  const pools = categories.map((category) => {
    const scoped = photos.filter((photo) => photo.category === category);
    return [
      ...scoped.filter((photo) => photo.featured),
      ...scoped.filter((photo) => !photo.featured),
    ];
  });
  const curated = [];

  while (curated.length < CURATED_COUNT && pools.some((pool) => pool.length)) {
    pools.forEach((pool) => {
      if (pool.length && curated.length < CURATED_COUNT) {
        curated.push(pool.shift());
      }
    });
  }

  return curated;
}

const Home = () => {
  const [photos, setPhotos] = useState([]);
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const wordmarkY = useTransform(scrollY, [0, 900], [0, reduceMotion ? 0 : 180]);
  const curatedPhotos = useMemo(() => curatePhotos(photos), [photos]);

  useEffect(() => {
    let active = true;

    loadPhotos()
      .then((data) => {
        if (active) setPhotos(data);
      })
      .catch(() => {
        if (active) setPhotos([]);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <Motion.div
      className="home-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.35 }}
    >
      <section className="home-intro" aria-labelledby="home-title">
        <div className="home-intro-meta">
          <span>{SITE_TAGLINE}</span>
          <span>{SITE_DESCRIPTION}</span>
        </div>
        <Motion.h1
          id="home-title"
          className="home-wordmark"
          initial={reduceMotion ? false : { y: '18%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          {SITE_TITLE}
        </Motion.h1>
      </section>

      <section className="home-gallery-wall" aria-label="Selected photographs">
        <Motion.div className="home-wordmark-rail" style={{ y: wordmarkY }} aria-hidden="true">
          {SITE_TITLE}
        </Motion.div>

        <div className="home-photo-grid">
          {curatedPhotos.map((photo, index) => (
            <Motion.div
              key={photo.id}
              className={`home-photo home-photo-${(index % 8) + 1}${index === 7 || index === 15 ? ' home-photo-break' : ''}`}
              style={{ '--frame-color': `var(--color-${photo.frameColor || 'vermillion'}-frame)` }}
              initial={reduceMotion ? false : { opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.14 }}
              transition={{
                duration: reduceMotion ? 0 : 0.62,
                delay: reduceMotion ? 0 : (index % 4) * 0.04,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Link
                to="/works"
                state={{ selectedId: photo.id }}
                className="home-photo-link"
                aria-label={`View ${photo.displayTitle}`}
              >
                <img
                  src={photo.thumbnail || photo.src}
                  alt={photo.displayTitle}
                  width={photo.width}
                  height={photo.height}
                  loading={index < 4 ? 'eager' : 'lazy'}
                  decoding="async"
                />
                <span className="photo-label">
                  <span>{photo.category}</span>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                </span>
              </Link>
            </Motion.div>
          ))}
        </div>
      </section>

      <section className="home-exit">
        <span>Complete archive / {photos.length || '—'} photographs</span>
        <Link to="/works" className="outlined-link">View Works</Link>
      </section>
    </Motion.div>
  );
};

export default Home;
