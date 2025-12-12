import { Router } from 'express';
import {
    createAdmission,
    getAdmissions,
    getAdmissionById,
    updateAdmission,
    deleteAdmission,
    submitApplication,
    getApplications,
    reviewApplication,
} from '../controllers/admissionController';
import { protect, authorize } from '../middleware/auth';
import { body } from 'express-validator';

const router = Router();


const admissionValidation = [
    body('title').notEmpty().trim().withMessage('Title is required'),
    body('session').notEmpty().trim().withMessage('Session is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
];


const applicationValidation = [
    body('applicantName').notEmpty().trim().withMessage('Applicant name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').notEmpty().trim().withMessage('Phone number is required'),
    body('appliedCourses').isArray({ min: 1 }).withMessage('At least one course must be selected'),
];


router.get('/', getAdmissions);
router.get('/:id', getAdmissionById);
router.post('/:id/apply', applicationValidation, submitApplication);


router.post('/', protect, authorize('admin', 'superadmin'), admissionValidation, createAdmission);
router.put('/:id', protect, authorize('admin', 'superadmin'), updateAdmission);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteAdmission);
router.get('/:id/applications', protect, authorize('admin', 'superadmin'), getApplications);
router.patch('/applications/:id/:action', protect, authorize('admin', 'superadmin'), reviewApplication);

export default router;
