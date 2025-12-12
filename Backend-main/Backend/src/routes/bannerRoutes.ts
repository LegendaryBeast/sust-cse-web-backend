import { Router } from 'express';
import {
    createBanner,
    getBanners,
    getAllBanners,
    getBannerById,
    updateBanner,
    deleteBanner,
    toggleBanner,
} from '../controllers/bannerController';
import { protect, authorize } from '../middleware/auth';
import { body } from 'express-validator';

const router = Router();


const bannerValidation = [
    body('title').notEmpty().trim().withMessage('Title is required'),
    body('image').notEmpty().withMessage('Image is required'),
    body('type').optional().isIn(['event', 'notice', 'announcement']).withMessage('Invalid type'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
    body('priority').optional().isInt({ min: 0 }).withMessage('Priority must be a positive number'),
];


router.get('/', getBanners);
router.get('/:id', getBannerById);


router.get('/admin/all', protect, authorize('admin', 'superadmin'), getAllBanners);
router.post('/', protect, authorize('admin', 'superadmin'), bannerValidation, createBanner);
router.put('/:id', protect, authorize('admin', 'superadmin'), updateBanner);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteBanner);
router.patch('/:id/toggle', protect, authorize('admin', 'superadmin'), toggleBanner);

export default router;
