import { Router } from 'express';
import {
    requestEnrollment,
    getMyEnrollments,
    getEnrollmentRequests,
    approveEnrollment,
    rejectEnrollment,
    getEnrolledStudents,
} from '../controllers/enrollmentController';
import { protect } from '../middleware/auth';
import { body } from 'express-validator';

const router = Router();

const enrollmentValidation = [
    body('courseId').notEmpty().withMessage('Course ID is required'),
    body('semester').isInt({ min: 1, max: 8 }).withMessage('Valid semester is required'),
    body('session').notEmpty().withMessage('Session is required'),
];

// Student routes
router.post('/request', protect, enrollmentValidation, requestEnrollment);
router.get('/my-enrollments', protect, getMyEnrollments);

// Teacher routes
router.get('/requests', protect, getEnrollmentRequests);
router.patch('/:id/approve', protect, approveEnrollment);
router.patch('/:id/reject', protect, rejectEnrollment);
router.get('/course/:courseId/students', protect, getEnrolledStudents);

export default router;
