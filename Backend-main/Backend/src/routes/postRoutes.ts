import express from 'express';
import {
    getPosts,
    getPost,
    createPost,
    updatePost,
    deletePost,
    addComment,
    deleteComment,
    togglePin,
} from '../controllers/postController';
import { teacherProtect, studentProtect } from '../middleware/auth';

const router = express.Router();

