import { enrichPhoto } from '../data/siteContent';

let photosCache = null;
let photosRequest = null;

export async function loadPhotos() {
  if (photosCache) return photosCache;

  if (!photosRequest) {
    photosRequest = fetch('/photos.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error('照片数据加载失败');
        }

        return response.json();
      })
      .then((data) => {
        photosCache = data.map(enrichPhoto);
        return photosCache;
      })
      .catch((error) => {
        photosRequest = null;
        throw error;
      });
  }

  return photosRequest;
}
