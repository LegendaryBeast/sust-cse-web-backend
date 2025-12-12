import { Router } from 'express';
import {
    createCourseOffering,
    getCourseOfferings,
    getCourseOfferingById,
    updateCourseOffering,
    deleteCourseOffering,
    getMyOfferings,
} from '../controllers/courseOfferingController';
import { protect, authorize } from '../middleware/auth';
import { body } from 'express-validator';

const router = Router();

const offeringValidation = [
    body('courseId').notEmpty().withMessage('Course is required'),
    body('teacherId').notEmpty().withMessage('Teacher is required'),
    body('semester').isInt({ min: 1, max: 8 }).withMessage('Valid semester is required'),
    body('session').notEmpty().withMessage('Session is required'),
    body('year').notEmpty().withMessage('Year is required'),
];

// Teacher routes
router.get('/my-offerings', protect, getMyOfferings);

// Admin routes
router.post(
    '/',
    protect,
    authorize('admin', 'superadmin'),
    offeringValidation,
    createCourseOffering
);

router.get('/', protect, getCourseOfferings);
router.get('/:id', protect, getCourseOfferingById);

router.put(
    '/:id',
    protect,
    authorize('admin', 'superadmin'),
    updateCourseOffering
);

router.delete(
    '/:id',
    protect,
    authorize('admin', 'superadmin'),
    deleteCourseOffering
);

export default router;
