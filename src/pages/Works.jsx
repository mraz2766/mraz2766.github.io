import { Navigate, useParams } from 'react-router-dom';
import GalleryBrowser from '../components/Gallery/GalleryBrowser';
import { getSeriesBySlug } from '../data/siteContent';

const Works = () => {
  const { slug } = useParams();
  const series = slug ? getSeriesBySlug(slug) : 'All';

  if (!series) {
    return <Navigate to="/works" replace />;
  }

  return (
    <div className="editorial-archive-page">
      <GalleryBrowser filter={series} />
    </div>
  );
};

export default Works;
