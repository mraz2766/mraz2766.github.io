let photosListCache = null;
let photosListRequest = null;
let photoExifCache = null;
let photoExifRequest = null;

export const shuffleArray = (array) => {
  const cloned = [...array];
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
};

export const loadPhotosList = async () => {
  if (photosListCache) return photosListCache;

  if (!photosListRequest) {
    photosListRequest = fetch('/photos.json')
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data) => {
        photosListCache = data;
        return data;
      })
      .catch((error) => {
        photosListRequest = null;
        throw error;
      });
  }

  return photosListRequest;
};

export const loadPhotosExif = async () => {
  if (photoExifCache) return photoExifCache;

  if (!photoExifRequest) {
    photoExifRequest = fetch('/photos-exif.json')
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data) => {
        photoExifCache = data;
        return data;
      })
      .catch((error) => {
        photoExifRequest = null;
        throw error;
      });
  }

  return photoExifRequest;
};

export const getPhotoExif = async (photoId) => {
  const exifMap = await loadPhotosExif();
  return exifMap[String(photoId)] || null;
};
