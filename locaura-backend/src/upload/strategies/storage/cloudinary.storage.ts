import { v2 as cloudinary } from 'cloudinary';
import { StorageStrategy, StorageResult } from '../../interfaces/storage.strategy';
import { Logger } from '../../../utils/logger';

export class CloudinaryStorageStrategy implements StorageStrategy {
  constructor() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error(
        'Missing Cloudinary credentials. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env'
      );
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    Logger.info('Cloudinary storage initialized', 'CloudinaryStorage');
  }

  async upload(filename: string, buffer: Buffer, mimetype: string): Promise<StorageResult> {
    return new Promise((resolve, reject) => {
      const filenameWithoutExt = filename.replace(/\.[^.]+$/, '');

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: filenameWithoutExt,
          resource_type: 'image',
          folder: 'locaura',
          overwrite: true,
          format: 'webp',
        },
        (error, result) => {
          if (error || !result) {
            Logger.error(`Cloudinary upload failed: ${error?.message ?? 'Unknown error'}`, 'CloudinaryStorage');
            return reject(new Error(error?.message ?? 'Cloudinary upload failed'));
          }
          resolve({
            url: result.secure_url,
            bytes: result.bytes,
          });
        }
      );

      uploadStream.end(buffer);
    });
  }
}
