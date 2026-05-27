import React from 'react';
import { motion as Motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import GalleryBrowser from '../components/Gallery/GalleryBrowser';

const Works = ({ theme, onToggleTheme }) => {
  const location = useLocation();

  return (
    <div className="editorial-archive-page">
      <Motion.section
        className="editorial-archive-lead"
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="editorial-archive-copy">
          <h1 className="editorial-archive-title">Works</h1>
        </div>
      </Motion.section>

      <GalleryBrowser
        theme={theme}
        onToggleTheme={onToggleTheme}
        introEyebrow=""
        introTitle="所有图像"
        introBody=""
        selectedIdFromState={location.state?.selectedId ?? null}
      />
    </div>
  );
};

export default Works;
