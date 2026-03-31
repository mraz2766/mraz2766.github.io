import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import FilterBar from '../components/Gallery/FilterBar';
import MasonryGrid from '../components/Gallery/MasonryGrid';
import Lightbox from '../components/Gallery/Lightbox';
import {
  getSeriesContent,
  getViewModeMeta,
  SERIES_ORDER,
  SITE_TAGLINE,
  sortPhotosForDisplay,
  VIEW_MODES,
} from '../data/siteContent';
import { loadPhotos } from '../lib/gallery';

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

const Home = ({ theme, onToggleTheme }) => {
  const [allPhotos, setAllPhotos] = useState([]);
  const [filteredPhotos, setFilteredPhotos] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('default');
  const sentinelRef = useRef(null);

  const displayPhotos = useMemo(() => filteredPhotos.slice(0, page * PAGE_SIZE), [filteredPhotos, page]);
  const arrangedPhotos = useMemo(() => assignLayoutVariants(displayPhotos, viewMode), [displayPhotos, viewMode]);
  const hasMore = displayPhotos.length < filteredPhotos.length;
  const compactLevel = viewMode === 'compact' ? 1 : viewMode === 'micro' ? 2 : 0;

  const applyFilter = useCallback((nextFilter, sourcePhotos) => {
    const basePhotos = sourcePhotos ?? allPhotos;
    const scopedPhotos = getScopedPhotos(basePhotos, nextFilter);

    setFilter(nextFilter);
    setFilteredPhotos(scopedPhotos);
    setPage(1);
    setSelectedId(null);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [allPhotos]);

  const hydrateGallery = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await loadPhotos();
      setAllPhotos(data);
      setFilteredPhotos(getScopedPhotos(data, filter));
    } catch (loadError) {
      setAllPhotos([]);
      setFilteredPhotos([]);
      setError(loadError instanceof Error ? loadError.message : '照片暂时无法读取，请稍后再试。');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    hydrateGallery();
  }, [hydrateGallery]);

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loading) {
          setPage((currentPage) => currentPage + 1);
        }
      },
      {
        rootMargin: '360px',
        threshold: 0.1,
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loading]);

  const handleNext = useCallback(() => {
    if (selectedId === null || !filteredPhotos.length) return;
    const currentIndex = filteredPhotos.findIndex((photo) => photo.id === selectedId);
    const nextIndex = (currentIndex + 1) % filteredPhotos.length;
    setSelectedId(filteredPhotos[nextIndex].id);
  }, [filteredPhotos, selectedId]);

  const handlePrev = useCallback(() => {
    if (selectedId === null || !filteredPhotos.length) return;
    const currentIndex = filteredPhotos.findIndex((photo) => photo.id === selectedId);
    const prevIndex = (currentIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
    setSelectedId(filteredPhotos[prevIndex].id);
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

  const categories = SERIES_ORDER.filter((category) => category === 'All' || allPhotos.some((photo) => photo.category === category));
  const activeSeries = getSeriesContent(filter);
  const viewModeMeta = getViewModeMeta(viewMode);
  const selectedPhoto = filteredPhotos.find((photo) => photo.id === selectedId) || allPhotos.find((photo) => photo.id === selectedId);
  const selectedPhotoIndex = selectedPhoto ? filteredPhotos.findIndex((photo) => photo.id === selectedPhoto.id) : -1;
  const featuredCount = allPhotos.filter((photo) => photo.featured).length;
  const progressLabel = filteredPhotos.length ? `${displayPhotos.length} / ${filteredPhotos.length}` : '0 / 0';

  const handleToggleView = useCallback(() => {
    setViewMode((currentMode) => {
      const currentIndex = VIEW_MODE_SEQUENCE.indexOf(currentMode);
      return VIEW_MODE_SEQUENCE[(currentIndex + 1) % VIEW_MODE_SEQUENCE.length];
    });
  }, []);

  const styles = {
    container: {
      maxWidth: '1800px',
      margin: '0 auto',
      padding: '0 2rem 3.5rem 2rem',
      minHeight: '100vh',
    },
    hero: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1.2fr) minmax(320px, 0.8fr)',
      gap: '1.5rem',
      padding: '1.15rem 0 2rem',
      alignItems: 'end',
    },
    heroCopy: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.95rem',
      maxWidth: '760px',
    },
    heroEyebrow: {
      fontSize: '0.76rem',
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
      color: 'var(--text-secondary)',
    },
    heroTitle: {
      fontSize: 'clamp(2.4rem, 5vw, 4.6rem)',
      lineHeight: 0.95,
      letterSpacing: '-0.04em',
    },
    heroText: {
      fontSize: '1rem',
      color: 'var(--text-secondary)',
      maxWidth: '46rem',
    },
    heroNote: {
      fontSize: '0.95rem',
      color: 'var(--text-primary)',
    },
    heroPanel: {
      border: '1px solid var(--glass-border)',
      background: 'var(--glass-bg)',
      borderRadius: '28px',
      padding: '1.25rem 1.2rem',
      boxShadow: 'var(--glass-shadow-soft)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      display: 'grid',
      gap: '0.9rem',
      alignSelf: 'stretch',
    },
    heroPanelLabel: {
      fontSize: '0.75rem',
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color: 'var(--text-secondary)',
    },
    heroPanelValue: {
      fontSize: '1.05rem',
      color: 'var(--text-primary)',
      fontWeight: 500,
    },
    heroPanelMuted: {
      fontSize: '0.88rem',
      color: 'var(--text-secondary)',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      gap: '1rem',
      margin: '0 0 1.4rem 0',
      padding: '0 0 0.4rem 0',
      position: 'relative',
      zIndex: 1,
    },
    metaBlock: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.45rem',
      minWidth: '220px',
      flexShrink: 0,
    },
    metaEyebrow: {
      fontSize: '0.7rem',
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color: 'var(--text-secondary)',
    },
    metaText: {
      fontSize: '1rem',
      fontWeight: '500',
      color: 'var(--text-primary)',
    },
    metaDescription: {
      fontSize: '0.88rem',
      color: 'var(--text-secondary)',
      maxWidth: '24rem',
    },
    actions: {
      display: 'flex',
      gap: '0.65rem',
      alignItems: 'center',
      justifyContent: 'flex-end',
      minWidth: '148px',
      flexShrink: 0,
    },
    nav: {
      display: 'flex',
      gap: '0.5rem',
      background: 'var(--glass-bg-soft)',
      padding: '0.35rem',
      borderRadius: '999px',
      backdropFilter: 'blur(12px)',
      border: '1px solid var(--glass-border)',
      boxShadow: 'var(--glass-shadow-soft), inset 0 1px 0 var(--glass-highlight)',
    },
    filterButton: {
      background: 'transparent',
      border: 'none',
      borderRadius: '999px',
      padding: '0.55rem 1.05rem',
      color: 'var(--text-secondary)',
      cursor: 'pointer',
      fontFamily: 'inherit',
      fontSize: '0.9rem',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      whiteSpace: 'nowrap',
    },
    activeFilterButton: {
      background: 'var(--btn-bg-active)',
      color: 'var(--btn-text-active)',
      borderRadius: '999px',
      padding: '0.55rem 1.05rem',
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'inherit',
      fontSize: '0.9rem',
      fontWeight: '500',
      boxShadow: 'var(--glass-shadow-soft)',
      whiteSpace: 'nowrap',
    },
    iconBtn: {
      background: 'var(--glass-bg-soft)',
      border: '1px solid var(--header-border)',
      borderRadius: '999px',
      minWidth: '44px',
      height: '44px',
      padding: '0 0.95rem',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.45rem',
      color: 'var(--text-primary)',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: 'var(--control-shadow), inset 0 1px 0 var(--glass-highlight)',
    },
    iconBtnText: {
      fontSize: '0.82rem',
      color: 'var(--text-secondary)',
    },
    grid: {
      '--gallery-columns': compactLevel === 2 ? 8 : compactLevel === 1 ? 5 : 4,
      '--gallery-gap': compactLevel === 2 ? '0.42rem' : compactLevel === 1 ? '0.82rem' : '1rem',
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
      borderRadius: compactLevel === 2 ? '14px' : compactLevel === 1 ? '18px' : '22px',
      overflow: 'hidden',
      background: 'var(--surface-muted)',
      border: '1px solid var(--glass-border)',
      boxShadow: compactLevel === 2 ? 'var(--card-shadow-soft)' : 'var(--card-shadow)',
    },
    image: {
      width: '100%',
      height: '100%',
      display: 'block',
      transition: 'transform 0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94), filter 0.22s ease',
    },
    overlay: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(180deg, rgba(255,255,255,0) 26%, rgba(13,18,28,0.55) 100%)',
      opacity: 0,
      transition: 'opacity 0.2s ease',
      pointerEvents: 'none',
    },
    caption: {
      position: 'absolute',
      left: '1rem',
      right: '1rem',
      bottom: '0.92rem',
      zIndex: 2,
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.2rem',
      opacity: compactLevel === 2 ? 0 : 1,
      transition: 'opacity 0.2s ease',
      pointerEvents: 'none',
    },
    captionEyebrow: {
      fontSize: '0.72rem',
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      color: 'rgba(255,255,255,0.7)',
    },
    captionTitle: {
      fontSize: '0.96rem',
      lineHeight: 1.2,
      fontWeight: 500,
    },
    sectionStatus: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: '1rem',
      alignItems: 'center',
      marginTop: '1rem',
      color: 'var(--text-secondary)',
      fontSize: '0.88rem',
    },
    utilityButton: {
      border: '1px solid var(--glass-border)',
      background: 'var(--glass-bg)',
      color: 'var(--text-primary)',
      borderRadius: '999px',
      padding: '0.8rem 1.1rem',
      cursor: 'pointer',
    },
    noticePanel: {
      border: '1px solid var(--glass-border)',
      background: 'var(--glass-bg)',
      borderRadius: '24px',
      padding: '1.2rem',
      boxShadow: 'var(--glass-shadow-soft)',
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
    },
    lightbox: {
      position: 'fixed',
      inset: 0,
      background: 'var(--viewer-backdrop)',
      backdropFilter: 'blur(16px) saturate(0.9)',
      WebkitBackdropFilter: 'blur(16px) saturate(0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1.8rem',
    },
    lightboxContent: {
      position: 'relative',
      maxWidth: '1380px',
      width: '100%',
      maxHeight: '92vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
    },
    viewerStage: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1.42fr) minmax(280px, 360px)',
      gap: '1rem',
      alignItems: 'start',
    },
    imageShell: {
      position: 'relative',
      minHeight: '68vh',
      borderRadius: '28px',
      overflow: 'hidden',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 18px 40px rgba(0,0,0,0.18)',
    },
    lightboxImage: {
      maxWidth: '100%',
      maxHeight: '68vh',
      objectFit: 'contain',
      borderRadius: '18px',
    },
    metadata: {
      display: 'flex',
      flexDirection: 'column',
      alignSelf: 'start',
      color: 'var(--text-primary)',
      background: 'var(--viewer-panel)',
      padding: '1.3rem 1.15rem',
      borderRadius: '24px',
      border: '1px solid var(--viewer-panel-border)',
      boxShadow: '0 14px 34px rgba(0,0,0,0.14)',
      gap: '1rem',
      maxWidth: '360px',
    },
    metadataHeader: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.55rem',
    },
    metadataEyebrow: {
      fontSize: '0.72rem',
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color: 'var(--text-secondary)',
    },
    metadataTitle: {
      fontSize: '1.26rem',
      fontWeight: '600',
      lineHeight: 1.12,
    },
    metadataMeta: {
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '0.55rem',
    },
    exifGrid: {
      display: 'flex',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      gap: '0.5rem',
      fontSize: '0.8rem',
    },
    exifValue: {
      color: 'var(--text-primary)',
      fontWeight: '400',
      background: 'var(--btn-bg)',
      padding: '0.38rem 0.64rem',
      borderRadius: '999px',
    },
    metaBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.35rem 0.7rem',
      borderRadius: '999px',
      background: 'var(--btn-bg)',
      color: 'var(--text-primary)',
      fontSize: '0.78rem',
    },
    metaMuted: {
      color: 'var(--text-secondary)',
      fontSize: '0.78rem',
    },
    metaParagraph: {
      color: 'var(--text-secondary)',
      fontSize: '0.9rem',
    },
    navBtn: {
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.12)',
      color: '#fff',
      cursor: 'pointer',
      borderRadius: '50%',
      width: '48px',
      height: '48px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'opacity 0.18s ease, transform 0.18s ease',
      opacity: 0.78,
    },
    closeBtn: {
      position: 'absolute',
      top: '18px',
      right: '18px',
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.12)',
      color: '#fff',
      cursor: 'pointer',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '44px',
      height: '44px',
    },
  };

  return (
    <div className={`container gallery-page view-${viewMode}`} style={styles.container}>
      <section className="gallery-hero" style={styles.hero}>
        <div style={styles.heroCopy}>
          <span style={styles.heroEyebrow}>{activeSeries.eyebrow}</span>
          <h1 style={styles.heroTitle}>{activeSeries.heroTitle}</h1>
          <p style={styles.heroText}>{activeSeries.heroText}</p>
          <p style={styles.heroNote}>{SITE_TAGLINE}</p>
        </div>

        <aside style={styles.heroPanel}>
          <div>
            <div style={styles.heroPanelLabel}>当前视图</div>
            <div style={styles.heroPanelValue}>{activeSeries.seriesTitle}</div>
            <div style={styles.heroPanelMuted}>{activeSeries.seriesDescription}</div>
          </div>
          <div>
            <div style={styles.heroPanelLabel}>浏览进度</div>
            <div style={styles.heroPanelValue}>{progressLabel}</div>
            <div style={styles.heroPanelMuted}>已整理 {featuredCount} 张精选作品，当前为 {viewModeMeta.label} 模式。</div>
          </div>
        </aside>
      </section>

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
      />

      {error ? (
        <section style={styles.noticePanel}>
          <h2 style={styles.noticeTitle}>作品暂时没有加载出来</h2>
          <p style={styles.noticeText}>{error}</p>
          <div>
            <button type="button" style={styles.utilityButton} onClick={hydrateGallery}>
              重新加载
            </button>
          </div>
        </section>
      ) : !loading && !filteredPhotos.length ? (
        <section style={styles.noticePanel}>
          <h2 style={styles.noticeTitle}>这个系列还没有作品</h2>
          <p style={styles.noticeText}>可以先切换到其他系列浏览，或运行图库生成脚本补齐数据。</p>
        </section>
      ) : (
        <>
          <MasonryGrid photos={arrangedPhotos} onPhotoClick={setSelectedId} styles={styles} />

          <div ref={sentinelRef} style={{ height: '20px', width: '100%', pointerEvents: 'none' }} />

          <div style={styles.sectionStatus}>
            <span>{loading ? '正在整理作品…' : hasMore ? '继续下滑，进入完整序列。' : '已经看到这个系列的末尾。'}</span>
            <span>{filteredPhotos.length ? `当前展开 ${displayPhotos.length} 张` : '暂无作品'}</span>
          </div>
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

export default Home;
