import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import CourseResult from '../models/CourseResult';
import Enrollment from '../models/Enrollment';
import Course from '../models/Course';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import path from 'path';
import fs from 'fs';

// Teacher: Upload result file for a course
export const uploadCourseResult = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
    }

    const teacherId = (req as any).user.id;
    const { courseId, session, semester, description } = req.body;

    if (!req.file) {
        throw new AppError('Please upload a result file', 400);
    }

    // Verify teacher owns this course
    const course = await Course.findOne({ _id: courseId, teacherId });
    if (!course) {
        throw new AppError('Course not found or you are not the teacher', 403);
    }

    // Determine file type
    const fileExtension = path.extname(req.file.filename).toLowerCase();
    let fileType: 'excel' | 'pdf' | 'doc' | 'docx';

    if (fileExtension === '.xlsx' || fileExtension === '.xls') {
        fileType = 'excel';
    } else if (fileExtension === '.pdf') {
        fileType = 'pdf';
    } else if (fileExtension === '.doc') {
        fileType = 'doc';
    } else if (fileExtension === '.docx') {
        fileType = 'docx';
    } else {
        throw new AppError('Invalid file type. Please upload Excel, PDF, or Word document', 400);
    }

    // Create course result record
    const courseResult = await CourseResult.create({
        courseId,
        teacherId,
        session,
        semester,
        fileName: req.file.filename,
        filePath: `/uploads/results/${req.file.filename}`,
        fileType,
        fileSize: req.file.size,
        description,
    });

    res.status(201).json({
        success: true,
        message: 'Result file uploaded successfully',
        data: courseResult,
    });
});

// Student: Get results for my enrolled courses
export const getMyResults = asyncHandler(async (req: Request, res: Response) => {
    const studentId = (req as any).user.id;

    // Get all approved enrollments for this student
    const enrollments = await Enrollment.find({
        studentId,
        status: 'approved',
    }).select('courseId');

    if (enrollments.length === 0) {
        return res.json({
            success: true,
            count: 0,
            data: [],
            message: 'You are not enrolled in any courses yet',
        });
    }

    // Get results for enrolled courses
    const courseIds = enrollments.map(e => e.courseId);

    const results = await CourseResult.find({
        courseId: { $in: courseIds },
    })
        .populate('courseId', 'title code')
        .populate('teacherId', 'name designation')
        .sort({ uploadedAt: -1 });

    // No additional filtering - show all results for enrolled courses
    // Students see results regardless of session/semester on the result file
    res.json({
        success: true,
        count: results.length,
        data: results,
    });
});

// Teacher: Get results I've uploaded
export const getMyUploadedResults = asyncHandler(async (req: Request, res: Response) => {
    const teacherId = (req as any).user.id;
    const { courseId } = req.query;

    const filter: any = { teacherId };
    if (courseId) filter.courseId = courseId;

    const results = await CourseResult.find(filter)
        .populate('courseId', 'title code')
        .sort({ uploadedAt: -1 });

    res.json({
        success: true,
        count: results.length,
        data: results,
    });
});

// Get results for a specific course (accessible by enrolled students and teacher)
export const getCourseResults = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const userType = (req as any).user.userType || 'student';
    const { courseId } = req.params;
    const { session, semester } = req.query;

    const filter: any = { courseId };
    if (session) filter.session = session;
    if (semester) filter.semester = parseInt(semester as string);

    // If student, check if enrolled
    if (userType === 'student') {
        const enrollment = await Enrollment.findOne({
            studentId: userId,
            courseId,
            status: 'approved',
        });

        if (!enrollment) {
            throw new AppError('You are not enrolled in this course', 403);
        }

        // Filter by student's enrollment session and semester if not specified
        if (!session) filter.session = enrollment.session;
        if (!semester) filter.semester = enrollment.semester;
    }

    const results = await CourseResult.find(filter)
        .populate('teacherId', 'name designation')
        .sort({ uploadedAt: -1 });

    res.json({
        success: true,
        count: results.length,
        data: results,
    });
});

// Delete a result file (teacher only)
export const deleteResult = asyncHandler(async (req: Request, res: Response) => {
    const teacherId = (req as any).user.id;
    const { id } = req.params;

    const result = await CourseResult.findById(id);

    if (!result) {
        throw new AppError('Result not found', 404);
    }

    if (result.teacherId.toString() !== teacherId) {
        throw new AppError('You are not authorized to delete this result', 403);
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '../../uploads', result.fileName);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }

    await result.deleteOne();

    res.json({
        success: true,
        message: 'Result deleted successfully',
    });
});
