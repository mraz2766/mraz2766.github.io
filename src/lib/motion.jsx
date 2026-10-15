import React, { useEffect, useRef, useState } from 'react';

/* Lightweight motion helpers built on IntersectionObserver / rAF / CSS.
   Every effect is skipped when the visitor prefers reduced motion. */

export function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function isFinePointer() {
  return typeof window !== 'undefined'
    && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

/* ---------- Reveal on scroll ---------- */

let sharedObserver = null;
const revealCallbacks = new WeakMap();

function getObserver() {
  if (sharedObserver || typeof IntersectionObserver === 'undefined') return sharedObserver;
  sharedObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const callback = revealCallbacks.get(entry.target);
      sharedObserver.unobserve(entry.target);
      revealCallbacks.delete(entry.target);
      callback?.();
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
  return sharedObserver;
}

/** Calls `onVisible` once when the element first scrolls into view. */
export function useInView(onVisible) {
  const ref = useRef(null);
  const callbackRef = useRef(onVisible);

  useEffect(() => {
    callbackRef.current = onVisible;
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const observer = getObserver();
    if (!observer || prefersReducedMotion()) {
      callbackRef.current?.();
      return undefined;
    }
    revealCallbacks.set(element, () => callbackRef.current?.());
    observer.observe(element);
    return () => {
      observer.unobserve(element);
      revealCallbacks.delete(element);
    };
  }, []);

  return ref;
}

/**
 * Wraps content that should "open like a curtain" when scrolled into view.
 * CSS (.reveal / .is-revealed) does the actual animation; `delay` staggers
 * siblings (ms).
 */
export const Reveal = React.forwardRef(function Reveal(
  { as: Tag = 'div', className = '', delay = 0, style, children, ...rest },
  forwardedRef,
) {
  const [revealed, setRevealed] = useState(false);
  const ref = useInView(() => setRevealed(true));

  const setRefs = (node) => {
    ref.current = node;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  return (
    <Tag
      ref={setRefs}
      className={`reveal${revealed ? ' is-revealed' : ''}${className ? ` ${className}` : ''}`}
      style={{ ...style, '--reveal-delay': `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
});

/* ---------- Count-up numbers ---------- */

export const CountUp = ({ value, pad = 0, duration = 1100 }) => {
  const [display, setDisplay] = useState(prefersReducedMotion() ? value : 0);
  const [started, setStarted] = useState(false);
  const ref = useInView(() => setStarted(true));

  useEffect(() => {
    if (!started || typeof value !== 'number') return undefined;
    if (prefersReducedMotion()) {
      setDisplay(value);
      return undefined;
    }

    let frame = 0;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [started, value, duration]);

  const shown = typeof value === 'number' ? display : value;
  return <span ref={ref}>{typeof shown === 'number' ? String(shown).padStart(pad, '0') : shown}</span>;
};

/* ---------- Scroll progress hairline ---------- */

export const ScrollProgress = () => {
  const barRef = useRef(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 200 ? window.scrollY / max : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return <div className="scroll-progress" ref={barRef} aria-hidden="true" />;
};

/* ---------- "查看 View" cursor ---------- */

/**
 * A small label that trails the mouse over anything with a data-cursor
 * attribute (desktop only). One element, positioned with transforms.
 */
export const ViewCursor = () => {
  const ref = useRef(null);

  useEffect(() => {
    if (!isFinePointer() || prefersReducedMotion()) return undefined;
    const element = ref.current;
    let x = -100;
    let y = -100;
    let currentX = x;
    let currentY = y;
    let frame = 0;
    let label = '';

    const loop = () => {
      currentX += (x - currentX) * 0.22;
      currentY += (y - currentY) * 0.22;
      element.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      frame = Math.abs(x - currentX) + Math.abs(y - currentY) > 0.3 ? requestAnimationFrame(loop) : 0;
    };

    const onMove = (event) => {
      x = event.clientX;
      y = event.clientY;
      const target = event.target instanceof Element ? event.target.closest('[data-cursor]') : null;
      const nextLabel = target ? target.getAttribute('data-cursor') : '';
      if (nextLabel !== label) {
        label = nextLabel;
        element.textContent = label;
        element.classList.toggle('is-visible', Boolean(label));
        if (label) {
          currentX = x;
          currentY = y;
        }
      }
      if (!frame) frame = requestAnimationFrame(loop);
    };
    const onLeave = () => {
      label = '';
      element.classList.remove('is-visible');
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    // Clicking usually changes what is under the pointer (e.g. opens the
    // viewer), so hide until the next move re-evaluates the target.
    window.addEventListener('pointerdown', onLeave, { passive: true });
    window.addEventListener('scroll', onLeave, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onLeave);
      window.removeEventListener('scroll', onLeave);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return <div className="view-cursor" ref={ref} aria-hidden="true" />;
};
