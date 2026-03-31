import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SITE_TITLE } from '../data/siteContent';

const Header = () => {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/works') {
      return location.pathname.startsWith('/works');
    }
    return location.pathname === path;
  };

  return (
    <header className="site-header" style={styles.header}>
      <div className="container" style={styles.container}>
        <Link to="/" style={styles.logo} aria-label="首页">
          <span style={styles.logoMark}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="6" ry="6" />
              <circle cx="12" cy="12" r="5" />
              <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
            </svg>
          </span>
          <span style={styles.logoText}>{SITE_TITLE}</span>
        </Link>
        <nav style={styles.nav} aria-label="主导航">
          <Link
            to="/"
            style={{ ...styles.link, opacity: isActive('/') ? 1 : 0.5 }}
          >
            首页
          </Link>
          <Link
            to="/works"
            style={{ ...styles.link, opacity: isActive('/works') ? 1 : 0.5 }}
          >
            专题
          </Link>
          <Link
            to="/about"
            style={{ ...styles.link, opacity: isActive('/about') ? 1 : 0.5 }}
          >
            关于
          </Link>
        </nav>
      </div>
    </header>
  );
};

const styles = {
  header: {
    padding: '1.1rem 0',
    position: 'sticky',
    top: 0,
    backgroundColor: 'rgba(250, 248, 243, 0.66)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(15, 23, 42, 0.06)',
    zIndex: 300,
    transition: 'background-color 0.3s ease, border-color 0.3s ease',
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.08rem',
    fontWeight: 600,
    letterSpacing: '-0.03em',
    color: 'var(--text-primary)',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '0.7rem',
  },
  logoMark: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    lineHeight: 1,
  },
  nav: {
    display: 'flex',
    gap: '1.6rem',
  },
  link: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.84rem',
    letterSpacing: '0.18em',
    color: 'var(--text-primary)',
    textDecoration: 'none',
    transition: 'opacity 0.2s ease, color 0.2s ease',
  }
};

export default Header;
