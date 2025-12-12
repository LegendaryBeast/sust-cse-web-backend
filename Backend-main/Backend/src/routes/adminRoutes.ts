import { Router } from 'express';
import {
    uploadRegistrations,
    getRegistrations,
    deleteRegistration,
} from '../controllers/adminController';
import { protect, authorize } from '../middleware/auth';
import { body } from 'express-validator';

const router = Router();


router.use(protect, authorize('admin', 'superadmin'));


const bulkUploadValidation = [
    body('registrations').isArray({ min: 1 }).withMessage('Registrations must be a non-empty array'),
    body('registrations.*.registrationId').notEmpty().withMessage('Registration ID is required'),
    body('registrations.*.session').notEmpty().withMessage('Session is required'),
    body('registrations.*.batch').isInt().withMessage('Batch must be a number'),
];


router.post('/registrations/bulk', bulkUploadValidation, uploadRegistrations);
router.get('/registrations', getRegistrations);
router.delete('/registrations/:id', deleteRegistration);

export default router;
