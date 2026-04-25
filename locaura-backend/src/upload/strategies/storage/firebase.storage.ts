import * as admin from 'firebase-admin';
import path from 'path';
import { StorageStrategy, StorageResult } from '../../interfaces/storage.strategy';
import { Logger } from '../../../utils/logger';

export class FirebaseStorageStrategy implements StorageStrategy {
  private bucket: any;

  constructor(bucketName?: string) {
    if (!admin.apps.length) {
      Logger.warn('Firebase admin might not be initialized properly. Attempting to initialize with service_account.json...', 'FirebaseStorage');
      try {
        const serviceAccountPath = path.join(process.cwd(), 'service_account.json');
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccountPath),
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'locauraa.appspot.com'
        });
      } catch (e) {
        Logger.error('Failed to initialize Firebase Admin', 'FirebaseStorage');
      }
    }
    
    const bucketValue = bucketName || process.env.FIREBASE_STORAGE_BUCKET;
    this.bucket = admin.storage().bucket(bucketValue);
  }

  async upload(filename: string, buffer: Buffer, mimetype: string): Promise<StorageResult> {
    const file = this.bucket.file(filename);
    
    await file.save(buffer, {
      metadata: { contentType: mimetype },
      resumable: false,
    });

    await file.makePublic();

    const publicUrl = `https://storage.googleapis.com/${this.bucket.name}/${filename}`;
    
    return { 
      url: publicUrl, 
      bytes: buffer.length 
    };
  }
}
