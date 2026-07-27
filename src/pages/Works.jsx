import { useLocation } from 'react-router-dom';
import GalleryBrowser from '../components/Gallery/GalleryBrowser';

const Works = () => {
  const location = useLocation();

  return (
    <div className="editorial-archive-page">
      <GalleryBrowser
        selectedIdFromState={location.state?.selectedId ?? null}
      />
    </div>
  );
};

export default Works;
