import { prefersReducedMotion } from './motion';

/*
 * Shared-element transition between a grid tile and the lightbox, done with
 * the Web Animations API: a temporary <img> "flies" from one rectangle to the
 * other while the real elements stay hidden underneath.
 */

let pendingSource = null;

/** Remember where the clicked photo is, so the lightbox can fly out of it. */
export function rememberFlightSource(slug, element) {
  const image = element?.querySelector?.('img') || element;
  if (!image?.getBoundingClientRect) {
    pendingSource = null;
    return;
  }
  pendingSource = { slug, rect: image.getBoundingClientRect(), src: image.currentSrc || image.src, time: performance.now() };
}

/** True when `src` is already downloaded and decodable (memory/disk cache). */
export function isImageReady(src) {
  if (!src || typeof Image === 'undefined') return false;
  const probe = new Image();
  probe.src = src;
  return probe.complete && probe.naturalWidth > 0;
}

export function takeFlightSource(slug) {
  const source = pendingSource;
  pendingSource = null;
  if (!source || source.slug !== slug || performance.now() - source.time > 1500) return null;
  return source;
}

/** Rectangle actually covered by an object-fit: contain image inside `box`. */
export function containRect(box, width, height) {
  if (!width || !height) return box;
  const scale = Math.min(box.width / width, box.height / height);
  const w = width * scale;
  const h = height * scale;
  return { left: box.left + (box.width - w) / 2, top: box.top + (box.height - h) / 2, width: w, height: h };
}

/**
 * Fly an image from `from` to `to` (viewport rects). Resolves when done.
 * `cover` = the source is object-fit: cover (grid tiles crop), so clip it.
 */
export function fly({ src, from, to, duration = 520 }) {
  if (prefersReducedMotion() || !from || !to || !from.width || !to.width || !document.body.animate) {
    return Promise.resolve();
  }

  const flyer = document.createElement('img');
  flyer.src = src;
  flyer.alt = '';
  flyer.className = 'flight-image';
  Object.assign(flyer.style, {
    left: `${to.left}px`,
    top: `${to.top}px`,
    width: `${to.width}px`,
    height: `${to.height}px`,
  });
  document.body.appendChild(flyer);

  const dx = from.left - to.left;
  const dy = from.top - to.top;
  const sx = from.width / to.width;
  const sy = from.height / to.height;

  const animation = flyer.animate(
    [
      { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
      { transform: 'translate(0, 0) scale(1, 1)' },
    ],
    { duration, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' },
  );

  return animation.finished
    .catch(() => {})
    .then(() => {
      flyer.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, fill: 'forwards' })
        .finished.catch(() => {})
        .then(() => flyer.remove());
    });
}
