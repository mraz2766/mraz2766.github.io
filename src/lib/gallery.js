import { enrichPhoto } from '../data/siteContent';

let photosCache = null;
let photosRequest = null;

/** Synchronous access to already-loaded photos (null until the first load). */
export function getCachedPhotos() {
  return photosCache;
}

export async function loadPhotos() {
  if (photosCache) return photosCache;

  if (!photosRequest) {
    // Same URL + credentials mode as the <link rel="preload"> in index.html,
    // so the browser reuses the preloaded response.
    photosRequest = fetch('/photos.json', { credentials: 'same-origin' })
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
