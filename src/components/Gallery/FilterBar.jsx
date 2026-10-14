import React from 'react';
import { NavLink } from 'react-router-dom';
import { getSeriesContent, SERIES_SLUGS } from '../../data/siteContent';

const SLUG_BY_SERIES = Object.fromEntries(
  Object.entries(SERIES_SLUGS).map(([slug, series]) => [series, slug])
);

function getSeriesPath(category) {
  return category === 'All' ? '/works' : `/works/${SLUG_BY_SERIES[category]}`;
}

const FilterBar = ({
  categories,
  currentFilter,
  photoCount,
  seriesContent,
  loading = false,
}) => {
  return (
    <header className="gallery-toolbar">
      <div className="gallery-toolbar-title">
        <h1>{seriesContent.seriesTitle}</h1>
        <span>{loading ? '—' : photoCount} photographs</span>
      </div>

      {/* Real links: each series has its own URL and can be opened in a new tab. */}
      <nav className="gallery-filter" aria-label="Photo series">
        {categories.map((category, index) => (
          <NavLink
            key={category}
            to={getSeriesPath(category)}
            end
            replace
            className={currentFilter === category ? 'filter-link is-active' : 'filter-link'}
            style={{ '--link-color': index === 1 ? 'var(--color-cobalt-frame)' : 'var(--color-signal-red)' }}
            aria-current={currentFilter === category ? 'page' : undefined}
          >
            {getSeriesContent(category).label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
};

export default FilterBar;
