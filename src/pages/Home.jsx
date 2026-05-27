import React, { useEffect, useMemo, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  getSeriesContent,
  SITE_TAGLINE,
  SITE_TITLE,
} from '../data/siteContent';
import { loadPhotos } from '../lib/gallery';

const Home = () => {
  const [photos, setPhotos] = useState([]);
  const pets = getSeriesContent('Pets');
  const toys = getSeriesContent('Toys');
  const entries = [
    { href: '/works/pets', content: pets },
    { href: '/works/toys', content: toys },
  ];
  const heroPhoto = useMemo(() => {
    const featured = photos.filter((photo) => photo.featured);
    return featured[0] || photos[0] || null;
  }, [photos]);
  const heroStrip = useMemo(() => {
    const featured = photos.filter((photo) => photo.featured);
    const source = featured.length ? featured : photos;
    return source.slice(0, 5);
  }, [photos]);

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
    <div className="editorial-home">
      <section className="home-hero" aria-label="首页">
        {heroPhoto ? (
          <Motion.img
            src={heroPhoto.src}
            alt={heroPhoto.displayTitle}
            className="home-hero-image"
            initial={{ scale: 1.05, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            loading="eager"
            decoding="async"
          />
        ) : (
          <div className="home-hero-image home-hero-fallback" />
        )}
        <div className="home-hero-scrim" />

        <div className="home-hero-content">
          <Motion.div
            className="home-hero-copy"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="editorial-kicker">{SITE_TAGLINE}</span>
            <h1 className="home-hero-title">{SITE_TITLE}</h1>
            <p className="home-hero-tagline">日常、收藏与光线。</p>

            <div className="home-hero-actions">
              <Link to="/works" className="editorial-link-primary">进入作品</Link>
            </div>
          </Motion.div>
        </div>
      </section>

      <section className="home-selected" aria-label="精选照片">
        <div className="home-selected-head">
          <span className="editorial-kicker">Selected</span>
          <Link to="/works" className="editorial-text-link">查看全部</Link>
        </div>
        <div className="home-selected-strip">
          {heroStrip.map((photo) => (
            <Link
              key={photo.id}
              to="/works"
              state={{ selectedId: photo.id }}
              className="home-selected-thumb"
              aria-label={`查看 ${photo.displayTitle}`}
            >
              <img src={photo.thumbnail || photo.src} alt={photo.displayTitle} loading="lazy" />
            </Link>
          ))}
        </div>
      </section>

      <section className="editorial-entry-list" aria-label="专题列表">
        {entries.map(({ href, content }, index) => (
          <Motion.article
            key={href}
            className="editorial-entry"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="editorial-entry-copy">
              <div className="editorial-entry-meta">
                <span>{content.issue}</span>
                <span>{content.byline}</span>
                <span>{String(index + 1).padStart(2, '0')}</span>
              </div>

              <h3 className="editorial-entry-title">
                <Link to={href}>{content.archiveTitle}</Link>
              </h3>
            </div>
          </Motion.article>
        ))}
      </section>
    </div>
  );
};

export default Home;
