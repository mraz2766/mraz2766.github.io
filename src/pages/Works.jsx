import React from 'react';
import { useLocation } from 'react-router-dom';
import GalleryBrowser from '../components/Gallery/GalleryBrowser';

const Works = ({ theme, onToggleTheme }) => {
  const location = useLocation();

  return (
    <div className="editorial-archive-page">
      <GalleryBrowser
        theme={theme}
        onToggleTheme={onToggleTheme}
        introEyebrow=""
        introTitle=""
        introBody=""
        selectedIdFromState={location.state?.selectedId ?? null}
      />
    </div>
  );
};

export default Works;
