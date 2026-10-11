import { LocalAdapter } from './LocalAdapter.js';
import { CloudinaryAdapter } from './CloudinaryAdapter.js';

let storageInstance = null;

/**
 * Factory: returns the configured storage adapter.
 * Reads STORAGE_PROVIDER from env. Defaults to 'local'.
 */
export function getStorage() {
  if (storageInstance) return storageInstance;

  const hasCloudinary = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

  const provider = (process.env.STORAGE_PROVIDER || (hasCloudinary ? 'cloudinary' : 'local')).toLowerCase();

  switch (provider) {
    case 'cloudinary':
      storageInstance = new CloudinaryAdapter();
      break;
    case 'local':
    default:
      storageInstance = new LocalAdapter();
      break;
  }

  console.log(`Storage provider: ${provider}`);
  return storageInstance;
}
