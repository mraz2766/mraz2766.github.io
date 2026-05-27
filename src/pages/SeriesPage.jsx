import React from 'react';
import { motion as Motion } from 'framer-motion';
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
      <Motion.section
        className="editorial-series-lead"
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="editorial-series-title">{series.label}</h1>
      </Motion.section>

      <GalleryBrowser
        theme={theme}
        onToggleTheme={onToggleTheme}
        introEyebrow=""
        introTitle=""
        introBody=""
        initialFilter={seriesKey}
        lockedFilter={seriesKey}
        selectedIdFromState={location.state?.selectedId ?? null}
      />
    </div>
  );
};

export default SeriesPage;
