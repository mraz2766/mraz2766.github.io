import React from 'react';
import { getSeriesContent } from '../../data/siteContent';

const FilterBar = ({
  categories,
  currentFilter,
  onFilterChange,
  viewMode,
  viewModeMeta,
  onToggleView,
  theme,
  onToggleTheme,
  photoCount,
  seriesContent,
  styles,
  showFilterNav = true,
}) => {
  return (
    <header className="header" style={styles.header}>
      <div style={styles.metaBlock}>
        <span style={styles.metaEyebrow}>{seriesContent.seriesTitle}</span>
        <span style={styles.metaText}>{photoCount} 张作品</span>
        <p style={styles.metaDescription}>{seriesContent.seriesDescription}</p>
      </div>

      {showFilterNav ? (
        <nav className="nav-scroll" style={styles.nav} aria-label="作品系列">
          {categories.map((category) => {
            const categoryContent = getSeriesContent(category);
            return (
              <button
                key={category}
                type="button"
                onClick={() => onFilterChange(category)}
                style={currentFilter === category ? styles.activeFilterButton : styles.filterButton}
                className="filter-btn"
                aria-pressed={currentFilter === category}
                title={categoryContent.seriesDescription}
              >
                <span>{categoryContent.label}</span>
              </button>
            );
          })}
        </nav>
      ) : (
        <div />
      )}

      <div style={styles.actions}>
        <button type="button" onClick={onToggleView} style={styles.iconBtn} aria-label={`切换视图，当前为${viewModeMeta.label}`}>
          {viewMode === 'micro' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h4v4H4zM10 4h4v4h-4zM16 4h4v4h-4zM4 10h4v4H4zM10 10h4v4h-4zM16 10h4v4h-4zM4 16h4v4H4zM10 16h4v4h-4zM16 16h4v4h-4z" />
            </svg>
          ) : viewMode === 'compact' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
            </svg>
          )}
          <span style={styles.iconBtnText}>{viewModeMeta.label}</span>
        </button>

        <button type="button" onClick={onToggleTheme} style={styles.iconBtn} aria-label={theme === 'light' ? '切换到深色模式' : '切换到浅色模式'}>
          {theme === 'light' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
          <span style={styles.iconBtnText}>{theme === 'light' ? '浅色' : '深色'}</span>
        </button>
      </div>
    </header>
  );
};

export default FilterBar;
