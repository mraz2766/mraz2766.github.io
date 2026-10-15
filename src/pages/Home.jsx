import React, { useEffect, useMemo, useRef, useState } from 'react';
import { m as Motion, useReducedMotion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  getFranchiseIndex,
  HOME_SELECTION,
  SITE_DESCRIPTION_ZH,
  SITE_SUBTITLE,
  SITE_TITLE_ZH,
} from '../data/siteContent';
import { getCachedPhotos, loadPhotos } from '../lib/gallery';
import { CountUp, prefersReducedMotion, Reveal } from '../lib/motion';
import { Bi, SpecimenLabel } from '../components/Specimen';

function pickSelection(photos) {
  const bySlug = new Map(photos.map((photo) => [photo.slug, photo]));
  const picked = HOME_SELECTION.map((slug) => bySlug.get(slug)).filter(Boolean);
  // Fall back to featured photos if some selected files were renamed/removed.
  const fill = photos.filter((photo) => photo.featured && !HOME_SELECTION.includes(photo.slug));
  return [...picked, ...fill].slice(0, HOME_SELECTION.length);
}

/** Section heading whose top rule draws itself in when it scrolls into view. */
const SectionHead = ({ no, zh, en, action }) => (
  <Reveal as="header" className="section-head">
    <span className="section-no">{no}</span>
    <h2><Bi zh={zh} en={en} /></h2>
    {action ? <div className="section-actions">{action}</div> : null}
  </Reveal>
);

/** Title whose characters rise in one after another. */
const StaggerTitle = ({ text }) => (
  <span className="stagger-title" aria-label={text}>
    {Array.from(text).map((char, index) => (
      <span key={`${char}-${index}`} className="stagger-char" style={{ '--i': index }} aria-hidden="true">
        {char}
      </span>
    ))}
  </span>
);

/** Floating preview photo that follows the cursor over the index list. */
function useHoverPreview() {
  const previewRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const handlers = {
    onPointerMove: (event) => {
      const element = previewRef.current;
      if (!element || event.pointerType !== 'mouse') return;
      element.style.transform = `translate3d(${event.clientX + 24}px, ${event.clientY - 90}px, 0)`;
    },
    onPointerLeave: () => setPreview(null),
  };

  const show = (photo) => (event) => {
    if (event.pointerType !== 'mouse' || prefersReducedMotion()) return;
    setPreview(photo || null);
  };

  return { previewRef, preview, handlers, show };
}

/** Horizontal strip that can be dragged with the mouse (touch scrolls natively). */
function useDragScroll() {
  const ref = useRef(null);
  const dragState = useRef({ active: false, moved: false, startX: 0, scroll: 0 });

  const onPointerDown = (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    dragState.current = { active: true, moved: false, startX: event.clientX, scroll: ref.current.scrollLeft };
  };
  const onPointerMove = (event) => {
    const state = dragState.current;
    if (!state.active) return;
    const delta = event.clientX - state.startX;
    if (Math.abs(delta) > 4) {
      state.moved = true;
      ref.current.classList.add('is-dragging');
    }
    ref.current.scrollLeft = state.scroll - delta;
  };
  const end = () => {
    dragState.current.active = false;
    ref.current?.classList.remove('is-dragging');
  };
  // Swallow the click that ends a drag so it doesn't open a photo.
  const onClickCapture = (event) => {
    if (dragState.current.moved) {
      event.preventDefault();
      event.stopPropagation();
      dragState.current.moved = false;
    }
  };

  return { ref, onPointerDown, onPointerMove, onPointerUp: end, onPointerLeave: end, onClickCapture };
}

