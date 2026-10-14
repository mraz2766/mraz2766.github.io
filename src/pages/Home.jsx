import React, { useEffect, useMemo, useState } from 'react';
import { m as Motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  getFranchiseIndex,
  HOME_SELECTION,
  SITE_DESCRIPTION,
  SITE_DESCRIPTION_ZH,
  SITE_SUBTITLE,
  SITE_TITLE,
  SITE_TITLE_ZH,
} from '../data/siteContent';
import { getCachedPhotos, loadPhotos } from '../lib/gallery';
import { Bi, SpecimenLabel } from '../components/Specimen';

const PETS_STRIP_COUNT = 6;

function pickSelection(photos) {
  const bySlug = new Map(photos.map((photo) => [photo.slug, photo]));
  const picked = HOME_SELECTION.map((slug) => bySlug.get(slug)).filter(Boolean);
  // Fall back to featured photos if some selected files were renamed/removed.
  const fill = photos.filter((photo) => photo.featured && !HOME_SELECTION.includes(photo.slug));
  return [...picked, ...fill].slice(0, HOME_SELECTION.length);
}

const SectionHead = ({ no, zh, en, action }) => (
  <header className="section-head">
    <span className="section-no">{no}</span>
    <h2><Bi zh={zh} en={en} /></h2>
    {action}
  </header>
);

const Home = () => {
  const [photos, setPhotos] = useState(() => getCachedPhotos() || []);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    let active = true;
    loadPhotos()
      .then((data) => { if (active) setPhotos(data); })
      .catch(() => { if (active) setPhotos([]); });
    return () => { active = false; };
  }, []);

  const selection = useMemo(() => pickSelection(photos), [photos]);
  const franchises = useMemo(() => getFranchiseIndex(photos), [photos]);
  const pets = useMemo(() => photos.filter((photo) => photo.category === 'Pets'), [photos]);
  const toysCount = photos.length - pets.length;
  const cataloguedCount = photos.filter((photo) => photo.catalogued).length;
  const uncataloguedToys = photos.filter((photo) => photo.category === 'Toys' && !photo.franchise).length;
  const count = (value) => (photos.length ? value : '—');

  return (
    <Motion.div
      className="home-page page-pad"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.3 }}
    >
      <section className="home-masthead" aria-labelledby="home-title">
        <div className="masthead-title">
          <h1 id="home-title">
            <span className="masthead-wordmark" lang="en">{SITE_TITLE}</span>
            <span className="masthead-zh">{SITE_TITLE_ZH}</span>
          </h1>
          <p className="masthead-sub">
            <span>{SITE_DESCRIPTION_ZH}</span>
            <span lang="en">{SITE_SUBTITLE}. {SITE_DESCRIPTION}</span>
          </p>
        </div>

        <dl className="masthead-meta">
          <div><dt><Bi zh="卷" en="Vol." /></dt><dd>2026</dd></div>
          <div><dt><Bi zh="藏品" en="Items" /></dt><dd>{count(photos.length)}</dd></div>
          <div><dt><Bi zh="玩具" en="Toys" /></dt><dd>{count(toysCount)}</dd></div>
          <div><dt><Bi zh="宠物" en="Pets" /></dt><dd>{count(pets.length)}</dd></div>
          <div><dt><Bi zh="已编目" en="Catalogued" /></dt><dd>{count(cataloguedCount)}</dd></div>
        </dl>
      </section>

      <section className="home-section" aria-label="精选 Selected">
        <SectionHead
          no="01"
          zh="精选"
          en="Selected"
          action={<Link to="/works" className="text-link"><Bi zh="全部图鉴" en="View all" /> →</Link>}
        />

        <div className="selected-grid">
          {selection.map((photo, index) => (
            <Motion.div
              key={photo.id}
              className={index === 0 ? 'selected-item is-lead' : 'selected-item'}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : index * 0.04, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                to={`/works?photo=${encodeURIComponent(photo.slug)}`}
                className="specimen-card"
                style={{ '--frame-color': `var(--color-${photo.frameColor || 'vermillion'}-frame)` }}
                aria-label={`No.${photo.no} ${photo.displayTitle}`}
              >
                <span className="specimen-frame">
                  <img
                    src={index === 0 ? photo.src : photo.thumbnail || photo.src}
                    alt=""
                    width={photo.width}
                    height={photo.height}
                    loading={index < 5 ? 'eager' : 'lazy'}
                    fetchPriority={index === 0 ? 'high' : undefined}
                    decoding="async"
                  />
                </span>
                <SpecimenLabel photo={photo} />
              </Link>
            </Motion.div>
          ))}
        </div>
      </section>

      <section className="home-section" aria-label="目录 Index">
        <SectionHead no="02" zh="目录" en="Index" />

        <ol className="index-list">
          {franchises.map((franchise, index) => (
            <li key={franchise.key}>
              <Link to={`/works/toys?f=${encodeURIComponent(franchise.key)}`} className="index-row">
                <span className="index-no">{String(index + 1).padStart(2, '0')}</span>
                <Bi zh={franchise.zh} en={franchise.en} className="index-name" />
                <span className="index-leader" aria-hidden="true" />
                <span className="index-count">{franchise.count}</span>
              </Link>
            </li>
          ))}
          {uncataloguedToys ? (
            <li>
              <Link to="/works/toys" className="index-row is-muted">
                <span className="index-no">—</span>
                <Bi zh="其他玩具 · 待编目" en="Other toys · Uncatalogued" className="index-name" />
                <span className="index-leader" aria-hidden="true" />
                <span className="index-count">{uncataloguedToys}</span>
              </Link>
            </li>
          ) : null}
          {pets.length ? (
            <li>
              <Link to="/works/pets" className="index-row">
                <span className="index-no">★</span>
                <Bi zh="特别收录 · 宠物" en="Special · Pets" className="index-name" />
                <span className="index-leader" aria-hidden="true" />
                <span className="index-count">{pets.length}</span>
              </Link>
            </li>
          ) : null}
        </ol>
      </section>

      {pets.length ? (
        <section className="home-section" aria-label="特别收录 Special">
          <SectionHead
            no="03"
            zh="特别收录：猫与狗"
            en="Special: Cats & Dogs"
            action={<Link to="/works/pets" className="text-link"><Bi zh="查看" en="View" /> →</Link>}
          />
          <div className="pets-strip">
            {pets.slice(0, PETS_STRIP_COUNT).map((photo) => (
              <Link
                key={photo.id}
                to={`/works/pets?photo=${encodeURIComponent(photo.slug)}`}
                className="pets-strip-item"
                style={{ '--frame-color': `var(--color-${photo.frameColor || 'vermillion'}-frame)` }}
                aria-label={`No.${photo.no}`}
              >
                <span className="specimen-frame">
                  <img src={photo.thumbnail || photo.src} alt="" loading="lazy" decoding="async" />
                </span>
                <span className="specimen-no">No.{photo.no}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </Motion.div>
  );
};

export default Home;
