import { Router } from 'express';
import { getSystemStats } from '../controllers/statsController';
import { protect, authorize } from '../middleware/auth';

const router = Router();


router.get('/', protect, authorize('admin', 'superadmin'), getSystemStats);

export default router;
