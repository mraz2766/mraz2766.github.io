import React from 'react';
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
      <section className="editorial-archive-lead">
        <div className="editorial-archive-copy">
          <span className="editorial-kicker">{WORKS_ARCHIVE_TITLE}</span>
          <h1 className="editorial-archive-title">摄影栏目按专题归档。</h1>
        </div>

        <div className="editorial-archive-nav" aria-label="专题目录">
          {entries.map(({ slug, content }) => (
            <Link key={slug} to={`/works/${slug}`} className="editorial-archive-link">
              <span>{content.issue}</span>
              <strong>{content.label}</strong>
            </Link>
          ))}
        </div>
      </section>

      <GalleryBrowser
        theme={theme}
        onToggleTheme={onToggleTheme}
        introEyebrow="全部专题"
        introTitle="专题归档"
        introBody=""
        selectedIdFromState={location.state?.selectedId ?? null}
      />
    </div>
  );
};

export default Works;
