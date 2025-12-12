import { Router } from 'express';
import {
    uploadCourseResult,
    getMyResults,
    getMyUploadedResults,
    getCourseResults,
    deleteResult,
} from '../controllers/courseResultController';
import { protect } from '../middleware/auth';
import { uploadDocument } from '../middleware/upload';
import { body } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

const router = Router();

const resultUploadValidation = [
    body('courseId').notEmpty().withMessage('Course ID is required'),
    body('session').notEmpty().withMessage('Session is required'),
    body('semester').isInt({ min: 1, max: 8 }).withMessage('Valid semester is required'),
];

// Middleware to set upload type for multer
const setUploadType = (req: Request, _res: Response, next: NextFunction) => {
    (req as any).uploadType = 'results';
    next();
};

// Teacher routes
router.post(
    '/upload',
    protect,
    setUploadType,
    uploadDocument.single('resultFile'),
    resultUploadValidation,
    uploadCourseResult
);
router.get('/my-uploads', protect, getMyUploadedResults);

// Student routes
router.get('/my-results', protect, getMyResults);

// Shared routes
router.get('/course/:courseId', protect, getCourseResults);
router.delete('/:id', protect, deleteResult);

export default router;
