import React from 'react';
import Header from './Header';

const Layout = ({ children }) => {
    return (
        <>
            <Header />
            <main className="container" style={{ paddingBottom: '4rem' }}>
                {children}
            </main>
            <footer style={styles.footer}>
                <div className="container">
                    <p style={styles.copyright}>© 2025 Minimalist Lens. All rights reserved.</p>
                </div>
            </footer>
        </>
    );
};

const styles = {
    footer: {
        padding: '2rem 0',
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
