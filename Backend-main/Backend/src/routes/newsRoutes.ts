import { Router } from 'express';
import {
    getNews,
    getAllNews,
    getNewsById,
    createNews,
    updateNews,
    deleteNews,
} from '../controllers/newsController';
import { protect } from '../middleware/auth';
import { validateNews } from '../middleware/validator';

const router = Router();

router.route('/')
    .get(getNews)
    .post(protect, validateNews, createNews);

router.get('/all', protect, getAllNews);

router.route('/:id')
    .get(getNewsById)
    .put(protect, validateNews, updateNews)
    .delete(protect, deleteNews);

export default router;
