import React from 'react';
import Header from './Header';
import { CONTACT_EMAIL, SITE_SUBTITLE, SITE_TITLE, SITE_TITLE_ZH } from '../data/siteContent';

const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <main className="site-shell">
        {children}
      </main>
      <footer className="site-footer">
        <div className="site-footer-meta">
          <span>{SITE_TITLE_ZH} <span lang="en">{SITE_SUBTITLE}</span></span>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          <span lang="en">© 2026</span>
        </div>
        <div className="site-footer-wordmark" aria-hidden="true" lang="en">{SITE_TITLE}</div>
      </footer>
    </>
  );
};

export default Layout;
