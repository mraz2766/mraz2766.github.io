import React, { useEffect, useMemo, useRef, useState } from 'react';
import { m as Motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  getCameraName,
  getFranchise,
  getFranchiseIndex,
  HOME_SELECTION,
} from '../data/siteContent';
import { getCachedPhotos, loadPhotos } from '../lib/gallery';
import { opensPhoto, PAGE_VARIANTS, prefersReducedMotion, Reveal } from '../lib/motion';
import { rememberFlightSource } from '../lib/flight';

const HERO_INTERVAL = 7000;
const STRIP_LIMIT = 14;
const FRANCHISE_ROWS = 4;

function pickSelection(photos) {
  const bySlug = new Map(photos.map((photo) => [photo.slug, photo]));
  const picked = HOME_SELECTION.map((slug) => bySlug.get(slug)).filter(Boolean);
  // Fall back to featured photos if some selected files were renamed/removed.
  const fill = photos.filter((photo) => photo.featured && !HOME_SELECTION.includes(photo.slug));
  return [...picked, ...fill].slice(0, HOME_SELECTION.length);
}

const pad = (value) => String(value).padStart(2, '0');

/** Horizontal strip that can be dragged with the mouse (touch scrolls natively). */
function useDragScroll() {
  const ref = useRef(null);
  const state = useRef({ active: false, moved: false, startX: 0, scroll: 0 });

  return {
    ref,
    onPointerDown: (event) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      state.current = { active: true, moved: false, startX: event.clientX, scroll: ref.current.scrollLeft };
    },
    onPointerMove: (event) => {
      const current = state.current;
      if (!current.active) return;
      const delta = event.clientX - current.startX;
      if (Math.abs(delta) > 4) {
        current.moved = true;
        ref.current.classList.add('is-dragging');
      }
      ref.current.scrollLeft = current.scroll - delta;
    },
    onPointerUp: () => {
      state.current.active = false;
      ref.current?.classList.remove('is-dragging');
    },
    onPointerLeave: () => {
      state.current.active = false;
      ref.current?.classList.remove('is-dragging');
    },
    // Swallow the click that ends a drag so it doesn't open a photo.
    onClickCapture: (event) => {
      if (state.current.moved) {
        event.preventDefault();
        event.stopPropagation();
        state.current.moved = false;
      }
    },
  };
}