const Home = () => {
  const [photos, setPhotos] = useState(() => getCachedPhotos() || []);
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const { previewRef, preview, handlers: previewHandlers, show } = useHoverPreview();
  const drag = useDragScroll();

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
  const uncatalogued = useMemo(
    () => photos.filter((photo) => photo.category === 'Toys' && !photo.franchise),
    [photos]
  );
  const coverFor = useMemo(() => {
    const covers = new Map();
    photos.forEach((photo) => {
      if (!photo.franchise) return;
      const current = covers.get(photo.franchise);
      if (!current || (photo.featured && !current.featured)) covers.set(photo.franchise, photo);
    });
    return covers;
  }, [photos]);

  const toysCount = photos.length - pets.length;
  const count = (value) => (photos.length ? <CountUp value={value} /> : '—');

  const openRandom = () => {
    if (!photos.length) return;
    const photo = photos[Math.floor(Math.random() * photos.length)];
    navigate(`/works?photo=${encodeURIComponent(photo.slug)}`);
  };

  return (
    <Motion.div
      className="home-page page-pad"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.3 }}
    >
      <section className="home-masthead" aria-labelledby="home-title">
        <h1 id="home-title" className="masthead-heading">
          <StaggerTitle text={SITE_TITLE_ZH} />
          <span className="masthead-en" lang="en">{SITE_SUBTITLE}</span>
        </h1>
        <p className="masthead-line">
          <span>{SITE_DESCRIPTION_ZH}</span>
          <span className="masthead-count">
            {count(photos.length)} 件 · 玩具 {count(toysCount)} · 宠物 {count(pets.length)}
          </span>
        </p>
      </section>

      <section className="home-section" aria-label="精选 Selected">
        <SectionHead
          no="01"
          zh="精选"
          en="Selected"
          action={(
            <>
              <button type="button" className="random-button" onClick={openRandom}>
                <span className="random-dice" aria-hidden="true">⁂</span>
                <Bi zh="随机一件" en="Random" />
              </button>
              <Link to="/works" className="text-link"><Bi zh="全部图鉴" en="View all" /> →</Link>
            </>
          )}
        />

        <div className="selected-grid">
          {selection.map((photo, index) => (
            <Reveal
              key={photo.id}
              className={index === 0 ? 'selected-item is-lead' : 'selected-item'}
              delay={index === 0 ? 0 : 120 + ((index - 1) % 4) * 70}
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
            </Reveal>
          ))}
        </div>
      </section>

      <section className="home-section" aria-label="目录 Index">
        <SectionHead no="02" zh="目录" en="Index" />

        <ol className="index-list" {...previewHandlers}>
          {franchises.map((franchise, index) => (
            <Reveal as="li" key={franchise.key} delay={(index % 8) * 40}>
              <Link
                to={`/works/toys?f=${encodeURIComponent(franchise.key)}`}
                className="index-row"
                onPointerEnter={show(coverFor.get(franchise.key))}
              >
                <span className="index-no">{String(index + 1).padStart(2, '0')}</span>
                <Bi zh={franchise.zh} en={franchise.en} className="index-name" />
                <span className="index-leader" aria-hidden="true" />
                <span className="index-count">{franchise.count}</span>
              </Link>
            </Reveal>
          ))}
          {uncatalogued.length ? (
            <Reveal as="li">
              <Link to="/works/toys" className="index-row is-muted" onPointerEnter={show(uncatalogued[0])}>
                <span className="index-no">—</span>
                <Bi zh="其他玩具 · 待编目" en="Other toys · Uncatalogued" className="index-name" />
                <span className="index-leader" aria-hidden="true" />
                <span className="index-count">{uncatalogued.length}</span>
              </Link>
            </Reveal>
          ) : null}
          {pets.length ? (
            <Reveal as="li">
              <Link to="/works/pets" className="index-row" onPointerEnter={show(pets[0])}>
                <span className="index-no">★</span>
                <Bi zh="特别收录 · 宠物" en="Special · Pets" className="index-name" />
                <span className="index-leader" aria-hidden="true" />
                <span className="index-count">{pets.length}</span>
              </Link>
            </Reveal>
          ) : null}
        </ol>

        <div className={preview ? 'index-preview is-visible' : 'index-preview'} ref={previewRef} aria-hidden="true">
          {preview ? (
            <>
              <img key={preview.slug} src={preview.thumbnail || preview.src} alt="" />
              <span className="specimen-no">No.{preview.no}</span>
            </>
          ) : null}
        </div>
      </section>

      {pets.length ? (
        <section className="home-section" aria-label="特别收录 Special">
          <SectionHead
            no="03"
            zh="特别收录：猫与狗"
            en="Special: Cats & Dogs"
            action={<Link to="/works/pets" className="text-link"><Bi zh="查看" en="View" /> →</Link>}
          />
          <div
            className="pets-strip"
            ref={drag.ref}
            onPointerDown={drag.onPointerDown}
            onPointerMove={drag.onPointerMove}
            onPointerUp={drag.onPointerUp}
            onPointerLeave={drag.onPointerLeave}
            onClickCapture={drag.onClickCapture}
          >
            {pets.map((photo, index) => (
              <Reveal key={photo.id} className="pets-strip-cell" delay={Math.min(index, 5) * 60}>
                <Link
                  to={`/works/pets?photo=${encodeURIComponent(photo.slug)}`}
                  className="pets-strip-item"
                  draggable={false}
                  style={{ '--frame-color': `var(--color-${photo.frameColor || 'vermillion'}-frame)` }}
                  aria-label={`No.${photo.no}`}
                >
                  <span className="specimen-frame">
                    <img src={photo.thumbnail || photo.src} alt="" loading="lazy" decoding="async" draggable={false} />
                  </span>
                  <span className="specimen-no">No.{photo.no}</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}
    </Motion.div>
  );
};

export default Home;
