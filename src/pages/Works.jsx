import React from 'react';
import { motion as Motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import GalleryBrowser from '../components/Gallery/GalleryBrowser';
import { getSeriesContent, WORKS_ARCHIVE_TITLE } from '../data/siteContent';

const Works = ({ theme, onToggleTheme }) => {
  const location = useLocation();
  const entries = ['Pets', 'Toys'].map((key) => ({
    slug: key.toLowerCase(),
    content: getSeriesContent(key),
  }));

  return (
    <div className="editorial-archive-page">
      <Motion.section
        className="editorial-archive-lead"
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="editorial-archive-copy">
          <span className="editorial-kicker">{WORKS_ARCHIVE_TITLE}</span>
          <h1 className="editorial-archive-title">所有图像</h1>
          <p className="editorial-archive-body">从宠物到玩具，按系列进入，也可以直接用稠密视图快速扫完整个归档。</p>
        </div>

        <div className="editorial-archive-nav" aria-label="专题目录">
          {entries.map(({ slug, content }) => (
            <Link key={slug} to={`/works/${slug}`} className="editorial-archive-link">
              <span>{content.issue}</span>
              <strong>{content.label}</strong>
            </Link>
          ))}
        </div>
      </Motion.section>

      <GalleryBrowser
        theme={theme}
        onToggleTheme={onToggleTheme}
        introEyebrow=""
        introTitle="所有图像"
        introBody=""
        selectedIdFromState={location.state?.selectedId ?? null}
      />
    </div>
  );
};

export default Works;
