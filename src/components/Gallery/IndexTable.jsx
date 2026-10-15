import React from 'react';
import { getCameraName, getFranchise, getSeriesContent } from '../../data/siteContent';

/** Inventory-style list: one row per item, like a museum accession register. */
const IndexTable = ({ photos, onPhotoClick }) => (
  <div className="index-table-wrap">
    <table className="index-table">
      <thead>
        <tr>
          <th scope="col">No.</th>
          <th scope="col"><span className="visually-hidden">图 Image</span></th>
          <th scope="col">名称 <span lang="en">Name</span></th>
          <th scope="col" className="col-series">系列 <span lang="en">Series</span></th>
          <th scope="col" className="col-optional">品牌 <span lang="en">Maker</span></th>
          <th scope="col" className="col-optional">比例 <span lang="en">Scale</span></th>
          <th scope="col" className="col-optional">入手 <span lang="en">Year</span></th>
          <th scope="col" className="col-camera">相机 <span lang="en">Camera</span></th>
        </tr>
      </thead>
      <tbody>
        {photos.map((photo, index) => {
          const franchise = getFranchise(photo.franchise);
          const series = getSeriesContent(photo.category);
          return (
            <tr key={photo.id}>
              <td className="specimen-no">{photo.no}</td>
              <td className="index-thumb-cell">
                <button
                  type="button"
                  className="index-thumb"
                  data-photo-slug={photo.slug}
                  onClick={(event) => onPhotoClick(photo.slug, event.currentTarget)}
                  data-cursor="查看 View"
                  aria-label={`No.${photo.no} ${photo.displayTitle}`}
                  style={{ '--frame-color': `var(--color-${photo.frameColor || 'vermillion'}-frame)` }}
                >
                  <img src={photo.thumbnail || photo.src} alt="" loading={index < 12 ? 'eager' : 'lazy'} decoding="async" />
                </button>
              </td>
              <td>
                <button type="button" className="index-name-button" onClick={() => onPhotoClick(photo.slug)} tabIndex={-1}>
                  {photo.catalogued ? (
                    <>
                      <span className="specimen-name">{photo.name || photo.nameEn}</span>
                      {photo.name && photo.nameEn ? <span className="specimen-name-en" lang="en">{photo.nameEn}</span> : null}
                    </>
                  ) : (
                    <span className="specimen-name is-placeholder">{series.labelZh} <span lang="en">· Uncatalogued</span></span>
                  )}
                </button>
              </td>
              <td className="col-series">{franchise ? <>{franchise.zh} <span lang="en">{franchise.en}</span></> : <span className="muted">—</span>}</td>
              <td className="col-optional">{photo.maker || <span className="muted">—</span>}</td>
              <td className="col-optional">{photo.scale || <span className="muted">—</span>}</td>
              <td className="col-optional">{photo.year || <span className="muted">—</span>}</td>
              <td className="col-camera" lang="en">{getCameraName(photo.exif?.camera) || <span className="muted">—</span>}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

export default IndexTable;
