import React from 'react';
import { useLocation } from 'react-router-dom';
import GalleryBrowser from '../components/Gallery/GalleryBrowser';

const Works = ({ theme, onToggleTheme }) => {
  const location = useLocation();

  return (
    <GalleryBrowser
      theme={theme}
      onToggleTheme={onToggleTheme}
      introEyebrow="Works"
      introTitle="从精选开始，再进入完整作品。"
      introBody="这里承接全部作品浏览，保留总览、系列切换与不同密度的观看方式。"
      selectedIdFromState={location.state?.selectedId ?? null}
    />
  );
};

export default Works;
