import React from 'react';
import { getFranchise, getSeriesContent } from '../data/siteContent';

/** Bilingual label: Chinese (serif) followed by English (grotesk caps). */
export const Bi = ({ zh, en, className = '' }) => (
  <span className={`bi ${className}`.trim()}>
    {zh ? <span className="bi-zh">{zh}</span> : null}
    {en ? <span className="bi-en" lang="en">{en}</span> : null}
  </span>
);

/**
 * Museum-style label printed under every photograph:
 *   No.047                         MARVEL
 *   蜘蛛侠
 *   Spider-Man
 */
export const SpecimenLabel = ({ photo, detailed = false }) => {
  const franchise = getFranchise(photo.franchise);
  const series = getSeriesContent(photo.category);

  // Grid / strips: one quiet line — name on the left, number on the right.
  if (!detailed) {
    return (
      <span className="specimen-label is-compact">
        <span className={photo.name ? 'specimen-name' : 'specimen-name is-placeholder'}>
          {photo.name || photo.nameEn || series.labelZh}
        </span>
        <span className="specimen-no">No.{photo.no}</span>
      </span>
    );
  }

  return (
    <span className="specimen-label">
      <span className="specimen-label-row">
        <span className="specimen-no">No.{photo.no}</span>
        <span className="specimen-series" lang="en">{franchise ? franchise.en : series.label}</span>
      </span>
      {photo.catalogued ? (
        <>
          {photo.name ? <span className="specimen-name">{photo.name}</span> : null}
          {photo.nameEn ? <span className="specimen-name-en" lang="en">{photo.nameEn}</span> : null}
        </>
      ) : (
        <span className="specimen-name is-placeholder">{series.labelZh}<span lang="en"> · Uncatalogued</span></span>
      )}
    </span>
  );
};
