import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SITE_TITLE_ZH } from '../data/siteContent';
import { useTheme } from '../lib/theme';

const navItems = [
  { to: '/works', label: '图鉴', match: (path) => path.startsWith('/works') && !/^\/works\/(pets|daily)/.test(path) },
  { to: '/works/pets', label: '宠物', match: (path) => path.startsWith('/works/pets') },
  { to: '/works/daily', label: '日常', match: (path) => path.startsWith('/works/daily') },
  { to: '/about', label: '关于', match: (path) => path === '/about' },
];

const Header = () => {
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="site-header">
      <Link to="/" className="site-logo" aria-label={`${SITE_TITLE_ZH} 首页`}>
        {SITE_TITLE_ZH}
      </Link>

      <nav className="site-nav" aria-label="Main navigation">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={item.match(pathname) ? 'site-nav-link is-active' : 'site-nav-link'}
            aria-current={item.match(pathname) ? 'page' : undefined}
          >
            {item.label}
          </Link>
        ))}

        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? '切换到浅色 Switch to light' : '切换到深色 Switch to dark'}
          title={theme === 'dark' ? '浅色' : '深色'}
        >
          <span className="theme-toggle-dot" aria-hidden="true" />
        </button>
      </nav>
    </header>
  );
};

export default Header;
