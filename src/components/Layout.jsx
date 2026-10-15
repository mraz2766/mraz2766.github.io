import React from 'react';
import Header from './Header';
import { CONTACT_EMAIL, SITE_SUBTITLE, SITE_TITLE, SITE_TITLE_ZH } from '../data/siteContent';
import { ScrollProgress } from '../lib/motion';

const MARQUEE_ITEMS = [SITE_TITLE_ZH, SITE_SUBTITLE, '玩具 · 猫狗 · 光', 'Vol. 2026'];

const Marquee = () => {
  // Rendered twice so the strip can loop seamlessly with translateX(-50%).
  const run = (copy) => (
    <span className="marquee-run" aria-hidden={copy > 0 ? 'true' : undefined} key={copy}>
      {MARQUEE_ITEMS.map((item) => (
        <span className="marquee-item" key={item}>
          <span lang={/[一-鿿]/.test(item) ? undefined : 'en'}>{item}</span>
          <span className="marquee-star" aria-hidden="true">✳</span>
        </span>
      ))}
    </span>
  );

  return (
    <div className="marquee">
      <div className="marquee-track">{[0, 1].map(run)}</div>
    </div>
  );
};

const Layout = ({ children }) => {
  return (
    <>
      <ScrollProgress />
      <Header />
      <main className="site-shell">
        {children}
      </main>
      <footer className="site-footer">
        <Marquee />
        <div className="site-footer-meta">
          <span>{SITE_TITLE_ZH} <span lang="en">{SITE_SUBTITLE}</span></span>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          <span lang="en">© 2026 {SITE_TITLE}</span>
        </div>
      </footer>
    </>
  );
};

export default Layout;
