import { Router } from 'express';
import multer from 'multer';
import { UploadModuleFactory } from '../factories/upload.factory';

const router = Router();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
});

const uploadController = UploadModuleFactory.createController();

router.post('/image', upload.single('image'), uploadController.uploadImage);

export default router;