/** One quiet row: small title, then photos you can scroll / drag sideways. */
const Strip = ({ zh, en, to, count, photos, linkFor }) => {
  const drag = useDragScroll();

  return (
    <section className="strip-section" aria-label={`${zh} ${en}`}>
      <Reveal as="header" className="strip-head">
        <h2>{zh} <span lang="en">{en}</span></h2>
        <Link to={to} className="strip-more">{count} 件 →</Link>
      </Reveal>
      <div className="strip" {...drag}>
        {photos.map((photo, index) => (
          <Reveal key={photo.id} className="strip-cell" delay={Math.min(index, 6) * 60}>
            <Link
              to={linkFor(photo)}
              className="strip-item"
              draggable={false}
              onClick={(event) => rememberFlightSource(photo.slug, event.currentTarget)}
              aria-label={`No.${photo.no} ${photo.displayTitle}`}
            >
              <span className="strip-frame" style={{ aspectRatio: `${photo.width || 4} / ${photo.height || 5}` }}>
                <img
                  src={photo.thumbnail || photo.src}
                  alt=""
                  width={photo.width}
                  height={photo.height}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
              </span>
              {photo.name ? <span className="strip-caption">{photo.name}</span> : null}
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

/** The exhibit: one large photo with a few quiet facts, cycling slowly. */
const Hero = ({ photos }) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const navigate = useNavigate();
  const count = photos.length;
  const photo = photos[index % count];
  const auto = !paused && !prefersReducedMotion();

  useEffect(() => {
    if (!auto || count < 2) return undefined;
    const timer = window.setTimeout(() => {
      if (!document.hidden) setIndex((value) => (value + 1) % count);
    }, HERO_INTERVAL);
    return () => window.clearTimeout(timer);
  }, [auto, count, index]);

  // Preload the next exhibit so the cross-fade never waits.
  useEffect(() => {
    const next = photos[(index + 1) % count];
    if (next) {
      const image = new Image();
      image.src = next.src;
    }
  }, [photos, index, count]);

  if (!photo) return <section className="hero is-empty" aria-hidden="true" />;

  const franchise = getFranchise(photo.franchise);
  const exif = [getCameraName(photo.exif?.camera), photo.exif?.aperture, photo.exif?.shutter && `${photo.exif.shutter}s`]
    .filter(Boolean)
    .join(' · ');
  const go = (step) => setIndex((value) => (value + step + count) % count);

  return (
    <section
      className="hero"
      aria-roledescription="carousel"
      aria-label="精选 Selected"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <button
        type="button"
        className="hero-frame"
        onClick={(event) => {
          // The photo flies from here into the viewer on the next page.
          rememberFlightSource(photo.slug, event.currentTarget);
          navigate(`/works?photo=${encodeURIComponent(photo.slug)}`);
        }}
        aria-label={`查看 ${photo.displayTitle}`}
      >
        <img
          key={photo.slug}
          src={photo.src}
          alt=""
          width={photo.width}
          height={photo.height}
          fetchPriority="high"
          decoding="async"
        />
      </button>

      <div className="hero-info" key={`info-${photo.slug}`}>
        <h1 className="hero-name">{photo.name || '未编目'}</h1>
        <p className="hero-meta">
          {[photo.nameEn, franchise?.en].filter(Boolean).join(' · ') || 'Uncatalogued'}
        </p>
        <p className="hero-meta">
          No.{photo.no}{exif ? ` · ${exif}` : ''}
        </p>

        <div className="hero-controls">
          <button type="button" onClick={() => go(-1)} aria-label="上一件 Previous">←</button>
          <span className="hero-counter">{pad(index + 1)} / {pad(count)}</span>
          <button type="button" onClick={() => go(1)} aria-label="下一件 Next">→</button>
        </div>
        <span
          key={`timer-${index}-${auto}`}
          className={auto ? 'hero-timer is-running' : 'hero-timer'}
          style={{ '--hero-interval': `${HERO_INTERVAL}ms` }}
          aria-hidden="true"
        />
      </div>
    </section>
  );
};

const Home = () => {
  const [photos, setPhotos] = useState(() => getCachedPhotos() || []);
  const location = useLocation();

  useEffect(() => {
    let active = true;
    loadPhotos()
      .then((data) => { if (active) setPhotos(data); })
      .catch(() => { if (active) setPhotos([]); });
    return () => { active = false; };
  }, []);

  const selection = useMemo(() => pickSelection(photos), [photos]);
  const pets = useMemo(() => photos.filter((photo) => photo.category === 'Pets'), [photos]);
  const franchiseRows = useMemo(() => getFranchiseIndex(photos).slice(0, FRANCHISE_ROWS).map((franchise) => {
    const items = photos.filter((photo) => photo.franchise === franchise.key);
    return {
      ...franchise,
      photos: [...items.filter((photo) => photo.featured), ...items.filter((photo) => !photo.featured)].slice(0, STRIP_LIMIT),
    };
  }), [photos]);

  return (
    <Motion.div
      className="home-page page-pad"
      variants={PAGE_VARIANTS}
      custom={opensPhoto(location.search)}
      initial="initial"
      animate="enter"
      exit="exit"
    >
      <Hero photos={selection} />

      {selection.length ? (
        <Strip
          zh="精选"
          en="Selected"
          to="/works"
          count={photos.length}
          photos={selection}
          linkFor={(photo) => `/works?photo=${encodeURIComponent(photo.slug)}`}
        />
      ) : null}

      {franchiseRows.map((row) => (
        <Strip
          key={row.key}
          zh={row.zh}
          en={row.en}
          to={`/works/toys?f=${encodeURIComponent(row.key)}`}
          count={row.count}
          photos={row.photos}
          linkFor={(photo) => `/works/toys?f=${encodeURIComponent(row.key)}&photo=${encodeURIComponent(photo.slug)}`}
        />
      ))}

      {pets.length ? (
        <Strip
          zh="猫与狗"
          en="Cats & Dogs"
          to="/works/pets"
          count={pets.length}
          photos={pets}
          linkFor={(photo) => `/works/pets?photo=${encodeURIComponent(photo.slug)}`}
        />
      ) : null}

      {photos.length ? (
        <Reveal className="home-end">
          <Link to="/works" className="home-end-link">浏览全部 {photos.length} 件 <span lang="en">View all</span> →</Link>
        </Reveal>
      ) : null}
    </Motion.div>
  );
};

export default Home;
