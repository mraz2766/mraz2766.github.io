import React from 'react';

const FilterBar = ({ categories, currentFilter, onFilterChange, isCompact, onToggleView, theme, onToggleTheme, styles }) => {
    return (
        <header className="header" style={styles.header}>
            <div className="logo-spacer" style={{ width: '40px' }}></div>

            <nav className="nav-scroll" style={styles.nav}>
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => onFilterChange(cat)}
                        style={currentFilter === cat ? styles.activeFilterButton : styles.filterButton}
                        className="filter-btn"
                    >
                        {cat}
                    </button>
                ))}
            </nav>

            <div style={{ display: 'flex', gap: '0.8rem' }}>
                <button onClick={onToggleView} style={styles.iconBtn} aria-label="Toggle View">
                    {isCompact ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /></svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" /></svg>
                    )}
                </button>

                <button onClick={onToggleTheme} style={styles.iconBtn} aria-label="Toggle Theme">
                    {theme === 'light' ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                    )}
                </button>
            </div>
        </header>
    );
};

export default FilterBar;
