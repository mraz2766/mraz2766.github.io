import React, { useEffect, useMemo, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  getSeriesContent,
  getCategoryLabel,
  HOME_HERO_TEXT,
  HOME_HERO_TITLE,
  HOME_SECTION_BODY,
  HOME_SECTION_TITLE,
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

  const handlePreviewClick = (photo) => {
    navigate('/works', { state: { selectedId: photo.id } });
  };

  const pets = getSeriesContent('Pets');
  const toys = getSeriesContent('Toys');
  const editorialEntries = useMemo(() => {
    const seriesMap = {
      Pets: {
        href: '/works/pets',
        cover: featuredPhotos.find((photo) => photo.category === 'Pets') || photos.find((photo) => photo.category === 'Pets'),
        content: pets,
      },
      Toys: {
        href: '/works/toys',
        cover: featuredPhotos.find((photo) => photo.category === 'Toys') || photos.find((photo) => photo.category === 'Toys'),
        content: toys,
      },
    };

    return ['Pets', 'Toys']
      .map((key) => seriesMap[key])
      .filter((entry) => entry?.cover);
  }, [featuredPhotos, pets, photos, toys]);

  return (
    <div className="editorial-home">
      <section className="editorial-home-lead">
        <div className="editorial-home-masthead">
          <Motion.div
            className="editorial-home-copy"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="editorial-home-copy-stack">
              <span className="editorial-kicker">{SITE_TAGLINE}</span>
              <h1 className="editorial-home-brand">{SITE_TITLE}</h1>
              <p className="editorial-home-tagline">{HOME_HERO_TITLE}</p>
              <p className="editorial-home-body">{HOME_HERO_TEXT}</p>
              <p className="editorial-home-body">{SITE_DESCRIPTION}</p>
            </div>

            <div className="editorial-home-actions">
              <Link to="/works" className="editorial-link-primary">查看专题归档</Link>
              <Link to="/about" className="editorial-link-secondary">阅读作者自述</Link>
            </div>

            <div className="editorial-home-meta">
              <span>当前栏目</span>
              <span>宠物 / 玩具</span>
              <span>持续更新</span>
            </div>
          </Motion.div>

          <Motion.div
            className="editorial-home-feature"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.95, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
          >
            {leadPhoto ? (
              <button type="button" className="editorial-feature-shot" onClick={() => handlePreviewClick(leadPhoto)}>
                <img src={leadPhoto.src} alt={leadPhoto.displayTitle} className="editorial-feature-image" />
                <div className="editorial-feature-overlay" />
                <div className="editorial-feature-caption">
                  <span>{getCategoryLabel(leadPhoto.category)}</span>
                  <strong>{leadPhoto.displayTitle}</strong>
                </div>
              </button>
            ) : (
              <div className="editorial-feature-placeholder">{error || '正在准备栏目封面…'}</div>
            )}
          </Motion.div>
        </div>
      </section>

      <section className="editorial-section-head">
        <span className="editorial-kicker">{HOME_SECTION_TITLE}</span>
        <h2 className="editorial-section-title">按专题进入，而不是从筛选器开始。</h2>
        <p className="editorial-section-body">{HOME_SECTION_BODY}</p>
      </section>

      <section className="editorial-entry-list" aria-label="专题列表">
        {editorialEntries.map(({ href, cover, content }, index) => (
          <article key={href} className="editorial-entry">
            <Link to={href} className="editorial-entry-media" aria-label={content.readLabel || `继续阅读${content.label}专题`}>
              <img src={cover.src} alt={content.archiveTitle} className="editorial-entry-image" />
            </Link>

            <div className="editorial-entry-copy">
              <div className="editorial-entry-meta">
                <span>{content.issue}</span>
                <span>{content.byline}</span>
                <span>{String(index + 1).padStart(2, '0')}</span>
              </div>

              <h3 className="editorial-entry-title">
                <Link to={href}>{content.archiveTitle}</Link>
              </h3>

              <p className="editorial-entry-body">{content.archiveSummary}</p>

              <div className="editorial-entry-actions">
                <Link to={href} className="editorial-text-link">
                  {content.readLabel || '继续阅读'}
                </Link>
                <button type="button" className="editorial-text-button" onClick={() => handlePreviewClick(cover)}>
                  直接查看封面作品
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="editorial-home-aside">
        <div className="editorial-home-aside-copy">
          <span className="editorial-kicker">栏目说明</span>
          <p>
            首页只负责给出专题入口。完整的图像浏览、归档切换与沉浸式查看，都被收进了更安静的专题页面里。
          </p>
        </div>
        <div className="editorial-home-aside-links">
          <Link to="/works">进入专题归档</Link>
          <Link to="/about">阅读关于页面</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
