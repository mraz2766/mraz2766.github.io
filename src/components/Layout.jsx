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
        <span>{SITE_TITLE}</span>
        <span>Photography / © 2026</span>
      </footer>
    </>
  );
};

export default Layout;
