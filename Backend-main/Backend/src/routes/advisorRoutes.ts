import { Router } from 'express';
import {
    assignAdvisor,
    getAdvisors,
    getMyStudents,
    getMyAdvisor,
    removeAdvisor,
} from '../controllers/advisorController';
import { protect, authorize } from '../middleware/auth';
import { body } from 'express-validator';

const router = Router();


const assignValidation = [
    body('teacherId').notEmpty().withMessage('Teacher ID is required'),
    body('session').notEmpty().withMessage('Session is required'),
    body('batch').isInt().withMessage('Batch must be a number'),
];


router.post('/', protect, authorize('admin', 'superadmin'), assignValidation, assignAdvisor);
router.get('/', protect, authorize('admin', 'superadmin', 'teacher'), getAdvisors);
router.delete('/:id', protect, authorize('admin', 'superadmin'), removeAdvisor);


router.get('/my-students', protect, authorize('teacher'), getMyStudents);


router.get('/my-advisor', protect, authorize('student'), getMyAdvisor);

export default router;
