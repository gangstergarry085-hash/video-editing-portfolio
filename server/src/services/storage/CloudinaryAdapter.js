import { v2 as cloudinary } from 'cloudinary';
import crypto from 'crypto';

/**
 * Cloudinary storage adapter.
 * Uploads files to Cloudinary and returns their secure URLs.
 */
export class CloudinaryAdapter {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async upload(file) {
    const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;

    const isVideo = file.mimetype.startsWith('video/');
    const resourceType = isVideo ? 'video' : 'image';

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          public_id: `portfolio/${uniqueName}`,
          folder: 'dev-anand-portfolio',
        },
        (error, result) => {
          if (error) return reject(error);

          resolve({
            url: result.secure_url,
            filename: result.public_id,
            key: result.public_id,
          });
        }
      );

      uploadStream.end(file.buffer);
    });
  }

  async delete(key) {
    // Determine resource type from key (or try both)
    try {
      await cloudinary.uploader.destroy(key, { resource_type: 'video' });
    } catch {
      await cloudinary.uploader.destroy(key, { resource_type: 'image' });
    }
  }
}
