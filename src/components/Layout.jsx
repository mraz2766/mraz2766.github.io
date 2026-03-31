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
            <footer style={styles.footer}>
                <div className="container">
                    <p style={styles.copyright}>© 2026 {SITE_TITLE}. 个人作品集。</p>
                </div>
            </footer>
        </>
    );
};

const styles = {
    footer: {
        padding: '2.4rem 0 3rem',
        textAlign: 'center',
        borderTop: '1px solid var(--footer-border)',
        color: 'var(--text-secondary)',
        marginTop: 'auto',
        transition: 'border-color 0.3s ease, color 0.3s ease',
    },
    copyright: {
        fontSize: '0.8rem',
        color: 'inherit',
    }
};

export default Layout;
