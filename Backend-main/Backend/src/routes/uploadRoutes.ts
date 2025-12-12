import { Router } from 'express';
import { uploadImage, deleteImage } from '../controllers/uploadController';
import { uploadToMemory } from '../middleware/upload';
import { protect } from '../middleware/auth';

const router = Router();

// Upload image (protected - requires authentication)
router.post('/image', protect, uploadToMemory.single('image'), uploadImage);

// Delete image (protected - requires authentication)
router.delete('/image', protect, deleteImage);

export default router;
