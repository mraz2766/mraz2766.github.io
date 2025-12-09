import React from 'react';
import Header from './Header';
import { motion } from 'framer-motion';

const Layout = ({ children }) => {
    return (
        <>
            <Header />
            <motion.main
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
                className="container"
                style={{ paddingBottom: '4rem' }}
            >
                {children}
            </motion.main>
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
        borderTop: '1px solid #eee',
        marginTop: 'auto',
    },
    copyright: {
        fontSize: '0.8rem',
        color: '#888',
    }
};

export default Layout;
