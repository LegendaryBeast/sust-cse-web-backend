import { Router } from 'express';
import {
    registerTeacher,
    loginTeacher,
    getTeacherProfile,
    updateTeacherProfile,
    getPendingTeachers,
    getApprovedTeachers,
    approveTeacher,
    createTeacherByAdmin,
} from '../controllers/teacherAuthController';
import { protect, authorize } from '../middleware/auth';
import { body } from 'express-validator';

const router = Router();


const registerValidation = [
    body('employeeId').notEmpty().withMessage('Employee ID is required'),
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('designation').notEmpty().withMessage('Designation is required'),
];

const loginValidation = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
];


router.post('/register', registerValidation, registerTeacher);
router.post('/login', loginValidation, loginTeacher);


router.get('/me', protect, getTeacherProfile);
router.put('/profile', protect, updateTeacherProfile);


// Admin routes
router.get('/pending', protect, authorize('admin', 'superadmin'), getPendingTeachers);
router.get('/approved', protect, authorize('admin', 'superadmin'), getApprovedTeachers);
router.patch('/:id/approve', protect, authorize('admin', 'superadmin'), approveTeacher);
router.post('/create', protect, authorize('admin', 'superadmin'), registerValidation, createTeacherByAdmin);

export default router;
