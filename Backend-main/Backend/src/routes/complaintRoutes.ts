import express from 'express';
import {
    getComplaints,
    getComplaint,
    submitComplaint,
    updateComplaintStatus,
    respondToComplaint,
    deleteComplaint,
    getComplaintStats,
} from '../controllers/complaintController';
import { protect } from '../middleware/auth';

const router = express.Router();

