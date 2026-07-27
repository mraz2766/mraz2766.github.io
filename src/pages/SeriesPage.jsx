import React from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import GalleryBrowser from '../components/Gallery/GalleryBrowser';
import { getSeriesBySlug } from '../data/siteContent';

const SeriesPage = () => {
  const { slug } = useParams();
  const location = useLocation();
  const seriesKey = getSeriesBySlug(slug);

  if (!seriesKey) {
    return <Navigate to="/works" replace />;
  }

  return (
    <div className="editorial-series-page">
      <GalleryBrowser
        initialFilter={seriesKey}
        lockedFilter={seriesKey}
        selectedIdFromState={location.state?.selectedId ?? null}
      />
    </div>
  );
};

export default SeriesPage;
