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
    <GalleryBrowser
      theme={theme}
      onToggleTheme={onToggleTheme}
      introEyebrow={series.eyebrow}
      introTitle={series.heroTitle}
      introBody={series.heroText}
      initialFilter={seriesKey}
      lockedFilter={seriesKey}
      selectedIdFromState={location.state?.selectedId ?? null}
    />
  );
};

export default SeriesPage;
