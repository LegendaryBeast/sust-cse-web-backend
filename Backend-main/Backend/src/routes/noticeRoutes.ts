import { Router } from 'express';
import {
    createNotice,
    getNotices,
    getNoticeById,
    updateNotice,
    deleteNotice,
    uploadAttachments,
} from '../controllers/noticeController';
import { protect, authorize } from '../middleware/auth';
import { uploadNoticeAttachments } from '../middleware/upload';
import { body } from 'express-validator';

const router = Router();


const setUploadType = (req: any, _res: any, next: any) => {
    req.uploadType = 'notices';
    next();
};


const noticeValidation = [
    body('title').notEmpty().trim().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('type').optional().isIn(['routine', 'assignment', 'announcement', 'event']).withMessage('Invalid notice type'),
    body('targetAudience').optional().isIn(['all', 'session', 'batch']).withMessage('Invalid target audience'),
];


router.post(
    '/upload-attachments',
    protect,
    authorize('admin', 'superadmin', 'teacher'),
    setUploadType,
    uploadNoticeAttachments.array('attachments', 5),
    uploadAttachments
);


router.get('/', getNotices);
router.get('/:id', getNoticeById);


router.post(
    '/',
    protect,
    authorize('admin', 'superadmin', 'teacher'),
    noticeValidation,
    createNotice
);

router.put(
    '/:id',
    protect,
    authorize('admin', 'superadmin', 'teacher'),
    noticeValidation,
    updateNotice
);

router.delete(
    '/:id',
    protect,
    authorize('admin', 'superadmin', 'teacher'),
    deleteNotice
);

export default router;
