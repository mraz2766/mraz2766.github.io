import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SITE_TITLE } from '../data/siteContent';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/works', label: 'Works' },
  { to: '/about', label: 'About' },
];

const Header = () => {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/works') return location.pathname.startsWith('/works');
    return location.pathname === path;
  };

  return (
    <header className="site-header">
      <Link to="/" className="site-logo" aria-label={`${SITE_TITLE} home`}>
        {SITE_TITLE}
      </Link>

      <nav className="site-nav" aria-label="Main navigation">
        {navItems.map((item, index) => (
          <Link
            key={item.to}
            to={item.to}
            className={isActive(item.to) ? 'site-nav-link is-active' : 'site-nav-link'}
            style={{ '--link-color': index === 1 ? 'var(--color-cobalt-frame)' : 'var(--color-signal-red)' }}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
};

export default Header;
