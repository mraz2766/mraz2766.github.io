import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <header style={styles.header}>
      <div className="container" style={styles.container}>
        <Link to="/" style={styles.logo}>
          Lens
        </Link>
        <nav style={styles.nav}>
          <Link to="/" style={{...styles.link, ... (isActive('/') ? styles.activeLink : {})}}>
            Gallery
          </Link>
          <Link to="/about" style={{...styles.link, ... (isActive('/about') ? styles.activeLink : {})}}>
            About
          </Link>
        </nav>
      </div>
    </header>
  );
};

const styles = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    padding: 'var(--spacing-md) 0',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'saturate(180%) blur(20px)',
    borderBottom: '1px solid var(--border-color)',
    width: '100%',
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: 'var(--max-width)',
    margin: '0 auto',
    padding: '0 var(--spacing-lg)',
  },
  logo: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'var(--text-color-primary)',
  },
  nav: {
    display: 'flex',
    gap: 'var(--spacing-lg)',
  },
  link: {
    fontSize: '1rem',
    color: 'var(--text-color-secondary)',
    transition: 'color 0.2s ease',
  },
  activeLink: {
    color: 'var(--text-color-primary)',
    fontWeight: '500',
  }
};

export default Header;