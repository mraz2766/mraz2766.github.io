import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion as Motion, useReducedMotion } from 'framer-motion';
import FilterBar from './FilterBar';
import MasonryGrid from './MasonryGrid';
import Lightbox from './Lightbox';
import {
  getSeriesContent,
  SERIES_ORDER,
  sortPhotosForDisplay,
} from '../../data/siteContent';
import { loadPhotos } from '../../lib/gallery';

const BATCH_SIZE = 24;

function getScopedPhotos(photos, category) {
  if (category === 'All') return sortPhotosForDisplay(photos, 'All');

  return sortPhotosForDisplay(
    photos.filter((photo) => photo.category === category),
    category
  );
}

const GalleryBrowser = ({
  initialFilter = 'All',
  lockedFilter = null,
  selectedIdFromState = null,
}) => {
  const [allPhotos, setAllPhotos] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState(lockedFilter || initialFilter);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const sentinelRef = useRef(null);
  const initialSelectionConsumed = useRef(false);
  const reduceMotion = useReducedMotion();

  const filteredPhotos = useMemo(
    () => getScopedPhotos(allPhotos, lockedFilter || filter),
    [allPhotos, filter, lockedFilter]
  );
  const visiblePhotos = useMemo(
    () => filteredPhotos.slice(0, visibleCount),
    [filteredPhotos, visibleCount]
  );
  const hasMore = visibleCount < filteredPhotos.length;
  const selectedPhoto = filteredPhotos.find((photo) => photo.id === selectedId) || null;
  const selectedPhotoIndex = selectedPhoto
    ? filteredPhotos.findIndex((photo) => photo.id === selectedPhoto.id)
    : -1;
  const activeSeries = getSeriesContent(lockedFilter || filter);

  const hydrateGallery = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await loadPhotos();
      setAllPhotos(data);
    } catch (loadError) {
      setAllPhotos([]);
      setError(loadError instanceof Error ? loadError.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrateGallery();
  }, [hydrateGallery]);

  useEffect(() => {
    if (
      initialSelectionConsumed.current
      || selectedIdFromState === null
      || !filteredPhotos.length
    ) {
      return;
    }

    const selectedIndex = filteredPhotos.findIndex((photo) => photo.id === selectedIdFromState);
    if (selectedIndex !== -1) {
      setVisibleCount(Math.max(BATCH_SIZE, Math.ceil((selectedIndex + 1) / BATCH_SIZE) * BATCH_SIZE));
      setSelectedId(selectedIdFromState);
    }
    initialSelectionConsumed.current = true;
  }, [filteredPhotos, selectedIdFromState]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((count) => Math.min(count + BATCH_SIZE, filteredPhotos.length));
        }
      },
      { rootMargin: '800px 0px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filteredPhotos.length, hasMore]);

  const handleFilterChange = useCallback((nextFilter) => {
    setFilter(lockedFilter || nextFilter);
    setVisibleCount(BATCH_SIZE);
    setSelectedId(null);
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [lockedFilter, reduceMotion]);

  const handleNext = useCallback(() => {
    if (!selectedPhoto || !filteredPhotos.length) return;
    const nextIndex = (selectedPhotoIndex + 1) % filteredPhotos.length;
    const nextPhoto = filteredPhotos[nextIndex];
    setVisibleCount((count) => Math.max(count, Math.ceil((nextIndex + 1) / BATCH_SIZE) * BATCH_SIZE));
    setSelectedId(nextPhoto.id);
  }, [filteredPhotos, selectedPhoto, selectedPhotoIndex]);

  const handlePrev = useCallback(() => {
    if (!selectedPhoto || !filteredPhotos.length) return;
    const previousIndex = (selectedPhotoIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
    const previousPhoto = filteredPhotos[previousIndex];
    setVisibleCount((count) => Math.max(count, Math.ceil((previousIndex + 1) / BATCH_SIZE) * BATCH_SIZE));
    setSelectedId(previousPhoto.id);
  }, [filteredPhotos, selectedPhoto, selectedPhotoIndex]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!selectedPhoto) return;
      if (event.key === 'ArrowRight') handleNext();
      if (event.key === 'ArrowLeft') handlePrev();
      if (event.key === 'Escape') setSelectedId(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, selectedPhoto]);

  const categories = lockedFilter
    ? [lockedFilter]
    : SERIES_ORDER.filter((category) => (
      category === 'All' || allPhotos.some((photo) => photo.category === category)
    ));

  return (
    <Motion.div
      className="gallery-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.3 }}
    >
      <FilterBar
        categories={categories}
        currentFilter={lockedFilter || filter}
        onFilterChange={handleFilterChange}
        photoCount={filteredPhotos.length}
        seriesContent={activeSeries}
        showFilterNav={!lockedFilter}
      />

      {error ? (
        <section className="gallery-notice">
          <h2>Load failed</h2>
          <p>{error}</p>
          <button type="button" className="outlined-link" onClick={hydrateGallery}>Retry</button>
        </section>
      ) : loading ? (
        <section className="gallery-notice" aria-live="polite">
          <span>Loading photographs</span>
        </section>
      ) : !filteredPhotos.length ? (
        <section className="gallery-notice">
          <h2>No photographs</h2>
        </section>
      ) : (
        <>
          <MasonryGrid photos={visiblePhotos} onPhotoClick={setSelectedId} />
          <div ref={sentinelRef} className="gallery-sentinel">
            {hasMore ? (
              <button
                type="button"
                className="load-more-link"
                onClick={() => setVisibleCount((count) => Math.min(count + BATCH_SIZE, filteredPhotos.length))}
              >
                Loading more / {visiblePhotos.length} of {filteredPhotos.length}
              </button>
            ) : (
              <span>End / {filteredPhotos.length} photographs</span>
            )}
          </div>
        </>
      )}

      <AnimatePresence>
        {selectedPhoto ? (
          <Lightbox
            photo={selectedPhoto}
            photoIndex={selectedPhotoIndex}
            total={filteredPhotos.length}
            onClose={() => setSelectedId(null)}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        ) : null}
      </AnimatePresence>
    </Motion.div>
  );
};

export default GalleryBrowser;
