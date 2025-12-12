import express from 'express';
import {
    getJobs,
    getJob,
    createJob,
    updateJob,
    deleteJob,
    toggleJobStatus,
    getJobStats,
} from '../controllers/jobController';
import { protect } from '../middleware/auth';

const router = express.Router();

