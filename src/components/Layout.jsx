import React from 'react';
import Header from './Header';
import { SITE_TITLE } from '../data/siteContent';

const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <main className="site-shell">
        {children}
      </main>
      <footer className="site-footer">
        <div className="container">
          <p>© 2026 {SITE_TITLE} · 中文摄影栏目。</p>
        </div>
      </footer>
    </>
  );
};

export default Layout;
