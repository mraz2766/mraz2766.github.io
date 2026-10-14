import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SITE_TITLE, SITE_TITLE_ZH } from '../data/siteContent';
import { useTheme } from '../lib/theme';
import { Bi } from './Specimen';

const navItems = [
  { to: '/', en: 'Home', zh: '首页' },
  { to: '/works', en: 'Catalog', zh: '图鉴' },
  { to: '/about', en: 'About', zh: '关于' },
];

const Header = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path) => {
    if (path === '/works') return location.pathname.startsWith('/works');
    return location.pathname === path;
  };

  return (
    <header className="site-header">
      <Link to="/" className="site-logo" aria-label={`${SITE_TITLE} ${SITE_TITLE_ZH}`}>
        <span className="site-logo-mark" lang="en">{SITE_TITLE}</span>
        <span className="site-logo-zh">{SITE_TITLE_ZH}</span>
      </Link>

      <nav className="site-nav" aria-label="Main navigation">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={isActive(item.to) ? 'site-nav-link is-active' : 'site-nav-link'}
            aria-current={isActive(item.to) ? 'page' : undefined}
          >
            <Bi zh={item.zh} en={item.en} />
          </Link>
        ))}

        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? '切换到浅色 Switch to light' : '切换到深色 Switch to dark'}
        >
          <span className="theme-toggle-dot" aria-hidden="true" />
          <Bi zh={theme === 'dark' ? '深色' : '浅色'} en={theme === 'dark' ? 'Dark' : 'Light'} />
        </button>
      </nav>
    </header>
  );
};

export default Header;
