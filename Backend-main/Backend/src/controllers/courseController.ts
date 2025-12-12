import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Course from '../models/Course';
import { asyncHandler, AppError } from '../middleware/errorHandler';




export const getCourses = asyncHandler(async (req: Request, res: Response) => {
    const { level } = req.query;

    const query = level ? { level } : {};
    const courses = await Course.find(query)
        .populate('teacherId', 'name email designation')
        .sort({ code: 1 });

    res.json({
        success: true,
        count: courses.length,
        data: courses,
    });
});




export const getCourseById = asyncHandler(async (req: Request, res: Response) => {
    const course = await Course.findById(req.params.id);

    if (!course) {
        throw new AppError('Course not found', 404);
    }

    res.json({
        success: true,
        data: course,
    });
});




export const getCoursesByLevel = asyncHandler(async (req: Request, res: Response) => {
    const { level } = req.params;

    const courses = await Course.find({ level }).sort({ code: 1 });

    res.json({
        success: true,
        count: courses.length,
        data: courses,
    });
});




export const createCourse = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
    }

    const course = await Course.create(req.body);

    res.status(201).json({
        success: true,
        data: course,
    });
});




export const updateCourse = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
    }

    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!course) {
        throw new AppError('Course not found', 404);
    }

    res.json({
        success: true,
        data: course,
    });
});




export const deleteCourse = asyncHandler(async (req: Request, res: Response) => {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
        throw new AppError('Course not found', 404);
    }

    res.json({
        success: true,
        data: {},
    });
});
