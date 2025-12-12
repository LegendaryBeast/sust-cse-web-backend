import { Router } from 'express';
import {
    createSociety,
    getSocieties,
    getSocietyById,
    updateSociety,
    deleteSociety,
    addMember,
    removeMember,
    getMySocieties,
} from '../controllers/societyController';
import { protect, authorize } from '../middleware/auth';
import { body } from 'express-validator';

const router = Router();


const societyValidation = [
    body('name').notEmpty().trim().withMessage('Society name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('foundedYear').isInt().withMessage('Valid founded year is required'),
];


const memberValidation = [
    body('userId').notEmpty().withMessage('User ID is required'),
    body('userType').isIn(['Student', 'Teacher']).withMessage('User type must be Student or Teacher'),
    body('role').optional().trim(),
];


router.get('/', getSocieties);
router.get('/:id', getSocietyById);


router.get('/user/my-societies', protect, authorize('student', 'teacher'), getMySocieties);


router.post('/', protect, authorize('admin', 'superadmin'), societyValidation, createSociety);
router.put('/:id', protect, authorize('admin', 'superadmin'), updateSociety);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteSociety);
router.post('/:id/members', protect, authorize('admin', 'superadmin'), memberValidation, addMember);
router.delete('/:id/members/:memberId', protect, authorize('admin', 'superadmin'), removeMember);

export default router;
