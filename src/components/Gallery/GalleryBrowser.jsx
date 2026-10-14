import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, m as Motion, useReducedMotion } from 'framer-motion';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import FilterBar from './FilterBar';
import MasonryGrid from './MasonryGrid';
import Lightbox from './Lightbox';
import {
  getSeriesContent,
  SERIES_ORDER,
  sortPhotosForDisplay,
} from '../../data/siteContent';
import { getCachedPhotos, loadPhotos } from '../../lib/gallery';

const BATCH_SIZE = 24;
const PHOTO_PARAM = 'photo';

function getScopedPhotos(photos, category) {
  if (category === 'All') return sortPhotosForDisplay(photos, 'All');

  return sortPhotosForDisplay(
    photos.filter((photo) => photo.category === category),
    category
  );
}

function roundUpToBatch(count) {
  return Math.max(BATCH_SIZE, Math.ceil(count / BATCH_SIZE) * BATCH_SIZE);
}

const GalleryBrowser = ({ filter = 'All' }) => {
  const cachedPhotos = getCachedPhotos();
  const [allPhotos, setAllPhotos] = useState(cachedPhotos || []);
  const [loading, setLoading] = useState(!cachedPhotos);
  const [error, setError] = useState('');
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [renderedFilter, setRenderedFilter] = useState(filter);
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const sentinelRef = useRef(null);
  const lastOpenedSlug = useRef(null);
  const reduceMotion = useReducedMotion();

  // The open photo lives in the URL (?photo=slug): shareable, survives a
  // refresh, and the browser/phone back gesture closes the lightbox.
  const selectedSlug = searchParams.get(PHOTO_PARAM);

  const filteredPhotos = useMemo(
    () => getScopedPhotos(allPhotos, filter),
    [allPhotos, filter]
  );
  const selectedIndex = selectedSlug
    ? filteredPhotos.findIndex((photo) => photo.slug === selectedSlug)
    : -1;
  const selectedPhoto = selectedIndex === -1 ? null : filteredPhotos[selectedIndex];

  // Reset pagination when the series changes (render-phase state adjustment).
  if (renderedFilter !== filter) {
    setRenderedFilter(filter);
    setVisibleCount(BATCH_SIZE);
  }

  // Make sure the open photo's tile is rendered so focus can return to it.
  if (selectedIndex >= visibleCount) {
    setVisibleCount(roundUpToBatch(selectedIndex + 1));
  }

  const visiblePhotos = useMemo(
    () => filteredPhotos.slice(0, visibleCount),
    [filteredPhotos, visibleCount]
  );
  const hasMore = visibleCount < filteredPhotos.length;
  const activeSeries = getSeriesContent(filter);

  const hydrateGallery = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      setAllPhotos(await loadPhotos());
    } catch (loadError) {
      setAllPhotos([]);
      setError(loadError instanceof Error ? loadError.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!getCachedPhotos()) hydrateGallery();
  }, [hydrateGallery]);

  // When switching series further down the page, bring the toolbar back into view.
  const previousFilter = useRef(filter);
  useEffect(() => {
    if (previousFilter.current === filter) return;
    previousFilter.current = filter;

    if (window.scrollY > 0) {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  }, [filter, reduceMotion]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((count) => Math.min(count + BATCH_SIZE, filteredPhotos.length));
        }
      },
      { rootMargin: '1200px 0px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filteredPhotos.length, hasMore]);

  const openPhoto = useCallback((slug) => {
    lastOpenedSlug.current = slug;
    setSearchParams({ [PHOTO_PARAM]: slug }, { state: { lightbox: true } });
  }, [setSearchParams]);

  const showPhotoAt = useCallback((index) => {
    if (!filteredPhotos.length) return;
    const wrapped = (index + filteredPhotos.length) % filteredPhotos.length;
    const photo = filteredPhotos[wrapped];
    lastOpenedSlug.current = photo.slug;
    setSearchParams({ [PHOTO_PARAM]: photo.slug }, { replace: true, state: location.state });
  }, [filteredPhotos, location.state, setSearchParams]);

  const handleNext = useCallback(() => showPhotoAt(selectedIndex + 1), [selectedIndex, showPhotoAt]);
  const handlePrev = useCallback(() => showPhotoAt(selectedIndex - 1), [selectedIndex, showPhotoAt]);

  const handleClose = useCallback(() => {
    // Opened from inside the grid: step back so history stays clean.
    // Opened from a shared/deep link: just drop the parameter.
    if (location.state?.lightbox) {
      navigate(-1);
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [location.state, navigate, setSearchParams]);

  // Return keyboard focus (and the scroll position) to the last viewed tile.
  useEffect(() => {
    if (selectedPhoto || !lastOpenedSlug.current) return;
    const tile = document.querySelector(`[data-photo-slug="${CSS.escape(lastOpenedSlug.current)}"]`);
    lastOpenedSlug.current = null;
    if (tile) {
      tile.focus({ preventScroll: true });
      tile.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedPhoto]);

  const categories = SERIES_ORDER.filter((category) => (
    category === 'All' || !allPhotos.length || allPhotos.some((photo) => photo.category === category)
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
        currentFilter={filter}
        photoCount={filteredPhotos.length}
        seriesContent={activeSeries}
        loading={loading}
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
          <MasonryGrid key={filter} photos={visiblePhotos} onPhotoClick={openPhoto} />
          <div ref={sentinelRef} className="gallery-sentinel">
            {hasMore ? (
              <button
                type="button"
                className="load-more-link"
                onClick={() => setVisibleCount((count) => Math.min(count + BATCH_SIZE, filteredPhotos.length))}
              >
                More / {visiblePhotos.length} of {filteredPhotos.length}
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
            photoIndex={selectedIndex}
            total={filteredPhotos.length}
            neighbors={[
              filteredPhotos[(selectedIndex - 1 + filteredPhotos.length) % filteredPhotos.length],
              filteredPhotos[(selectedIndex + 1) % filteredPhotos.length],
            ]}
            onClose={handleClose}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        ) : null}
      </AnimatePresence>
    </Motion.div>
  );
};

export default GalleryBrowser;
