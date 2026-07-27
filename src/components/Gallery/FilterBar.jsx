import React from 'react';
import { Link } from 'react-router-dom';
import { getSeriesContent } from '../../data/siteContent';

const FilterBar = ({
  categories,
  currentFilter,
  onFilterChange,
  photoCount,
  seriesContent,
  showFilterNav = true,
}) => {
  return (
    <header className="gallery-toolbar">
      <div className="gallery-toolbar-title">
        <h1>{seriesContent.seriesTitle}</h1>
        <span>{photoCount} photographs</span>
      </div>

      {showFilterNav ? (
        <nav className="gallery-filter" aria-label="Photo categories">
          {categories.map((category, index) => {
            const categoryContent = getSeriesContent(category);
            return (
              <button
                key={category}
                type="button"
                onClick={() => onFilterChange(category)}
                className={currentFilter === category ? 'filter-link is-active' : 'filter-link'}
                style={{ '--link-color': index === 1 ? 'var(--color-cobalt-frame)' : 'var(--color-signal-red)' }}
                aria-pressed={currentFilter === category}
              >
                {categoryContent.label}
              </button>
            );
          })}
        </nav>
      ) : (
        <Link to="/works" className="filter-link series-back">All Works</Link>
      )}
    </header>
  );
};

export default FilterBar;
