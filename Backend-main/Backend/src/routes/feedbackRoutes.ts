import { Router } from 'express';
import {
    submitFeedback,
    getCourseFeedback,
    getTeacherFeedback,
    getFeedbackWithIdentity,
    getFeedbackStats,
    deleteFeedback,
} from '../controllers/feedbackController';
import { protect, authorize } from '../middleware/auth';
import { body } from 'express-validator';

const router = Router();


const feedbackValidation = [
    body('targetType').isIn(['course', 'teacher']).withMessage('Target type must be course or teacher'),
    body('targetId').notEmpty().withMessage('Target ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().trim(),
    body('session').notEmpty().withMessage('Session is required'),
];


router.get('/course/:courseId', getCourseFeedback);
router.get('/teacher/:teacherId', getTeacherFeedback);


router.post('/', protect, authorize('student'), feedbackValidation, submitFeedback);


router.get('/stats', protect, authorize('admin', 'superadmin', 'teacher'), getFeedbackStats);


router.get('/admin/:feedbackId', protect, authorize('admin', 'superadmin'), getFeedbackWithIdentity);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteFeedback);

export default router;
