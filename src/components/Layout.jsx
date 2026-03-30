import React from 'react';
import Header from './Header';
import { motion as Motion } from 'framer-motion';

const Layout = ({ children }) => {
    return (
        <>
            <Header />
            <Motion.main
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
                className="container"
                style={{ paddingBottom: '4rem' }}
            >
                {children}
            </Motion.main>
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
