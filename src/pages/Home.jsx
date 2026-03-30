import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import FilterBar from '../components/Gallery/FilterBar';
import MasonryGrid from '../components/Gallery/MasonryGrid';
import Lightbox from '../components/Gallery/Lightbox';

const PAGE_SIZE = 20;
const VIEW_MODE_SEQUENCE = ['default', 'compact', 'micro'];
let photosCache = null;
let photosRequest = null;
let shuffledAllCache = null;

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

    let patternIndex = 0;

    return photos.map((photo) => {
        const orientation = getOrientation(photo);
        const preferredVariant = pattern[patternIndex % pattern.length];
        patternIndex += 1;

        let layoutVariant = 'standard';

        if (orientation === 'landscape') {
            if (preferredVariant === 'hero' || preferredVariant === 'wide') {
                layoutVariant = preferredVariant;
            } else {
                layoutVariant = 'landscape';
            }
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

const shuffleArray = (array) => {
    const cloned = [...array];
    for (let i = cloned.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
    }
    return cloned;
};

const loadPhotos = async () => {
    if (photosCache) return photosCache;

    if (!photosRequest) {
        photosRequest = fetch('/photos.json')
            .then((res) => {
                if (!res.ok) throw new Error('Network response was not ok');
                return res.json();
            })
            .then((data) => {
                photosCache = data;
                shuffledAllCache = shuffleArray(data);
                return data;
            })
            .catch((error) => {
                photosRequest = null;
                throw error;
            });
    }

    return photosRequest;
};

const Home = ({ theme, onToggleTheme }) => {
    const [allPhotos, setAllPhotos] = useState([]);
    const [filteredPhotos, setFilteredPhotos] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [filter, setFilter] = useState('All');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('default');
    const sentinelRef = useRef(null);

    const displayPhotos = useMemo(
        () => filteredPhotos.slice(0, page * PAGE_SIZE),
        [filteredPhotos, page]
    );
    const arrangedPhotos = useMemo(
        () => assignLayoutVariants(displayPhotos, viewMode),
        [displayPhotos, viewMode]
    );
    const hasMore = displayPhotos.length < filteredPhotos.length;
    const compactLevel = viewMode === 'compact' ? 1 : viewMode === 'micro' ? 2 : 0;

    const applyFilter = useCallback((nextFilter, sourcePhotos) => {
        const basePhotos = sourcePhotos ?? allPhotos;
        const scopedPhotos = nextFilter === 'All'
            ? (sourcePhotos ? (shuffledAllCache ?? shuffleArray(basePhotos)) : (shuffledAllCache ?? basePhotos))
            : basePhotos.filter((photo) => photo.category === nextFilter);

        setFilter(nextFilter);
        setFilteredPhotos(scopedPhotos);
        setPage(1);
        setSelectedId(null);
        window.scrollTo({ top: 0, behavior: 'auto' });
    }, [allPhotos]);

    // Observer for infinite scroll
    useEffect(() => {
        const target = sentinelRef.current;
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && !loading) {
                setPage(prevPage => prevPage + 1);
            }
        }, {
            rootMargin: '400px',
            threshold: 0.1
        });

        if (target) {
            observer.observe(target);
        }

        return () => {
            if (target) observer.unobserve(target);
            observer.disconnect();
        };
    }, [hasMore, loading]);

    // Load Initial Data
    useEffect(() => {
        let isMounted = true;

        loadPhotos()
            .then(data => {
                if (!isMounted) return;
                setAllPhotos(data);
                applyFilter('All', data);
                setLoading(false);
            })
            .catch(err => {
                if (!isMounted) return;
                console.error("Failed to load photos:", err);
                setFilteredPhotos([]);
                setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [applyFilter]);

    // Navigation Handlers
    const handleNext = useCallback(() => {
        if (selectedId === null) return;
        const currentIndex = filteredPhotos.findIndex(p => p.id === selectedId);
        const nextIndex = (currentIndex + 1) % filteredPhotos.length;
        setSelectedId(filteredPhotos[nextIndex].id);
    }, [selectedId, filteredPhotos]);

    const handlePrev = useCallback(() => {
        if (selectedId === null) return;
        const currentIndex = filteredPhotos.findIndex(p => p.id === selectedId);
        const prevIndex = (currentIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
        setSelectedId(filteredPhotos[prevIndex].id);
    }, [selectedId, filteredPhotos]);

    // Keyboard Support
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (selectedId === null) return;
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'Escape') setSelectedId(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedId, handleNext, handlePrev]);

    const categories = ['All', ...new Set(allPhotos.map(p => p.category))];
    const selectedPhoto = allPhotos.find(p => p.id === selectedId);
    const handleToggleView = useCallback(() => {
        setViewMode((currentMode) => {
            const currentIndex = VIEW_MODE_SEQUENCE.indexOf(currentMode);
            return VIEW_MODE_SEQUENCE[(currentIndex + 1) % VIEW_MODE_SEQUENCE.length];
        });
    }, []);

    // Styles (moved from original file, but kept here to pass down)
    const styles = {
        container: {
            maxWidth: '1800px',
            margin: '0 auto',
            padding: '0 2rem 3.5rem 2rem',
            minHeight: '100vh',
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            margin: '0 0 1.6rem 0',
            padding: '0.1rem 0 0.35rem 0',
            position: 'relative',
            zIndex: 1,
            backgroundColor: 'var(--header-bg)',
            backdropFilter: 'none',
            WebkitBackdropFilter: 'none',
            borderBottom: 'none',
            transition: 'background-color 0.3s ease, border-color 0.3s ease',
        },
        metaBlock: {
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
            minWidth: '144px',
            flexShrink: 0,
        },
        metaEyebrow: {
            fontSize: '0.68rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--text-secondary)',
        },
        metaText: {
            fontSize: '1rem',
            fontWeight: '500',
            color: 'var(--text-primary)',
        },
        actions: {
            display: 'flex',
            gap: '0.65rem',
            alignItems: 'center',
            justifyContent: 'flex-end',
            minWidth: '104px',
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
            padding: '0.5rem 1.2rem',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: '0.9rem',
            fontWeight: '500',
            transition: 'all 0.2s ease',
        },
        activeFilterButton: {
            background: 'var(--btn-bg-active)',
            color: 'var(--btn-text-active)',
            borderRadius: '999px',
            padding: '0.5rem 1.2rem',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: '0.9rem',
            fontWeight: '500',
            boxShadow: 'var(--glass-shadow-soft)',
        },
        iconBtn: {
            background: 'var(--glass-bg-soft)',
            border: '1px solid var(--header-border)',
            borderRadius: '999px',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: 'var(--control-shadow), inset 0 1px 0 var(--glass-highlight)',
        },
        grid: {
            '--gallery-columns': compactLevel === 2 ? 8 : compactLevel === 1 ? 5 : 4,
            '--gallery-gap': compactLevel === 2 ? '0.42rem' : compactLevel === 1 ? '0.82rem' : '1.1rem',
        },
        gridClassName: compactLevel === 2 ? 'gallery-grid-micro' : compactLevel === 1 ? 'gallery-grid-compact' : 'gallery-grid-regular',
        item: {
            cursor: 'pointer',
            minWidth: 0,
        },
        imageWrapper: {
            position: 'relative',
            borderRadius: compactLevel === 2 ? '14px' : compactLevel === 1 ? '16px' : '20px',
            overflow: 'hidden',
            background: 'var(--surface-muted)',
            border: '1px solid var(--glass-border)',
            boxShadow: compactLevel === 2 ? 'var(--card-shadow-soft)' : 'var(--card-shadow)',
        },
        image: {
            width: '100%',
            height: '100%',
            display: 'block',
            transition: 'transform 0.38s cubic-bezier(0.25, 0.46, 0.45, 0.94), filter 0.25s ease',
        },
        overlay: {
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(15,23,42,0.12) 100%)',
            opacity: 0,
            transition: 'opacity 0.2s ease',
            pointerEvents: 'none',
        },
        lightbox: {
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'var(--lightbox-bg)',
            backdropFilter: 'blur(18px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem',
        },
        lightboxContent: {
            position: 'relative',
            maxWidth: '1200px',
            width: '100%',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        },
        lightboxImage: {
            maxWidth: '100%',
            maxHeight: '70vh',
            objectFit: 'contain',
            borderRadius: '8px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        },
        metadata: {
            marginTop: '1.5rem',
            color: 'var(--text-primary)',
            background: 'var(--glass-bg)',
            padding: '0.6rem 1.2rem',
            borderRadius: '999px',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--glass-shadow-strong), inset 0 1px 0 var(--glass-highlight)',
            maxWidth: '90%',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            zIndex: 10,
        },
        metadataTitle: {
            fontSize: '1.1rem',
            fontWeight: '600',
            marginRight: '0.8rem',
        },
        separator: {
            margin: '0 0.5rem',
            opacity: 0.3,
        },
        exifGrid: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            fontSize: '0.85rem',
        },
        exifValue: {
            color: 'var(--text-secondary)',
            fontWeight: '400',
        },
        navBtn: {
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            padding: '1rem',
            borderRadius: '50%',
            width: '56px',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            backdropFilter: 'blur(10px)',
            boxShadow: 'var(--glass-shadow-soft), inset 0 1px 0 var(--glass-highlight)',
        },
        closeBtn: {
            position: 'absolute',
            top: '-10px',
            right: '10px',
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            padding: '0.8rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
            boxShadow: 'var(--glass-shadow-soft), inset 0 1px 0 var(--glass-highlight)',
        },
    };

    return (
        <div className={`container gallery-page view-${viewMode}`} style={styles.container}>
            <FilterBar
                categories={categories}
                currentFilter={filter}
                onFilterChange={applyFilter}
                viewMode={viewMode}
                onToggleView={handleToggleView}
                theme={theme}
                onToggleTheme={onToggleTheme}
                photoCount={filteredPhotos.length}
                styles={styles}
            />

            <MasonryGrid
                photos={arrangedPhotos}
                onPhotoClick={setSelectedId}
                styles={styles}
            />

            {/* Sentinel Element */}
            <div ref={sentinelRef} style={{ height: '20px', width: '100%', pointerEvents: 'none' }} />

            {/* Loading Indicator */}
            {(hasMore || loading) && (
                <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        {loading ? (
                            <>
                                <span className="spinner" style={{
                                    width: '16px', height: '16px',
                                    border: '2px solid var(--text-secondary)',
                                    borderTopColor: 'transparent',
                                    borderRadius: '50%',
                                    animation: 'spin 0.8s linear infinite',
                                    display: 'inline-block'
                                }}></span>
                                Loading...
                            </>
                        ) : 'Scroll for more'}
                    </span>
                </div>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

            <AnimatePresence>
                {selectedId && selectedPhoto && (
                    <Lightbox
                        photo={selectedPhoto}
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
