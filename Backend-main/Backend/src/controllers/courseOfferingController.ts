import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import CourseOffering from '../models/CourseOffering';
import Course from '../models/Course';
import Teacher from '../models/Teacher';
import { asyncHandler, AppError } from '../middleware/errorHandler';

// Admin: Create course offering (assign course to teacher)
export const createCourseOffering = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
    }

    const { courseId, teacherId, semester, session, year, maxStudents, startDate, endDate } = req.body;

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
        throw new AppError('Course not found', 404);
    }

    // Verify teacher exists and is approved
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
        throw new AppError('Teacher not found', 404);
    }
    if (!teacher.isApproved) {
        throw new AppError('Teacher is not approved yet', 400);
    }

    // Check if offering already exists
    const existing = await CourseOffering.findOne({
        courseId,
        teacherId,
        semester,
        session,
        year,
    });

    if (existing) {
        throw new AppError('This course is already assigned to this teacher for this semester/session/year', 400);
    }

    // Create course offering
    const offering = await CourseOffering.create({
        courseId,
        teacherId,
        semester,
        session,
        year,
        maxStudents,
        startDate,
        endDate,
        isEnrollmentOpen: true,
        enrolledCount: 0,
    });

    // IMPORTANT: Also update the Course document with teacher and offering details
    // This allows students to see courses when requesting enrollment
    await Course.findByIdAndUpdate(courseId, {
        teacherId,
        semester,
        session,
        isEnrollmentOpen: true,
    });

    const populatedOffering = await CourseOffering.findById(offering._id)
        .populate('courseId', 'code title credits level')
        .populate('teacherId', 'name email designation');

    res.status(201).json({
        success: true,
        message: 'Course assigned to teacher successfully',
        data: populatedOffering,
    });
});

// Admin/Teacher: Get all course offerings
export const getCourseOfferings = asyncHandler(async (req: Request, res: Response) => {
    const { teacherId, semester, session, year, isEnrollmentOpen } = req.query;

    const filter: any = {};
    if (teacherId) filter.teacherId = teacherId;
    if (semester) filter.semester = parseInt(semester as string);
    if (session) filter.session = session;
    if (year) filter.year = year;
    if (isEnrollmentOpen !== undefined) filter.isEnrollmentOpen = isEnrollmentOpen === 'true';

    const offerings = await CourseOffering.find(filter)
        .populate('courseId', 'code title credits level description')
        .populate('teacherId', 'name email designation')
        .sort({ year: -1, semester: -1, createdAt: -1 });

    res.json({
        success: true,
        count: offerings.length,
        data: offerings,
    });
});

// Get course offering by ID
export const getCourseOfferingById = asyncHandler(async (req: Request, res: Response) => {
    const offering = await CourseOffering.findById(req.params.id)
        .populate('courseId', 'code title credits level description')
        .populate('teacherId', 'name email designation');

    if (!offering) {
        throw new AppError('Course offering not found', 404);
    }

    res.json({
        success: true,
        data: offering,
    });
});

// Admin: Update course offering
export const updateCourseOffering = asyncHandler(async (req: Request, res: Response) => {
    const { isEnrollmentOpen, maxStudents, startDate, endDate } = req.body;

    const offering = await CourseOffering.findById(req.params.id);

    if (!offering) {
        throw new AppError('Course offering not found', 404);
    }

    if (isEnrollmentOpen !== undefined) offering.isEnrollmentOpen = isEnrollmentOpen;
    if (maxStudents !== undefined) offering.maxStudents = maxStudents;
    if (startDate !== undefined) offering.startDate = startDate;
    if (endDate !== undefined) offering.endDate = endDate;

    await offering.save();

    const updated = await CourseOffering.findById(offering._id)
        .populate('courseId', 'code title credits level')
        .populate('teacherId', 'name email designation');

    res.json({
        success: true,
        message: 'Course offering updated successfully',
        data: updated,
    });
});

// Admin: Delete course offering
export const deleteCourseOffering = asyncHandler(async (req: Request, res: Response) => {
    const offering = await CourseOffering.findById(req.params.id);

    if (!offering) {
        throw new AppError('Course offering not found', 404);
    }

    // Check if there are enrollments
    const Enrollment = (await import('../models/Enrollment')).default;
    const enrollmentCount = await Enrollment.countDocuments({
        courseId: offering.courseId,
        teacherId: offering.teacherId,
        semester: offering.semester,
        session: offering.session,
    });

    if (enrollmentCount > 0) {
        throw new AppError('Cannot delete course offering with existing enrollments', 400);
    }

    await offering.deleteOne();

    res.json({
        success: true,
        message: 'Course offering deleted successfully',
    });
});

// Teacher: Get my course offerings
export const getMyOfferings = asyncHandler(async (req: Request, res: Response) => {
    const teacherId = (req as any).user.id;
    const mongoose = require('mongoose');
    const teacherObjectId = new mongoose.Types.ObjectId(teacherId);

    const offerings = await CourseOffering.find({ teacherId: teacherObjectId })
        .populate('courseId', 'code title credits level description')
        .sort({ year: -1, semester: -1 });

    res.json({
        success: true,
        count: offerings.length,
        data: offerings,
    });
});
