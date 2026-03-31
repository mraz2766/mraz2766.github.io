import React from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import GalleryBrowser from '../components/Gallery/GalleryBrowser';
import { getSeriesBySlug } from '../data/siteContent';

const SeriesPage = ({ theme, onToggleTheme }) => {
  const { slug } = useParams();
  const location = useLocation();
  const seriesKey = getSeriesBySlug(slug);

  if (!seriesKey) {
    return <Navigate to="/works" replace />;
  }

  const series = getSeriesBySlug(slug, true);

  return (
    <div className="editorial-series-page">
      <section className="editorial-series-lead">
        <div className="editorial-series-meta">
          <span>{series.issue}</span>
          <span>{series.byline}</span>
        </div>
        <span className="editorial-kicker">{series.eyebrow}</span>
        <h1 className="editorial-series-title">{series.archiveTitle}</h1>
        <p className="editorial-series-body">{series.heroText}</p>
        <p className="editorial-series-body">{series.seriesDescription}</p>
      </section>

      <GalleryBrowser
        theme={theme}
        onToggleTheme={onToggleTheme}
        introEyebrow={series.seriesTitle}
        introTitle={series.heroTitle}
        introBody={series.archiveSummary}
        initialFilter={seriesKey}
        lockedFilter={seriesKey}
        selectedIdFromState={location.state?.selectedId ?? null}
      />
    </div>
  );
};

export default SeriesPage;
