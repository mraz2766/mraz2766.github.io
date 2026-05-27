import { enrichPhoto } from '../data/siteContent';

let photosCache = null;
let photosRequest = null;

export async function loadPhotos() {
  if (photosCache) return photosCache;

  if (!photosRequest) {
    photosRequest = fetch('/photos.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Load failed');
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
