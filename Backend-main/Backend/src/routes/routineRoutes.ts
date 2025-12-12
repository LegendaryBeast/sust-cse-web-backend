import express from 'express';
import {
    getRoutines,
    getActiveRoutine,
    getRoutine,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    toggleRoutineStatus,
    getRoutineByDay,
} from '../controllers/routineController';
import { protect } from '../middleware/auth';

const router = express.Router();

