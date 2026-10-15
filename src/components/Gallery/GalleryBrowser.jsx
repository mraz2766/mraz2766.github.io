import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, m as Motion, useReducedMotion } from 'framer-motion';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import FilterBar from './FilterBar';
import MasonryGrid from './MasonryGrid';
import Lightbox from './Lightbox';
import IndexTable from './IndexTable';
import {
  getFranchiseIndex,
  getSeriesContent,
  SERIES_ORDER,
  sortPhotosForDisplay,
} from '../../data/siteContent';
import { getCachedPhotos, loadPhotos } from '../../lib/gallery';
import { containRect, fly, rememberFlightSource } from '../../lib/flight';
import { opensPhoto, PAGE_VARIANTS } from '../../lib/motion';

const BATCH_SIZE = 24;
const PHOTO_PARAM = 'photo';
const FRANCHISE_PARAM = 'f';
const VIEW_PARAM = 'view';

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
  const [renderedFilter, setRenderedFilter] = useState(`${filter}|`);
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const sentinelRef = useRef(null);
  const lastOpenedSlug = useRef(null);
  const [direction, setDirection] = useState(0);
  const reduceMotion = useReducedMotion();

  // The open photo lives in the URL (?photo=slug): shareable, survives a
  // refresh, and the browser/phone back gesture closes the lightbox.
  const selectedSlug = searchParams.get(PHOTO_PARAM);
  const franchise = searchParams.get(FRANCHISE_PARAM) || '';
  const view = searchParams.get(VIEW_PARAM) === 'index' ? 'index' : 'grid';
  const scopeKey = `${filter}|${franchise}`;

  const seriesPhotos = useMemo(
    () => getScopedPhotos(allPhotos, filter),
    [allPhotos, filter]
  );
  const franchises = useMemo(() => getFranchiseIndex(seriesPhotos), [seriesPhotos]);
  const filteredPhotos = useMemo(
    () => (franchise ? seriesPhotos.filter((photo) => photo.franchise === franchise) : seriesPhotos),
    [seriesPhotos, franchise]
  );

  // Update some query params while keeping the others (series filter, view…).
  const updateParams = useCallback((updates, options) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      Object.entries(updates).forEach(([key, value]) => {
        if (value) next.set(key, value);
        else next.delete(key);
      });
      return next;
    }, options);
  }, [setSearchParams]);
  const selectedIndex = selectedSlug
    ? filteredPhotos.findIndex((photo) => photo.slug === selectedSlug)
    : -1;
  const selectedPhoto = selectedIndex === -1 ? null : filteredPhotos[selectedIndex];

  // Reset pagination when the series changes (render-phase state adjustment).
  if (renderedFilter !== scopeKey) {
    setRenderedFilter(scopeKey);
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
  const previousScope = useRef(scopeKey);
  useEffect(() => {
    if (previousScope.current === scopeKey) return;
    previousScope.current = scopeKey;

    if (window.scrollY > 0) {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  }, [scopeKey, reduceMotion]);

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

  const openPhoto = useCallback((slug, sourceElement) => {
    lastOpenedSlug.current = slug;
    rememberFlightSource(slug, sourceElement);
    setDirection(0);
    updateParams({ [PHOTO_PARAM]: slug }, { state: { lightbox: true } });
  }, [updateParams]);

  const showPhotoAt = useCallback((index, nextDirection = 0) => {
    if (!filteredPhotos.length) return;
    setDirection(nextDirection);
    const wrapped = (index + filteredPhotos.length) % filteredPhotos.length;
    const photo = filteredPhotos[wrapped];
    lastOpenedSlug.current = photo.slug;
    updateParams({ [PHOTO_PARAM]: photo.slug }, { replace: true, state: location.state });
  }, [filteredPhotos, location.state, updateParams]);

  const handleNext = useCallback(() => showPhotoAt(selectedIndex + 1, 1), [selectedIndex, showPhotoAt]);
  const handlePrev = useCallback(() => showPhotoAt(selectedIndex - 1, -1), [selectedIndex, showPhotoAt]);

  // Jump to a random item (never the one already open).
  const pickRandom = useCallback(() => {
    if (filteredPhotos.length < 2) return;
    let index = Math.floor(Math.random() * filteredPhotos.length);
    if (index === selectedIndex) index = (index + 1) % filteredPhotos.length;
    if (selectedPhoto) {
      showPhotoAt(index, 1);
    } else {
      lastOpenedSlug.current = filteredPhotos[index].slug;
      setDirection(0);
      updateParams({ [PHOTO_PARAM]: filteredPhotos[index].slug }, { state: { lightbox: true } });
    }
  }, [filteredPhotos, selectedIndex, selectedPhoto, showPhotoAt, updateParams]);

  const handleClose = useCallback(() => {
    // Opened from inside the grid: step back so history stays clean.
    // Opened from a shared/deep link: just drop the parameter.
    if (location.state?.lightbox) {
      navigate(-1);
    } else {
      updateParams({ [PHOTO_PARAM]: null }, { replace: true });
    }
  }, [location.state, navigate, updateParams]);

  // On close: bring the last viewed tile into view, fly the photo back into
  // it, and return keyboard focus there. Runs before paint, while the exiting
  // lightbox is still in the DOM.
  useLayoutEffect(() => {
    if (selectedPhoto || !lastOpenedSlug.current) return;
    const slug = lastOpenedSlug.current;
    lastOpenedSlug.current = null;
    const tile = document.querySelector(`[data-photo-slug="${CSS.escape(slug)}"]`);
    if (!tile) return;

    const lightboxImage = document.querySelector('.lightbox .lightbox-image.is-loaded')
      || document.querySelector('.lightbox .lightbox-image-preview');
    const stage = lightboxImage?.closest('.lightbox-image-stage');
    const photo = filteredPhotos.find((item) => item.slug === slug);

    tile.scrollIntoView({ block: 'nearest' });
    tile.focus({ preventScroll: true });

    const tileImage = tile.querySelector('img');
    if (!stage || !tileImage || !photo || stage.classList.contains('is-zoomed')) return;
    const tileRect = tileImage.getBoundingClientRect();
    const tileRatio = tileRect.width / tileRect.height;
    if (Math.abs(tileRatio - photo.width / photo.height) / tileRatio > 0.06) return;

    const from = containRect(stage.getBoundingClientRect(), photo.width, photo.height);
    stage.classList.add('is-hidden');
    tileImage.style.visibility = 'hidden';
    fly({ src: lightboxImage.currentSrc || lightboxImage.src, from, to: tileRect, duration: 460 })
      .then(() => { tileImage.style.visibility = ''; });
  }, [selectedPhoto, filteredPhotos]);

  const categories = SERIES_ORDER.filter((category) => (
    category === 'All' || !allPhotos.length || allPhotos.some((photo) => photo.category === category)
  ));

  return (
    <Motion.div
      className="gallery-page page-pad"
      variants={PAGE_VARIANTS}
      custom={opensPhoto(location.search)}
      initial="initial"
      animate="enter"
      exit="exit"
    >
      <FilterBar
        categories={categories}
        currentFilter={filter}
        photoCount={filteredPhotos.length}
        seriesContent={activeSeries}
        loading={loading}
        franchises={franchises}
        franchise={franchise}
        onFranchiseChange={(value) => updateParams({ [FRANCHISE_PARAM]: value }, { replace: true })}
        view={view}
        onRandom={filteredPhotos.length > 1 ? pickRandom : null}
        onViewChange={(value) => updateParams({ [VIEW_PARAM]: value === 'index' ? 'index' : null }, { replace: true })}
      />

      {error ? (
        <section className="gallery-notice">
          <h2>加载失败 <span lang="en">Load failed</span></h2>
          <p>{error}</p>
          <button type="button" className="outlined-link" onClick={hydrateGallery}>重试 Retry</button>
        </section>
      ) : loading ? (
        <section className="gallery-notice" aria-live="polite">
          <span>载入中 <span lang="en">Loading</span></span>
        </section>
      ) : !filteredPhotos.length ? (
        <section className="gallery-notice">
          <h2>暂无藏品 <span lang="en">Nothing here yet</span></h2>
        </section>
      ) : view === 'index' ? (
        <IndexTable photos={filteredPhotos} onPhotoClick={openPhoto} />
      ) : (
        <>
          <MasonryGrid key={scopeKey} photos={visiblePhotos} onPhotoClick={openPhoto} />
          <div ref={sentinelRef} className="gallery-sentinel">
            {hasMore ? (
              <button
                type="button"
                className="load-more-link"
                onClick={() => setVisibleCount((count) => Math.min(count + BATCH_SIZE, filteredPhotos.length))}
              >
                更多 <span lang="en">More</span> / {visiblePhotos.length} of {filteredPhotos.length}
              </button>
            ) : (
              <span>完 <span lang="en">End</span> / {filteredPhotos.length}</span>
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
            direction={direction}
            // Arriving from another page (home, about, a shared link): show the
            // viewer at once instead of fading it in over the grid.
            instant={!location.state?.lightbox}
            onRandom={pickRandom}
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
