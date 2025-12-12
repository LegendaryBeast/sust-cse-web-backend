import { Router } from 'express';
import {
    submitContact,
    getContacts,
    getContactById,
    markAsRead,
    deleteContact,
} from '../controllers/contactController';
import { protect } from '../middleware/auth';
import { validateContact } from '../middleware/validator';

const router = Router();

router.route('/')
    .get(protect, getContacts)
    .post(validateContact, submitContact);

router.route('/:id')
    .get(protect, getContactById)
    .delete(protect, deleteContact);

router.patch('/:id/read', protect, markAsRead);

export default router;
