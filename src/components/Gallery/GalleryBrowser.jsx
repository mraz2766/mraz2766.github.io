import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import FilterBar from './FilterBar';
import MasonryGrid from './MasonryGrid';
import Lightbox from './Lightbox';
import {
  getSeriesContent,
  getViewModeMeta,
  SERIES_ORDER,
  sortPhotosForDisplay,
  VIEW_MODES,
} from '../../data/siteContent';
import { loadPhotos } from '../../lib/gallery';

const PAGE_SIZE = 20;
const VIEW_MODE_SEQUENCE = VIEW_MODES.map((mode) => mode.key);

const getOrientation = (photo) => {
  if (!photo.width || !photo.height) return 'square';
  const ratio = photo.width / photo.height;
  if (ratio >= 1.18) return 'landscape';
  if (ratio <= 0.84) return 'portrait';
  return 'square';
};

const assignLayoutVariants = (photos, viewMode) => {
  if (viewMode === 'micro') {
    return photos.map((photo) => ({
      ...photo,
      orientation: getOrientation(photo),
      layoutVariant: 'micro',
    }));
  }

  const defaultPattern = ['hero', 'tall', 'standard', 'wide', 'standard', 'tall', 'standard', 'standard'];
  const compactPattern = ['wide', 'standard', 'tall', 'standard', 'standard', 'wide'];
  const pattern = viewMode === 'compact' ? compactPattern : defaultPattern;

  return photos.map((photo, index) => {
    const orientation = getOrientation(photo);
    const preferredVariant = pattern[index % pattern.length];
    let layoutVariant = 'standard';

    if (orientation === 'landscape') {
      layoutVariant = preferredVariant === 'hero' || preferredVariant === 'wide' ? preferredVariant : 'landscape';
    } else if (orientation === 'portrait') {
      layoutVariant = preferredVariant === 'hero' ? 'tall' : 'portrait';
    } else {
      layoutVariant = preferredVariant === 'wide' ? 'square-wide' : 'square';
    }

    return {
      ...photo,
      orientation,
      layoutVariant,
    };
  });
};

const getScopedPhotos = (photos, category) => {
  if (category === 'All') {
    return sortPhotosForDisplay(photos, 'All');
  }

  return sortPhotosForDisplay(
    photos.filter((photo) => photo.category === category),
    category
  );
};

