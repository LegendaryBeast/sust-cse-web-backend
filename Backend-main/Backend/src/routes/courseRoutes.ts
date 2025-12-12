import { Router } from 'express';
import {
    getCourses,
    getCourseById,
    getCoursesByLevel,
    createCourse,
    updateCourse,
    deleteCourse,
} from '../controllers/courseController';
import { protect } from '../middleware/auth';
import { validateCourse } from '../middleware/validator';

const router = Router();

router.route('/')
    .get(getCourses)
    .post(protect, validateCourse, createCourse);

router.get('/level/:level', getCoursesByLevel);

router.route('/:id')
    .get(getCourseById)
    .put(protect, validateCourse, updateCourse)
    .delete(protect, deleteCourse);

export default router;
