import { Router } from 'express';
import {
    getFaculty,
    getFacultyById,
    createFaculty,
    updateFaculty,
    deleteFaculty,
} from '../controllers/facultyController';
import { protect } from '../middleware/auth';
import { validateFaculty } from '../middleware/validator';

const router = Router();

router.route('/')
    .get(getFaculty)
    .post(protect, validateFaculty, createFaculty);

router.route('/:id')
    .get(getFacultyById)
    .put(protect, validateFaculty, updateFaculty)
    .delete(protect, deleteFaculty);

export default router;
