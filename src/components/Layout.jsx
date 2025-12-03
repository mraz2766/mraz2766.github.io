import React from 'react';
import Header from './Header';
import { motion } from 'framer-motion';

const Layout = ({ children }) => {
    return (
        <div style={styles.pageWrapper}>
            <Header />
            <motion.main
                key={location.pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={styles.mainContent}
            >
                <div className="container">
                    {children}
                </div>
            </motion.main>
            <footer style={styles.footer}>
                <div className="container" style={styles.footerContainer}>
                    <p>Copyright © 2025 Minimalist Lens. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

const styles = {
    pageWrapper: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
    },
    mainContent: {
        flex: 1,
        paddingTop: 'var(--spacing-xl)',
        paddingBottom: 'var(--spacing-xl)',
    },
    footer: {
        padding: 'var(--spacing-lg) 0',
        borderTop: '1px solid var(--border-color)',
    },
    footerContainer: {
        textAlign: 'center',
        color: 'var(--text-color-secondary)',
        fontSize: '0.9rem',
    }
};

export default Layout;