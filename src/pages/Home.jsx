import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import FilterBar from '../components/Gallery/FilterBar';
import MasonryGrid from '../components/Gallery/MasonryGrid';
import Lightbox from '../components/Gallery/Lightbox';
import {
  getSeriesContent,
  getViewModeMeta,
  SERIES_ORDER,
  SITE_DESCRIPTION,
  SITE_TAGLINE,
  SITE_TITLE,
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
  const heroPhotos = filteredPhotos.slice(0, 3);
  const leadPhoto = heroPhotos[0];
  const supportingPhotos = heroPhotos.slice(1);
  const progressLabel = filteredPhotos.length ? `${displayPhotos.length} / ${filteredPhotos.length}` : '0 / 0';

  const handleToggleView = useCallback(() => {
    setViewMode((currentMode) => {
      const currentIndex = VIEW_MODE_SEQUENCE.indexOf(currentMode);
      return VIEW_MODE_SEQUENCE[(currentIndex + 1) % VIEW_MODE_SEQUENCE.length];
    });
  }, []);

  const styles = {
    page: {
      minHeight: '100vh',
    },
    heroBleed: {
      marginInline: 'calc(50% - 50vw)',
      padding: '0 clamp(1rem, 2vw, 2rem)',
    },
    hero: {
      minHeight: 'min(88vh, 920px)',
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 0.92fr) minmax(0, 1.08fr)',
      gap: 'clamp(1rem, 2vw, 1.8rem)',
      alignItems: 'stretch',
    },
    heroCopy: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: 'clamp(2rem, 4vw, 4rem) 0 clamp(1.4rem, 2vw, 2rem)',
      minWidth: 0,
    },
    heroTopline: {
      display: 'grid',
      gap: '1rem',
      maxWidth: '36rem',
    },
    heroEyebrow: {
      fontSize: '0.72rem',
      letterSpacing: '0.24em',
      textTransform: 'uppercase',
      color: 'var(--text-secondary)',
    },
    brand: {
      fontSize: 'clamp(1.2rem, 2vw, 1.6rem)',
      letterSpacing: '-0.03em',
      fontFamily: 'var(--font-heading)',
      color: 'var(--text-primary)',
    },
    heroTitle: {
      fontSize: 'clamp(3.3rem, 8vw, 7rem)',
      lineHeight: 0.9,
      letterSpacing: '-0.06em',
      maxWidth: '9.5ch',
    },
    heroText: {
      fontSize: 'clamp(1rem, 1.4vw, 1.08rem)',
      lineHeight: 1.7,
      color: 'var(--text-secondary)',
      maxWidth: '31rem',
    },
    heroMetaRow: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.9rem 1.4rem',
      alignItems: 'center',
      color: 'var(--text-secondary)',
      paddingTop: '1rem',
      borderTop: '1px solid var(--header-border)',
      fontSize: '0.88rem',
    },
    heroMetaStrong: {
      color: 'var(--text-primary)',
    },
    heroVisual: {
      position: 'relative',
      minHeight: '100%',
      display: 'grid',
      gridTemplateColumns: supportingPhotos.length ? '1.45fr 0.7fr' : '1fr',
      gap: '1rem',
    },
    leadVisual: {
      position: 'relative',
      borderRadius: '36px',
      overflow: 'hidden',
      minHeight: '100%',
      background: 'var(--surface-muted)',
      boxShadow: 'var(--card-shadow-strong)',
    },
    heroImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    heroOverlay: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(180deg, rgba(11, 14, 18, 0.04) 0%, rgba(11, 14, 18, 0.46) 100%)',
    },
    leadCaption: {
      position: 'absolute',
      left: '1.5rem',
      right: '1.5rem',
      bottom: '1.45rem',
      zIndex: 2,
      display: 'grid',
      gap: '0.25rem',
      color: '#fff',
    },
    leadCaptionMeta: {
      fontSize: '0.72rem',
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color: 'rgba(255,255,255,0.72)',
    },
    leadCaptionTitle: {
      fontSize: 'clamp(1.2rem, 2.4vw, 1.8rem)',
      lineHeight: 1,
    },
    supportRail: {
      display: 'grid',
      gap: '1rem',
      alignContent: 'end',
    },
    supportVisual: {
      position: 'relative',
      borderRadius: '28px',
      overflow: 'hidden',
      minHeight: '32vh',
      background: 'var(--surface-muted)',
    },
    introWrap: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) auto',
      gap: '1.5rem',
      alignItems: 'end',
      padding: '2.25rem 0 1rem',
    },
    introText: {
      display: 'grid',
      gap: '0.55rem',
      maxWidth: '40rem',
    },
    introEyebrow: {
      fontSize: '0.72rem',
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color: 'var(--text-secondary)',
    },
    introTitle: {
      fontSize: 'clamp(1.65rem, 2.6vw, 2.55rem)',
      letterSpacing: '-0.04em',
      lineHeight: 0.96,
    },
    introBody: {
      fontSize: '0.95rem',
      color: 'var(--text-secondary)',
      maxWidth: '34rem',
    },
    utilityMeta: {
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap',
      alignItems: 'center',
      fontSize: '0.83rem',
      color: 'var(--text-secondary)',
    },
    header: {
      display: 'grid',
      gridTemplateColumns: 'auto 1fr auto',
      gap: '1.5rem',
      alignItems: 'end',
      margin: '0 0 1.2rem 0',
      paddingBottom: '0.65rem',
      borderBottom: '1px solid var(--header-border)',
    },
    metaBlock: {
      display: 'grid',
      gap: '0.25rem',
      minWidth: '180px',
    },
    metaEyebrow: {
      fontSize: '0.7rem',
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color: 'var(--text-secondary)',
    },
    metaText: {
      fontSize: '1rem',
      color: 'var(--text-primary)',
    },
    metaDescription: {
      fontSize: '0.85rem',
      color: 'var(--text-secondary)',
      maxWidth: '20rem',
    },
    nav: {
      display: 'flex',
      gap: '1.2rem',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 0,
    },
    filterButton: {
      background: 'transparent',
      border: 'none',
      borderBottom: '1px solid transparent',
      borderRadius: 0,
      padding: '0.25rem 0',
      color: 'var(--text-secondary)',
      cursor: 'pointer',
      fontFamily: 'var(--font-body)',
      fontSize: '0.95rem',
      whiteSpace: 'nowrap',
      transition: 'color 0.2s ease, border-color 0.2s ease',
    },
    activeFilterButton: {
      background: 'transparent',
      border: 'none',
      borderBottom: '1px solid var(--text-primary)',
      borderRadius: 0,
      padding: '0.25rem 0',
      color: 'var(--text-primary)',
      cursor: 'pointer',
      fontFamily: 'var(--font-body)',
      fontSize: '0.95rem',
      whiteSpace: 'nowrap',
      transition: 'color 0.2s ease, border-color 0.2s ease',
    },
    actions: {
      display: 'flex',
      gap: '0.75rem',
      alignItems: 'center',
    },
    iconBtn: {
      background: 'transparent',
      border: 'none',
      padding: '0.2rem 0',
      minWidth: 'unset',
      height: 'unset',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: 'var(--text-primary)',
      cursor: 'pointer',
    },
    iconBtnText: {
      fontSize: '0.82rem',
      color: 'var(--text-secondary)',
    },
    grid: {
      '--gallery-columns': compactLevel === 2 ? 8 : compactLevel === 1 ? 5 : 4,
      '--gallery-gap': compactLevel === 2 ? '0.45rem' : compactLevel === 1 ? '0.9rem' : '1.15rem',
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
      background: 'linear-gradient(180deg, rgba(13,18,28,0.02) 10%, rgba(13,18,28,0.52) 100%)',
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
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color: 'rgba(255,255,255,0.68)',
    },
    captionTitle: {
      fontSize: '1rem',
      lineHeight: 1.08,
      fontFamily: 'var(--font-heading)',
    },
    sectionStatus: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: '1rem',
      alignItems: 'center',
      marginTop: '1.25rem',
      color: 'var(--text-secondary)',
      fontSize: '0.84rem',
      paddingTop: '0.9rem',
      borderTop: '1px solid var(--header-border)',
    },
    utilityButton: {
      border: '1px solid var(--glass-border)',
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
    },
    lightbox: {
      position: 'fixed',
      inset: 0,
      background: 'var(--viewer-backdrop)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1.5rem',
    },
    lightboxContent: {
      position: 'relative',
      maxWidth: '1480px',
      width: '100%',
      maxHeight: '92vh',
    },
    viewerStage: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1.6fr) minmax(250px, 320px)',
      gap: '1.5rem',
      alignItems: 'end',
    },
    imageShell: {
      position: 'relative',
      minHeight: '74vh',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(255,255,255,0.03)',
    },
    lightboxImage: {
      maxWidth: '100%',
      maxHeight: '74vh',
      objectFit: 'contain',
    },
    metadata: {
      display: 'grid',
      gap: '0.95rem',
      alignSelf: 'end',
      color: 'var(--text-primary)',
      paddingBottom: '1rem',
      maxWidth: '320px',
    },
    metadataHeader: {
      display: 'grid',
      gap: '0.5rem',
    },
    metadataEyebrow: {
      fontSize: '0.72rem',
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color: 'rgba(255,255,255,0.58)',
    },
    metadataTitle: {
      fontSize: 'clamp(1.8rem, 2.4vw, 2.5rem)',
      lineHeight: 0.92,
      color: '#fff',
    },
    metadataMeta: {
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '0.55rem',
    },
    exifGrid: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
      fontSize: '0.78rem',
    },
    exifValue: {
      color: 'rgba(255,255,255,0.88)',
      fontWeight: '400',
      border: '1px solid rgba(255,255,255,0.12)',
      padding: '0.35rem 0.62rem',
      borderRadius: '999px',
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
  };

  return (
    <div className="gallery-page" style={styles.page}>
      <section className="gallery-hero-bleed" style={styles.heroBleed}>
        <Motion.div
          className="gallery-hero"
          style={styles.hero}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div style={styles.heroCopy}>
            <Motion.div
              style={styles.heroTopline}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <span style={styles.heroEyebrow}>{activeSeries.eyebrow}</span>
              <span style={styles.brand}>{SITE_TITLE}</span>
              <h1 style={styles.heroTitle}>{activeSeries.heroTitle}</h1>
              <p style={styles.heroText}>{activeSeries.heroText}</p>
            </Motion.div>

            <Motion.div
              style={styles.heroMetaRow}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            >
              <span>{SITE_TAGLINE}</span>
              <span style={styles.heroMetaStrong}>{SITE_DESCRIPTION}</span>
            </Motion.div>
          </div>

          <Motion.div
            style={styles.heroVisual}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            {leadPhoto ? (
              <div style={styles.leadVisual}>
                <img src={leadPhoto.src} alt={leadPhoto.displayTitle} style={styles.heroImage} />
                <div style={styles.heroOverlay} />
                <div style={styles.leadCaption}>
                  <span style={styles.leadCaptionMeta}>{leadPhoto.category}</span>
                  <span style={styles.leadCaptionTitle}>{leadPhoto.displayTitle}</span>
                </div>
              </div>
            ) : null}

            {supportingPhotos.length ? (
              <div style={styles.supportRail}>
                {supportingPhotos.map((photo) => (
                  <div key={photo.id} style={styles.supportVisual}>
                    <img src={photo.thumbnail || photo.src} alt={photo.displayTitle} style={styles.heroImage} />
                    <div style={styles.heroOverlay} />
                  </div>
                ))}
              </div>
            ) : null}
          </Motion.div>
        </Motion.div>
      </section>

      <div className="container">
        <section className="gallery-intro" style={styles.introWrap}>
          <div style={styles.introText}>
            <span style={styles.introEyebrow}>Editorial Index</span>
            <h2 style={styles.introTitle}>{activeSeries.seriesTitle}</h2>
            <p style={styles.introBody}>{activeSeries.seriesDescription}</p>
          </div>

          <div style={styles.utilityMeta}>
            <span>当前 {viewModeMeta.label}</span>
            <span>{progressLabel}</span>
          </div>
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
              <span>{filteredPhotos.length ? `已展开 ${displayPhotos.length} 张作品` : '暂无作品'}</span>
            </div>
          </>
        )}
      </div>

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
