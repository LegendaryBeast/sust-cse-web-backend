import { Router } from 'express';
import multer from 'multer';
import {
    uploadResultManual,
    uploadResultsExcel,
    getMyResults,
    getResultsBySession,
    getStudentResults,
    deleteResult,
} from '../controllers/resultController';
import { protect, authorize } from '../middleware/auth';
import { body } from 'express-validator';

const router = Router();


const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, 
    },
    fileFilter: (_req, file, cb) => {
        const allowedTypes = /xlsx|xls/;
        const extname = allowedTypes.test(file.originalname.toLowerCase());
        const mimetype = /vnd.openxmlformats|vnd.ms-excel/.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only Excel files are allowed (xlsx, xls)'));
        }
    },
});


const manualResultValidation = [
    body('studentId').notEmpty().withMessage('Student ID is required'),
    body('courseId').notEmpty().withMessage('Course ID is required'),
    body('session').notEmpty().withMessage('Session is required'),
    body('semester').isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8'),
    body('grade').notEmpty().trim().withMessage('Grade is required'),
    body('gpa').isFloat({ min: 0, max: 4 }).withMessage('GPA must be between 0 and 4'),
    body('marks').optional().isFloat({ min: 0, max: 100 }).withMessage('Marks must be between 0 and 100'),
];


router.get('/my-results', protect, authorize('student'), getMyResults);


router.post('/manual', protect, authorize('admin', 'superadmin', 'teacher'), manualResultValidation, uploadResultManual);
router.get('/session/:session/semester/:semester', protect, authorize('admin', 'superadmin', 'teacher'), getResultsBySession);
router.get('/student/:studentId', protect, authorize('admin', 'superadmin', 'teacher'), getStudentResults);


router.post('/upload-excel', protect, authorize('admin', 'superadmin'), upload.single('file'), uploadResultsExcel);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteResult);

export default router;
