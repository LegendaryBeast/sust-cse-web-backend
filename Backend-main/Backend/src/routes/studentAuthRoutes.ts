import { Router } from 'express';
import {
    registerStudent,
    loginStudent,
    getStudentProfile,
    updateStudentProfile,
} from '../controllers/studentAuthController';
import { protect } from '../middleware/auth';
import { body } from 'express-validator';

const router = Router();


const registerValidation = [
    body('registrationId').notEmpty().withMessage('Registration ID is required'),
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('session').notEmpty().withMessage('Session is required'),
    body('batch').isInt().withMessage('Batch must be a number'),
];

const loginValidation = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
];


router.post('/register', registerValidation, registerStudent);
router.post('/login', loginValidation, loginStudent);
router.get('/me', protect, getStudentProfile);
router.put('/profile', protect, updateStudentProfile);

export default router;
