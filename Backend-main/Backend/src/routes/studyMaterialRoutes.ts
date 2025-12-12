import express from 'express';
import {
    getStudyMaterials,
    getStudyMaterial,
    createStudyMaterial,
    updateStudyMaterial,
    deleteStudyMaterial,
    incrementDownload,
    getMyStudyMaterials,
} from '../controllers/studyMaterialController';
import { teacherProtect } from '../middleware/auth';

const router = express.Router();

