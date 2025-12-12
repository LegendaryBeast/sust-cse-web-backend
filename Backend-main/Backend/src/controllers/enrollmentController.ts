import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Enrollment from '../models/Enrollment';
import Course from '../models/Course';
import { asyncHandler, AppError } from '../middleware/errorHandler';

// Student: Request enrollment in a course
export const requestEnrollment = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
    }

    const studentId = (req as any).user.id;
    const { courseId, semester, session } = req.body;

    // Check if course exists and enrollment is open
    const course = await Course.findById(courseId);
    if (!course) {
        throw new AppError('Course not found', 404);
    }

    if (!course.isEnrollmentOpen) {
        throw new AppError('Enrollment is closed for this course', 400);
    }

    if (!course.teacherId) {
        throw new AppError('No teacher assigned to this course yet', 400);
    }

    // Check if already requested or enrolled
    const existing = await Enrollment.findOne({
        studentId,
        courseId,
        session,
        semester,
    });

    if (existing) {
        if (existing.status === 'pending') {
            throw new AppError('You have already requested enrollment for this course', 400);
        }
        if (existing.status === 'approved') {
            throw new AppError('You are already enrolled in this course', 400);
        }
        // If rejected, allow new request
        existing.status = 'pending';
        existing.requestedAt = new Date();
        await existing.save();

        return res.json({
            success: true,
            message: 'Enrollment request resubmitted successfully',
            data: existing,
        });
    }

    // Create new enrollment request
    const enrollment = await Enrollment.create({
        studentId,
        courseId,
        teacherId: course.teacherId,
        semester,
        session,
        status: 'pending',
    });

    res.status(201).json({
        success: true,
        message: 'Enrollment request submitted successfully',
        data: enrollment,
    });
});

// Student: Get my enrollment requests/courses
export const getMyEnrollments = asyncHandler(async (req: Request, res: Response) => {
    const studentId = (req as any).user.id;
    const { status } = req.query;

    const filter: any = { studentId };
    if (status) filter.status = status;

    const enrollments = await Enrollment.find(filter)
        .populate('courseId', 'title code credits semester session')
        .populate('teacherId', 'name email designation')
        .sort({ requestedAt: -1 });

    res.json({
        success: true,
        count: enrollments.length,
        data: enrollments,
    });
});

// Teacher: Get enrollment requests for my courses
// Teacher: Get enrollment requests for my courses
export const getEnrollmentRequests = asyncHandler(async (req: Request, res: Response) => {
    const teacherId = (req as any).user.id;
    const { status, courseId } = req.query;

    console.log('XXX DEBUG: getEnrollmentRequests called');
    console.log('XXX DEBUG: Teacher ID from token:', teacherId);
    console.log('XXX DEBUG: Query params:', { status, courseId });

    // Explicitly cast to ObjectId just in case, though mongoose usually handles it
    const mongoose = require('mongoose');
    const teacherObjectId = new mongoose.Types.ObjectId(teacherId);

    const filter: any = { teacherId: teacherObjectId };

    // Also try matching by string just in case mixed types exist (legacy data)
    // const filter: any = { 
    //    $or: [
    //      { teacherId: teacherObjectId },
    //      { teacherId: teacherId }
    //    ]
    // };
    // Stick to ObjectId for now as correct schema enforcement

    if (status) filter.status = status;
    if (courseId) filter.courseId = courseId;

    console.log('XXX DEBUG: Filter object:', JSON.stringify(filter));

    // Check count first
    const count = await Enrollment.countDocuments(filter);
    console.log('XXX DEBUG: Found document count:', count);

    const requests = await Enrollment.find(filter)
        .populate('studentId', 'name registrationId email session batch')
        .populate('courseId', 'title code')
        .sort({ requestedAt: -1 });

    console.log('XXX DEBUG: Retrieved requests length:', requests.length);
    if (requests.length > 0) {
        console.log('XXX DEBUG: First request sample:', JSON.stringify(requests[0]));
    }

    res.json({
        success: true,
        count: requests.length,
        data: requests,
    });
});

// Teacher: Approve enrollment request
export const approveEnrollment = asyncHandler(async (req: Request, res: Response) => {
    const teacherId = (req as any).user.id;
    const { id } = req.params;

    const enrollment = await Enrollment.findById(id);

    if (!enrollment) {
        throw new AppError('Enrollment request not found', 404);
    }

    if (enrollment.teacherId.toString() !== teacherId) {
        throw new AppError('You are not authorized to approve this enrollment', 403);
    }

    if (enrollment.status !== 'pending') {
        throw new AppError('This enrollment request has already been processed', 400);
    }

    enrollment.status = 'approved';
    enrollment.approvedAt = new Date();
    await enrollment.save();

    res.json({
        success: true,
        message: 'Enrollment approved successfully',
        data: enrollment,
    });
});

// Teacher: Reject enrollment request
export const rejectEnrollment = asyncHandler(async (req: Request, res: Response) => {
    const teacherId = (req as any).user.id;
    const { id } = req.params;

    const enrollment = await Enrollment.findById(id);

    if (!enrollment) {
        throw new AppError('Enrollment request not found', 404);
    }

    if (enrollment.teacherId.toString() !== teacherId) {
        throw new AppError('You are not authorized to reject this enrollment', 403);
    }

    if (enrollment.status !== 'pending') {
        throw new AppError('This enrollment request has already been processed', 400);
    }

    enrollment.status = 'rejected';
    enrollment.rejectedAt = new Date();
    await enrollment.save();

    res.json({
        success: true,
        message: 'Enrollment rejected',
        data: enrollment,
    });
});

// Get enrolled students for a course (for teacher)
export const getEnrolledStudents = asyncHandler(async (req: Request, res: Response) => {
    const teacherId = (req as any).user.id;
    const { courseId } = req.params;

    // Verify teacher owns this course
    const course = await Course.findOne({ _id: courseId, teacherId });
    if (!course) {
        throw new AppError('Course not found or you are not the teacher', 403);
    }

    const enrollments = await Enrollment.find({
        courseId,
        status: 'approved',
    })
        .populate('studentId', 'name registrationId email session batch')
        .sort({ approvedAt: -1 });

    res.json({
        success: true,
        count: enrollments.length,
        data: enrollments,
    });
});
