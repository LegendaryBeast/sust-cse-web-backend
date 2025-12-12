import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Feedback from '../models/Feedback';
import Course from '../models/Course';
import Teacher from '../models/Teacher';
import { asyncHandler, AppError } from '../middleware/errorHandler';




export const submitFeedback = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
    }

    const { targetType, targetId, rating, comment, isAnonymous, session } = req.body;
    const studentId = (req as any).user.id;

    
    if (targetType === 'course') {
        const course = await Course.findById(targetId);
        if (!course) {
            throw new AppError('Course not found', 404);
        }
    } else if (targetType === 'teacher') {
        const teacher = await Teacher.findById(targetId);
        if (!teacher) {
            throw new AppError('Teacher not found', 404);
        }
    }

    
    const existingFeedback = await Feedback.findOne({ studentId, targetType, targetId });
    if (existingFeedback) {
        throw new AppError('You have already submitted feedback for this ' + targetType, 400);
    }

    const feedback = await Feedback.create({
        studentId,
        targetType,
        targetId,
        rating,
        comment,
        isAnonymous: isAnonymous !== undefined ? isAnonymous : true,
        session,
    });

    res.status(201).json({
        success: true,
        message: 'Feedback submitted successfully',
        data: feedback,
    });
});




export const getCourseFeedback = asyncHandler(async (req: Request, res: Response) => {
    const courseId = req.params.courseId;

    const feedbacks = await Feedback.find({ targetType: 'course', targetId: courseId })
        .select('-studentId')
        .sort({ createdAt: -1 });

    
    const avgRating = feedbacks.length > 0
        ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
        : 0;

    res.json({
        success: true,
        count: feedbacks.length,
        averageRating: avgRating.toFixed(2),
        data: feedbacks,
    });
});




export const getTeacherFeedback = asyncHandler(async (req: Request, res: Response) => {
    const teacherId = req.params.teacherId;

    const feedbacks = await Feedback.find({ targetType: 'teacher', targetId: teacherId })
        .select('-studentId')
        .sort({ createdAt: -1 });

    
    const avgRating = feedbacks.length > 0
        ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
        : 0;

    res.json({
        success: true,
        count: feedbacks.length,
        averageRating: avgRating.toFixed(2),
        data: feedbacks,
    });
});




export const getFeedbackWithIdentity = asyncHandler(async (req: Request, res: Response) => {
    const feedback = await Feedback.findById(req.params.feedbackId)
        .populate('studentId', 'name registrationId email session batch')
        .populate('targetId', 'name title');

    if (!feedback) {
        throw new AppError('Feedback not found', 404);
    }

    res.json({
        success: true,
        data: feedback,
    });
});




export const getFeedbackStats = asyncHandler(async (_req: Request, res: Response) => {
    const courseStats = await Feedback.aggregate([
        { $match: { targetType: 'course' } },
        {
            $group: {
                _id: '$targetId',
                averageRating: { $avg: '$rating' },
                totalFeedbacks: { $sum: 1 },
            },
        },
        {
            $lookup: {
                from: 'courses',
                localField: '_id',
                foreignField: '_id',
                as: 'course',
            },
        },
        { $unwind: '$course' },
        {
            $project: {
                courseId: '$_id',
                courseName: '$course.title',
                courseCode: '$course.code',
                averageRating: { $round: ['$averageRating', 2] },
                totalFeedbacks: 1,
            },
        },
        { $sort: { averageRating: -1 } },
    ]);

    const teacherStats = await Feedback.aggregate([
        { $match: { targetType: 'teacher' } },
        {
            $group: {
                _id: '$targetId',
                averageRating: { $avg: '$rating' },
                totalFeedbacks: { $sum: 1 },
            },
        },
        {
            $lookup: {
                from: 'teachers',
                localField: '_id',
                foreignField: '_id',
                as: 'teacher',
            },
        },
        { $unwind: '$teacher' },
        {
            $project: {
                teacherId: '$_id',
                teacherName: '$teacher.name',
                designation: '$teacher.designation',
                averageRating: { $round: ['$averageRating', 2] },
                totalFeedbacks: 1,
            },
        },
        { $sort: { averageRating: -1 } },
    ]);

    res.json({
        success: true,
        data: {
            courses: courseStats,
            teachers: teacherStats,
        },
    });
});




export const deleteFeedback = asyncHandler(async (req: Request, res: Response) => {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
        throw new AppError('Feedback not found', 404);
    }

    await feedback.deleteOne();

    res.json({
        success: true,
        message: 'Feedback deleted successfully',
    });
});
