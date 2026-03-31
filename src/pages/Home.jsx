import React, { useEffect, useMemo, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  getSeriesContent,
  HOME_HERO_TEXT,
  HOME_HERO_TITLE,
  SITE_DESCRIPTION,
  SITE_TAGLINE,
  SITE_TITLE,
} from '../data/siteContent';
import { loadPhotos } from '../lib/gallery';

const Home = () => {
  const navigate = useNavigate();
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
        setError(loadError instanceof Error ? loadError.message : '首页作品加载失败');
      });

    return () => {
      active = false;
    };
  }, []);

  const featuredPhotos = useMemo(() => {
    const featured = photos.filter((photo) => photo.featured);
    return (featured.length ? featured : photos).slice(0, 5);
  }, [photos]);

  const leadPhoto = featuredPhotos[0];
  const previewPhotos = featuredPhotos.slice(1, 5);

  const handlePreviewClick = (photo) => {
    navigate('/works', { state: { selectedId: photo.id } });
  };

  const pets = getSeriesContent('Pets');
  const toys = getSeriesContent('Toys');

  return (
    <div className="landing-page">
      <section className="landing-hero-bleed">
        <div className="landing-hero">
          <Motion.div
            className="landing-copy"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="landing-copy-stack">
              <span className="landing-eyebrow">Minimalist Lens</span>
              <h1 className="landing-title">{HOME_HERO_TITLE}</h1>
              <p className="landing-body">{HOME_HERO_TEXT}</p>
              <p className="landing-body">{SITE_DESCRIPTION}</p>
            </div>

            <div className="landing-actions">
              <Link to="/works" className="landing-link-primary">进入作品</Link>
              <Link to="/about" className="landing-link-secondary">关于作者</Link>
            </div>

            <div className="landing-meta">
              <span>{SITE_TITLE}</span>
              <span>{SITE_TAGLINE}</span>
            </div>
          </Motion.div>

          <Motion.div
            className="landing-visual"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.95, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
          >
            {leadPhoto ? (
              <button type="button" className="landing-lead-shot" onClick={() => handlePreviewClick(leadPhoto)}>
                <img src={leadPhoto.src} alt={leadPhoto.displayTitle} className="landing-image" />
                <div className="landing-image-overlay" />
                <div className="landing-image-caption">
                  <span>{leadPhoto.category}</span>
                  <strong>{leadPhoto.displayTitle}</strong>
                </div>
              </button>
            ) : (
              <div className="landing-placeholder">{error || '正在准备首页精选…'}</div>
            )}

            <div className="landing-preview-rail">
              {previewPhotos.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  className="landing-preview-shot"
                  onClick={() => handlePreviewClick(photo)}
                >
                  <img src={photo.thumbnail || photo.src} alt={photo.displayTitle} className="landing-image" />
                  <div className="landing-image-overlay" />
                </button>
              ))}
            </div>
          </Motion.div>
        </div>
      </section>

      <section className="landing-sections">
        <div className="landing-section-head">
          <span className="landing-eyebrow">Browse</span>
          <h2 className="landing-section-title">把浏览拆到更安静的页面里。</h2>
          <p className="landing-section-body">首页只留下品牌和入口，完整观看放到独立页面，让每一组作品都更有自己的节奏。</p>
        </div>

        <div className="landing-section-grid">
          <Link to="/works" className="landing-section-card landing-section-card-wide">
            <span className="landing-card-eyebrow">Works</span>
            <h3 className="landing-card-title">先看完整目录，再决定进入哪一组系列。</h3>
            <p className="landing-card-body">总览全部作品、切换浏览密度，并从精选开始进入完整序列。</p>
          </Link>

          <Link to="/works/pets" className="landing-section-card">
            <span className="landing-card-eyebrow">{pets.seriesTitle}</span>
            <h3 className="landing-card-title">{pets.heroTitle}</h3>
            <p className="landing-card-body">{pets.seriesDescription}</p>
          </Link>

          <Link to="/works/toys" className="landing-section-card">
            <span className="landing-card-eyebrow">{toys.seriesTitle}</span>
            <h3 className="landing-card-title">{toys.heroTitle}</h3>
            <p className="landing-card-body">{toys.seriesDescription}</p>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
