import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController';
import { protect, authorize } from '../middleware/auth';
import { validateRegister, validateLogin } from '../middleware/validator';

const router = Router();

router.post('/register', protect, authorize('superadmin'), validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', protect, getMe);

export default router;
