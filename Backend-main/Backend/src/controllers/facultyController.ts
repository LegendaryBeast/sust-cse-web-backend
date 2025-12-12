import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Faculty from '../models/Faculty';
import Teacher from '../models/Teacher';
import { asyncHandler, AppError } from '../middleware/errorHandler';




export const getFaculty = asyncHandler(async (_req: Request, res: Response) => {
    // Fetch from both Faculty and approved Teacher models
    // since they represent the same entities
    const [facultyMembers, approvedTeachers] = await Promise.all([
        Faculty.find().sort({ createdAt: -1 }),
        Teacher.find({ isApproved: true }).sort({ createdAt: -1 })
    ]);

    // Merge both arrays
    const allFaculty = [...facultyMembers, ...approvedTeachers];

    res.json({
        success: true,
        count: allFaculty.length,
        data: allFaculty,
    });
});




export const getFacultyById = asyncHandler(async (req: Request, res: Response) => {
    const faculty = await Faculty.findById(req.params.id);

    if (!faculty) {
        throw new AppError('Faculty member not found', 404);
    }

    res.json({
        success: true,
        data: faculty,
    });
});




export const createFaculty = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
    }

    const faculty = await Faculty.create(req.body);

    res.status(201).json({
        success: true,
        data: faculty,
    });
});




export const updateFaculty = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
    }

    const faculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!faculty) {
        throw new AppError('Faculty member not found', 404);
    }

    res.json({
        success: true,
        data: faculty,
    });
});




export const deleteFaculty = asyncHandler(async (req: Request, res: Response) => {
    const faculty = await Faculty.findByIdAndDelete(req.params.id);

    if (!faculty) {
        throw new AppError('Faculty member not found', 404);
    }

    res.json({
        success: true,
        data: {},
    });
});