const createStyles = (compactLevel) => ({
  page: {
    maxWidth: 'min(1500px, calc(100vw - 2rem))',
    margin: '0 auto',
    padding: '0 0 4rem',
  },
  introWrap: {
    display: 'grid',
    gap: '0.8rem',
    alignItems: 'end',
    padding: '0 0 1.4rem',
    marginBottom: '1rem',
    borderBottom: '1px solid var(--header-border)',
  },
  introText: {
    display: 'grid',
    gap: '0.55rem',
    maxWidth: '40rem',
  },
  introEyebrow: {
    fontSize: '0.72rem',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
  },
  introTitle: {
    fontSize: '3rem',
    lineHeight: 0.94,
  },
  introBody: {
    fontSize: '0.95rem',
    color: 'var(--text-secondary)',
    maxWidth: '38rem',
    lineHeight: 1.8,
  },
  header: {
    display: 'grid',
    gridTemplateColumns: 'minmax(140px, auto) minmax(0, 1fr) auto',
    gap: '1rem',
    alignItems: 'center',
    margin: '0 0 0.8rem 0',
    padding: '0.7rem 0',
    borderTop: '1px solid var(--header-border)',
    borderBottom: '1px solid var(--header-border)',
  },
  metaBlock: {
    display: 'grid',
    gap: '0.1rem',
    minWidth: '140px',
  },
  metaEyebrow: {
    fontSize: '0.86rem',
    textTransform: 'uppercase',
    color: 'var(--text-primary)',
    fontWeight: 650,
  },
  metaText: {
    fontSize: '0.78rem',
    color: 'var(--text-secondary)',
  },
  metaDescription: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    maxWidth: '20rem',
  },
  nav: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },
  filterButton: {
    background: 'transparent',
    border: 'none',
    borderRadius: '999px',
    padding: '0.35rem 0.65rem',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    fontSize: '0.92rem',
    whiteSpace: 'nowrap',
    transition: 'color 0.2s ease, border-color 0.2s ease',
  },
  activeFilterButton: {
    border: 'none',
    borderRadius: '999px',
    padding: '0.35rem 0.65rem',
    background: 'var(--text-primary)',
    color: 'var(--bg-color)',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    fontSize: '0.92rem',
    whiteSpace: 'nowrap',
    transition: 'color 0.2s ease, border-color 0.2s ease',
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  iconBtn: {
    background: 'transparent',
    border: 'none',
    padding: '0.35rem 0',
    minWidth: 'unset',
    height: 'unset',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    color: 'var(--text-primary)',
    cursor: 'pointer',
  },
  iconBtnText: {
    fontSize: '0.78rem',
    color: 'var(--text-secondary)',
  },
  grid: {
    '--gallery-columns': compactLevel === 2 ? 10 : compactLevel === 1 ? 6 : 4,
    '--gallery-gap': compactLevel === 2 ? '0.35rem' : compactLevel === 1 ? '0.72rem' : '0.95rem',
  },
  gridClassName: compactLevel === 2 ? 'gallery-grid-micro' : compactLevel === 1 ? 'gallery-grid-compact' : 'gallery-grid-regular',
  item: {
    cursor: 'pointer',
    minWidth: 0,
    width: '100%',
    padding: 0,
    border: 'none',
    background: 'transparent',
    textAlign: 'left',
  },
  imageWrapper: {
    position: 'relative',
    borderRadius: compactLevel === 2 ? '4px' : '6px',
    overflow: 'hidden',
    background: 'var(--surface-muted)',
  },
  image: {
    width: '100%',
    height: '100%',
    display: 'block',
    transition: 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94), filter 0.3s ease',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, rgba(6,7,8,0.02) 20%, rgba(6,7,8,0.5) 100%)',
    opacity: 0,
    transition: 'opacity 0.25s ease',
    pointerEvents: 'none',
  },
  caption: {
    position: 'absolute',
    left: '1.1rem',
    right: '1.1rem',
    bottom: '1rem',
    zIndex: 2,
    color: '#fff',
    display: 'grid',
    gap: '0.2rem',
    opacity: compactLevel === 2 ? 0 : 1,
    transition: 'opacity 0.2s ease, transform 0.2s ease',
    pointerEvents: 'none',
    transform: 'translateY(8px)',
  },
  captionEyebrow: {
    fontSize: '0.68rem',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.68)',
  },
  captionTitle: {
    fontSize: '1rem',
    lineHeight: 1.08,
    fontFamily: 'var(--font-heading)',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.55rem',
    marginTop: '1.4rem',
    paddingTop: '1rem',
    borderTop: '1px solid var(--header-border)',
  },
  paginationButton: {
    border: '1px solid var(--header-border)',
    background: 'transparent',
    color: 'var(--text-primary)',
    borderRadius: '999px',
    minWidth: '42px',
    minHeight: '42px',
    padding: '0.65rem 0.9rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease',
  },
  activePaginationButton: {
    border: '1px solid var(--text-primary)',
    background: 'var(--text-primary)',
    color: 'var(--bg-color)',
    borderRadius: '999px',
    minWidth: '42px',
    minHeight: '42px',
    padding: '0.65rem 0.9rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease',
  },
  disabledPaginationButton: {
    border: '1px solid var(--header-border)',
    background: 'transparent',
    color: 'var(--text-soft)',
    borderRadius: '999px',
    minWidth: '42px',
    minHeight: '42px',
    padding: '0.65rem 0.9rem',
    cursor: 'not-allowed',
    opacity: 0.56,
  },
  utilityButton: {
    border: '1px solid var(--header-border)',
    background: 'transparent',
    color: 'var(--text-primary)',
    borderRadius: '999px',
    padding: '0.8rem 1.1rem',
    cursor: 'pointer',
  },
  noticePanel: {
    borderTop: '1px solid var(--header-border)',
    borderBottom: '1px solid var(--header-border)',
    padding: '2rem 0',
    display: 'grid',
    gap: '0.7rem',
  },
  noticeTitle: {
    fontSize: '1.15rem',
    color: 'var(--text-primary)',
  },
  noticeText: {
    color: 'var(--text-secondary)',
    fontSize: '0.95rem',
    maxWidth: '40rem',
    lineHeight: 1.8,
  },
  lightbox: {
    position: 'fixed',
    inset: 0,
    background: 'var(--viewer-backdrop)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  lightboxContent: {
    position: 'relative',
    maxWidth: '1680px',
    width: '100%',
    maxHeight: '92vh',
  },
  viewerStage: {
    display: 'grid',
    gridTemplateRows: 'minmax(0, 1fr) auto',
    gap: '1rem',
    alignItems: 'center',
  },
  imageShell: {
    position: 'relative',
    minHeight: '70vh',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255,255,255,0.025)',
  },
  lightboxImage: {
    maxWidth: '100%',
    maxHeight: '72vh',
    objectFit: 'contain',
  },
  metadata: {
    display: 'flex',
    gap: '1rem',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    alignItems: 'end',
    color: 'var(--text-primary)',
    padding: '0.2rem 0 0',
    maxWidth: 'none',
  },
  metadataHeader: {
    display: 'grid',
    gap: '0.35rem',
    minWidth: 0,
  },
  metadataEyebrow: {
    fontSize: '0.72rem',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.58)',
  },
  metadataTitle: {
    fontSize: '1.6rem',
    lineHeight: 1,
    color: '#fff',
  },
  metadataMeta: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.55rem',
  },
  exifGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(72px, auto))',
    gap: '0.65rem',
    margin: 0,
  },
  exifLabel: {
    display: 'block',
    marginBottom: '0.18rem',
    color: 'rgba(255,255,255,0.48)',
    fontSize: '0.58rem',
  },
  exifValue: {
    color: 'rgba(255,255,255,0.88)',
    fontWeight: '400',
    fontSize: '0.76rem',
    margin: 0,
  },
  metaBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.32rem 0.68rem',
    borderRadius: '999px',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#fff',
    fontSize: '0.76rem',
  },
  metaMuted: {
    color: 'rgba(255,255,255,0.58)',
    fontSize: '0.78rem',
  },
  metaParagraph: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: '0.9rem',
    lineHeight: 1.7,
  },
  navBtn: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.18)',
    color: '#fff',
    cursor: 'pointer',
    borderRadius: '50%',
    width: '46px',
    height: '46px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.18s ease, transform 0.18s ease',
    opacity: 0.8,
  },
  closeBtn: {
    position: 'absolute',
    top: '0',
    right: '0',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.18)',
    color: '#fff',
    cursor: 'pointer',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '42px',
    height: '42px',
  },
});

