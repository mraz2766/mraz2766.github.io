import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SITE_TITLE } from '../data/siteContent';

const navItems = [
  { to: '/', label: '首页' },
  { to: '/works', label: '作品' },
  { to: '/about', label: '关于' },
];

const Header = () => {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/works') return location.pathname.startsWith('/works');
    return location.pathname === path;
  };

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to="/" className="site-logo" aria-label="返回首页">
          <span className="site-logo-mark" aria-hidden="true" />
          <span>{SITE_TITLE}</span>
        </Link>

        <nav className="site-nav" aria-label="主导航">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={isActive(item.to) ? 'site-nav-link is-active' : 'site-nav-link'}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
