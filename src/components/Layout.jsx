import React from 'react';
import Header from './Header';
import { CONTACT_EMAIL, SITE_TITLE, SITE_TITLE_ZH } from '../data/siteContent';
import { ScrollProgress } from '../lib/motion';

const Layout = ({ children }) => {
  return (
    <>
      <ScrollProgress />
      <Header />
      <main className="site-shell">
        {children}
      </main>
      <footer className="site-footer">
        <span>{SITE_TITLE_ZH}</span>
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        <span lang="en">© 2026 {SITE_TITLE}</span>
      </footer>
    </>
  );
};

export default Layout;
