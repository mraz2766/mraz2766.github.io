import React from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import { getSeriesContent, getSeriesSlug } from '../../data/siteContent';
import { Bi } from '../Specimen';

const FilterBar = ({
  categories,
  currentFilter,
  photoCount,
  seriesContent,
  loading = false,
  franchises = [],
  franchise = '',
  onFranchiseChange,
  view = 'grid',
  onViewChange,
}) => {
  const [searchParams] = useSearchParams();
  // Keep the grid/index choice when switching series; drop franchise + photo.
  const viewQuery = searchParams.get('view') ? `?view=${searchParams.get('view')}` : '';

  return (
    <header className="gallery-toolbar">
      <div className="gallery-toolbar-title">
        <h1><Bi zh={seriesContent.seriesTitleZh} en={seriesContent.seriesTitle} /></h1>
        <span className="gallery-count">
          <span className="specimen-no">{loading ? '—' : String(photoCount).padStart(3, '0')}</span>
          {' '}件 <span lang="en">items</span>
        </span>
      </div>

      <div className="gallery-controls">
        <nav className="gallery-filter" aria-label="分类 Series">
          {categories.map((category) => {
            const content = getSeriesContent(category);
            const slug = getSeriesSlug(category);
            return (
              <NavLink
                key={category}
                to={`${slug ? `/works/${slug}` : '/works'}${viewQuery}`}
                end
                replace
                className={currentFilter === category ? 'filter-link is-active' : 'filter-link'}
                aria-current={currentFilter === category ? 'page' : undefined}
              >
                <Bi zh={content.labelZh} en={content.label} />
              </NavLink>
            );
          })}
        </nav>

        {franchises.length ? (
          <label className="franchise-select">
            <span className="visually-hidden">系列 Series</span>
            <select value={franchise} onChange={(event) => onFranchiseChange(event.target.value)}>
              <option value="">全部系列 · All series</option>
              {franchises.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.zh} · {item.en} ({item.count})
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <div className="view-toggle" role="group" aria-label="视图 View">
          <button
            type="button"
            className={view === 'grid' ? 'filter-link is-active' : 'filter-link'}
            aria-pressed={view === 'grid'}
            onClick={() => onViewChange('grid')}
          >
            <Bi zh="图" en="Grid" />
          </button>
          <button
            type="button"
            className={view === 'index' ? 'filter-link is-active' : 'filter-link'}
            aria-pressed={view === 'index'}
            onClick={() => onViewChange('index')}
          >
            <Bi zh="表" en="Index" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default FilterBar;