const GalleryBrowser = ({
  theme,
  onToggleTheme,
  introEyebrow,
  introTitle,
  introBody,
  initialFilter = 'All',
  lockedFilter = null,
  selectedIdFromState = null,
}) => {
  const [allPhotos, setAllPhotos] = useState([]);
  const [filteredPhotos, setFilteredPhotos] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState(lockedFilter || initialFilter);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('micro');
  const initialSelectionConsumed = useRef(false);

  const totalPages = Math.max(1, Math.ceil(filteredPhotos.length / PAGE_SIZE));
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pagePhotos = useMemo(
    () => filteredPhotos.slice(pageStart, pageStart + PAGE_SIZE),
    [filteredPhotos, pageStart]
  );
  const arrangedPhotos = useMemo(() => assignLayoutVariants(pagePhotos, viewMode), [pagePhotos, viewMode]);
  const compactLevel = viewMode === 'compact' ? 1 : viewMode === 'micro' ? 2 : 0;
  const styles = useMemo(() => createStyles(compactLevel), [compactLevel]);
  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, index) => index + 1),
    [totalPages]
  );

  const applyFilter = useCallback((nextFilter, sourcePhotos) => {
    const resolvedFilter = lockedFilter || nextFilter;
    const basePhotos = sourcePhotos ?? allPhotos;
    const scopedPhotos = getScopedPhotos(basePhotos, resolvedFilter);

    setFilter(resolvedFilter);
    setFilteredPhotos(scopedPhotos);
    setCurrentPage(1);
    setSelectedId(null);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [allPhotos, lockedFilter]);

  const hydrateGallery = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await loadPhotos();
      const resolvedFilter = lockedFilter || initialFilter;
      setAllPhotos(data);
      setFilter(resolvedFilter);
      setFilteredPhotos(getScopedPhotos(data, resolvedFilter));
    } catch (loadError) {
      setAllPhotos([]);
      setFilteredPhotos([]);
      setError(loadError instanceof Error ? loadError.message : '照片暂时无法读取，请稍后再试。');
    } finally {
      setLoading(false);
    }
  }, [initialFilter, lockedFilter]);

  useEffect(() => {
    hydrateGallery();
  }, [hydrateGallery]);

  useEffect(() => {
    if (initialSelectionConsumed.current || selectedIdFromState === null || !filteredPhotos.length) {
      return;
    }

    const selectedIndex = filteredPhotos.findIndex((photo) => photo.id === selectedIdFromState);
    if (selectedIndex !== -1) {
      setCurrentPage(Math.floor(selectedIndex / PAGE_SIZE) + 1);
      setSelectedId(selectedIdFromState);
    }
    initialSelectionConsumed.current = true;
  }, [filteredPhotos, selectedIdFromState]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleNext = useCallback(() => {
    if (selectedId === null || !filteredPhotos.length) return;
    const currentIndex = filteredPhotos.findIndex((photo) => photo.id === selectedId);
    const nextIndex = (currentIndex + 1) % filteredPhotos.length;
    const nextPhoto = filteredPhotos[nextIndex];
    setSelectedId(nextPhoto.id);
    setCurrentPage(Math.floor(nextIndex / PAGE_SIZE) + 1);
  }, [filteredPhotos, selectedId]);

  const handlePrev = useCallback(() => {
    if (selectedId === null || !filteredPhotos.length) return;
    const currentIndex = filteredPhotos.findIndex((photo) => photo.id === selectedId);
    const prevIndex = (currentIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
    const prevPhoto = filteredPhotos[prevIndex];
    setSelectedId(prevPhoto.id);
    setCurrentPage(Math.floor(prevIndex / PAGE_SIZE) + 1);
  }, [filteredPhotos, selectedId]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (selectedId === null) return;
      if (event.key === 'ArrowRight') handleNext();
      if (event.key === 'ArrowLeft') handlePrev();
      if (event.key === 'Escape') setSelectedId(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, selectedId]);

  const categories = lockedFilter
    ? [lockedFilter]
    : SERIES_ORDER.filter((category) => category === 'All' || allPhotos.some((photo) => photo.category === category));
  const activeSeries = getSeriesContent(filter);
  const viewModeMeta = getViewModeMeta(viewMode);
  const selectedPhoto = filteredPhotos.find((photo) => photo.id === selectedId) || null;
  const selectedPhotoIndex = selectedPhoto ? filteredPhotos.findIndex((photo) => photo.id === selectedPhoto.id) : -1;

  const handleToggleView = useCallback(() => {
    setViewMode((currentMode) => {
      const currentIndex = VIEW_MODE_SEQUENCE.indexOf(currentMode);
      return VIEW_MODE_SEQUENCE[(currentIndex + 1) % VIEW_MODE_SEQUENCE.length];
    });
  }, []);

  const handlePageChange = useCallback((nextPage) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === currentPage) {
      return;
    }

    setCurrentPage(nextPage);
    setSelectedId(null);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [currentPage, totalPages]);

  return (
    <div className={`gallery-page view-${viewMode}`} style={styles.page}>
      {introEyebrow || introTitle || introBody ? (
        <section className="gallery-intro" style={styles.introWrap}>
          <div style={styles.introText}>
            {introEyebrow ? <span style={styles.introEyebrow}>{introEyebrow}</span> : null}
            {introTitle ? <h1 style={styles.introTitle}>{introTitle}</h1> : null}
            {introBody ? <p style={styles.introBody}>{introBody}</p> : null}
          </div>
        </section>
      ) : null}

      <FilterBar
        categories={categories}
        currentFilter={filter}
        onFilterChange={applyFilter}
        viewMode={viewMode}
        viewModeMeta={viewModeMeta}
        onToggleView={handleToggleView}
        theme={theme}
        onToggleTheme={onToggleTheme}
        photoCount={filteredPhotos.length}
        seriesContent={activeSeries}
        styles={styles}
        showFilterNav={!lockedFilter}
      />

      {error ? (
        <section style={styles.noticePanel}>
          <h2 style={styles.noticeTitle}>Load failed</h2>
          <p style={styles.noticeText}>{error}</p>
          <div>
            <button type="button" style={styles.utilityButton} onClick={hydrateGallery}>
              Retry
            </button>
          </div>
        </section>
      ) : !loading && !filteredPhotos.length ? (
        <section style={styles.noticePanel}>
          <h2 style={styles.noticeTitle}>No photos</h2>
        </section>
      ) : (
        <>
          <MasonryGrid photos={arrangedPhotos} onPhotoClick={setSelectedId} styles={styles} />
          {totalPages > 1 ? (
            <nav style={styles.pagination} aria-label="Pagination">
              <button
                type="button"
                style={currentPage === 1 ? styles.disabledPaginationButton : styles.paginationButton}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                Prev
              </button>
              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  style={pageNumber === currentPage ? styles.activePaginationButton : styles.paginationButton}
                  onClick={() => handlePageChange(pageNumber)}
                  aria-current={pageNumber === currentPage ? 'page' : undefined}
                  aria-label={`Page ${pageNumber}`}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                type="button"
                style={currentPage === totalPages ? styles.disabledPaginationButton : styles.paginationButton}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                Next
              </button>
            </nav>
          ) : null}
        </>
      )}

      <AnimatePresence>
        {selectedId && selectedPhoto && (
          <Lightbox
            photo={selectedPhoto}
            photoIndex={selectedPhotoIndex}
            total={filteredPhotos.length}
            viewLabel={activeSeries.seriesTitle}
            onClose={() => setSelectedId(null)}
            onNext={handleNext}
            onPrev={handlePrev}
            styles={styles}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryBrowser;
