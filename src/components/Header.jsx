import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header style={styles.header}>
      <div className="container" style={styles.container}>
        <Link to="/" style={styles.logo} aria-label="Home">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="6" ry="6" />
            <circle cx="12" cy="12" r="5" />
            <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
          </svg>
        </Link>
        <nav style={styles.nav}>
          <Link
            to="/"
            style={{ ...styles.link, opacity: isActive('/') ? 1 : 0.5 }}
          >
            Gallery
          </Link>
          <Link
            to="/about"
            style={{ ...styles.link, opacity: isActive('/about') ? 1 : 0.5 }}
          >
            About
          </Link>
        </nav>
      </div>
    </header>
  );
};

const styles = {
  header: {
    padding: '1.25rem 0',
    position: 'sticky',
    top: 0,
    backgroundColor: 'var(--header-bg)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    borderBottom: '1px solid var(--header-border)',
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
    fontSize: '1.5rem',
    fontWeight: 600,
    letterSpacing: '-0.02em',
    color: 'var(--text-primary)', // Ensure it uses the theme color (Black/White)
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
  },
  nav: {
    display: 'flex',
    gap: '2rem',
  },
  link: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: 'var(--text-primary)',
    textDecoration: 'none',
    transition: 'opacity 0.2s ease, color 0.2s ease',
  }
};

export default Header;
