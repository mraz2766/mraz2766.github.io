import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FilterBar from '../components/Gallery/FilterBar';
import MasonryGrid from '../components/Gallery/MasonryGrid';
import Lightbox from '../components/Gallery/Lightbox';

// Utility to shuffle array
const shuffleArray = (array) => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
};

const PAGE_SIZE = 20;

const Home = () => {
    const [allPhotos, setAllPhotos] = useState([]);
    const [filteredPhotos, setFilteredPhotos] = useState([]);
    const [displayPhotos, setDisplayPhotos] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [filter, setFilter] = useState('All');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isCompact, setIsCompact] = useState(false);
    const sentinelRef = useRef(null);

    // Theme Management
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') || 'light';
        }
        return 'light';
    });

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    // Observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && !loading) {
                setPage(prevPage => prevPage + 1);
            }
        }, {
            rootMargin: '400px',
            threshold: 0.1
        });

        if (sentinelRef.current) {
            observer.observe(sentinelRef.current);
        }

        return () => {
            if (sentinelRef.current) observer.unobserve(sentinelRef.current);
            observer.disconnect();
        };
    }, [hasMore, loading]);

    // Load Initial Data
    useEffect(() => {
        setLoading(true);
        fetch('/photos.json')
            .then(res => {
                if (!res.ok) throw new Error('Network response was not ok');
                return res.json();
            })
            .then(data => {
                setAllPhotos(data);
                const shuffled = shuffleArray(data);
                setFilteredPhotos(shuffled);
                const initialBatch = shuffled.slice(0, PAGE_SIZE);
                setDisplayPhotos(initialBatch);
                setHasMore(shuffled.length > PAGE_SIZE);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load photos:", err);
                setHasMore(false);
                setLoading(false);
            });

        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@0,600;1,600&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);

        return () => document.head.removeChild(link);
    }, []);

    // Handle Theme Effects
    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.style.setProperty('--bg-color', '#000000');
            root.style.setProperty('--text-primary', '#f5f5f7');
            root.style.setProperty('--text-secondary', '#86868b');
            root.style.setProperty('--btn-bg', 'rgba(255,255,255,0.1)');
            root.style.setProperty('--btn-bg-active', '#fff');
            root.style.setProperty('--btn-text-active', '#000');
            root.style.setProperty('--lightbox-bg', 'rgba(0,0,0,0.95)');
            root.style.setProperty('--glass-bg', 'rgba(20,20,20,0.7)');
            root.style.setProperty('--glass-border', 'rgba(255,255,255,0.1)');
            root.style.setProperty('--header-bg', 'rgba(0,0,0,0.85)');
            root.style.setProperty('--header-border', 'rgba(255,255,255,0.15)');
        } else {
            root.style.setProperty('--bg-color', '#ffffff');
            root.style.setProperty('--text-primary', '#1d1d1f');
            root.style.setProperty('--text-secondary', '#86868b');
            root.style.setProperty('--btn-bg', 'rgba(0,0,0,0.05)');
            root.style.setProperty('--btn-bg-active', '#1d1d1f');
            root.style.setProperty('--btn-text-active', '#fff');
            root.style.setProperty('--lightbox-bg', 'rgba(255,255,255,0.98)');
            root.style.setProperty('--glass-bg', 'rgba(255,255,255,0.8)');
            root.style.setProperty('--glass-border', 'rgba(0,0,0,0.05)');
            root.style.setProperty('--header-bg', 'rgba(255,255,255,0.85)');
            root.style.setProperty('--header-border', 'rgba(0,0,0,0.05)');
        }
    }, [theme]);

    // Handle Filter Change
    useEffect(() => {
        if (allPhotos.length === 0) return;

        let filtered = filter === 'All' ? allPhotos : allPhotos.filter(p => p.category === filter);
        const shuffled = shuffleArray(filtered);

        setFilteredPhotos(shuffled);
        setPage(1);

        const nextHasMore = shuffled.length > PAGE_SIZE;
        setHasMore(nextHasMore);
        setDisplayPhotos(shuffled.slice(0, PAGE_SIZE));

        window.scrollTo({ top: 0, behavior: 'auto' });
    }, [filter, allPhotos]);

    // Handle Pagination
    useEffect(() => {
        if (page === 1) return;
        const nextBatch = filteredPhotos.slice(0, page * PAGE_SIZE);
        setDisplayPhotos(nextBatch);
        setHasMore(filteredPhotos.length > nextBatch.length);
    }, [page, filteredPhotos]);

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

    // Styles (moved from original file, but kept here to pass down)
    const styles = {
        container: {
            maxWidth: '1800px',
            margin: '0 auto',
            padding: '0 2rem 2rem 2rem',
            minHeight: '100vh',
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            margin: '0 -2rem 2rem -2rem',
            padding: '1rem 2rem',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backgroundColor: 'var(--header-bg)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--header-border)',
            transition: 'background-color 0.3s ease, border-color 0.3s ease',
        },
        nav: {
            display: 'flex',
            gap: '0.5rem',
            background: 'var(--btn-bg)',
            padding: '0.3rem',
            borderRadius: '999px',
            backdropFilter: 'blur(20px)',
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
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        },
        iconBtn: {
            background: 'var(--btn-bg)',
            border: '1px solid var(--header-border)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
        },
        grid: {
            columnCount: isCompact ? 7 : 3,
            columnGap: isCompact ? '0.5rem' : '2rem',
        },
        item: {
            breakInside: 'avoid',
            marginBottom: '2rem',
            cursor: 'pointer',
            borderRadius: '12px',
            overflow: 'hidden',
        },
        imageWrapper: {
            position: 'relative',
            borderRadius: '12px',
            overflow: 'hidden',
            background: 'var(--btn-bg)',
        },
        image: {
            width: '100%',
            height: 'auto',
            display: 'block',
            transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        },
        overlay: {
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.05)',
            opacity: 0,
            transition: 'opacity 0.3s',
            pointerEvents: 'none',
        },
        lightbox: {
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'var(--lightbox-bg)',
            backdropFilter: 'blur(20px)',
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
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--glass-border)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
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
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
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
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        },
    };

    // Inject mobile media queries
    const mobileStyles = `
        @media (max-width: 1024px) { .grid-container { column-count: 2 !important; } }
        @media (max-width: 768px) {
            .container { padding: 0 1rem 1rem 1rem !important; }
            .header { margin: 0 -1rem 1rem -1rem !important; padding: 0.8rem 1rem !important; }
            .logo-spacer { display: none; }
            .nav-scroll {
                flex-wrap: nowrap !important;
                overflow-x: auto;
                justify-content: flex-start !important;
                padding-right: 2rem;
                -webkit-overflow-scrolling: touch;
                scrollbar-width: none;
                mask-image: linear-gradient(to right, black 85%, transparent 100%);
            }
            .nav-scroll::-webkit-scrollbar { display: none; }
            .filter-btn { white-space: nowrap; flex-shrink: 0; }
            .grid-container { 
                column-count: ${isCompact ? 5 : 2} !important; 
                column-gap: ${isCompact ? '0.2rem' : '0.5rem'} !important;
            }
            .lightbox-content {
                width: 100% !important; height: 100% !important; max-height: 100vh !important;
                justify-content: center;
            }
            .lightbox-image {
                max-height: 55vh !important; width: 100% !important; object-fit: contain !important;
            }
            .metadata-panel {
                padding: 0.6rem 1rem !important; width: auto !important; max-width: 95% !important; margin-top: 1rem !important;
            }
            .metadata-title { font-size: 0.7rem !important; margin-right: 0.3rem !important; }
            .exif-grid { font-size: 0.6rem !important; gap: 0.3rem !important; }
            .separator { margin: 0 0.2rem !important; }
            .nav-btn {
                width: 44px !important; height: 44px !important; top: auto !important; bottom: 20px !important;
                background: rgba(0,0,0,0.3) !important; border: none !important; color: white !important; transform: none !important;
            }
            .nav-left { left: 20px !important; }
            .nav-right { right: 20px !important; }
            .close-btn {
                top: 15px !important; right: 15px !important; background: rgba(0,0,0,0.3) !important; color: white !important;
                width: 40px; height: 40px;
            }
        }
    `;

    return (
        <div className="container" style={styles.container}>
            <FilterBar
                categories={categories}
                currentFilter={filter}
                onFilterChange={setFilter}
                isCompact={isCompact}
                onToggleView={() => setIsCompact(!isCompact)}
                theme={theme}
                onToggleTheme={toggleTheme}
                styles={styles}
            />

            <MasonryGrid
                photos={displayPhotos}
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
            <style>{mobileStyles}</style>

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
