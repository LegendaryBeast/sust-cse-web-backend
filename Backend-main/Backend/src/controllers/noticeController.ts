import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Notice from '../models/Notice';
import Student from '../models/Student';
import Teacher from '../models/Teacher';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { sendNoticeEmail } from '../utils/emailService';




export const createNotice = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
    }

    const { title, content, type, targetType, targetCourseId, targetStudentRegistration, attachments } = req.body;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;

    const postedByModel = userRole === 'teacher' ? 'Teacher' : 'User';

    // Validate and prepare notice data
    const noticeData: any = {
        title,
        content,
        type,
        targetType: targetType || 'all',
        attachments: attachments || [],
        postedBy: userId,
        postedByModel,
    };

    // Handle course targeting
    if (targetType === 'course') {
        if (!targetCourseId) {
            throw new AppError('Please select a course for course-specific notices', 400);
        }

        // If teacher, verify they teach this course
        if (userRole === 'teacher') {
            const Course = (await import('../models/Course')).default;
            const course = await Course.findById(targetCourseId);
            if (!course) {
                throw new AppError('Course not found', 404);
            }
            if (course.teacherId?.toString() !== userId) {
                throw new AppError('You can only send notices for courses you teach', 403);
            }
        }

        noticeData.targetCourseId = targetCourseId;
    }

    // Handle individual student targeting
    if (targetType === 'student') {
        if (!targetStudentRegistration) {
            throw new AppError('Please enter student registration number', 400);
        }

        const student = await Student.findOne({ registrationId: targetStudentRegistration, isVerified: true });
        if (!student) {
            throw new AppError('Student not found with this registration number', 404);
        }

        noticeData.targetStudentId = student._id;
    }

    const notice = await Notice.create(noticeData);

    // Send email notifications
    try {
        let recipients: string[] = [];

        if (targetType === 'all') {
            const students = await Student.find({ isVerified: true }).select('email');
            recipients = students.map(s => s.email);
        } else if (targetType === 'course' && targetCourseId) {
            // Get students enrolled in this course
            const Enrollment = (await import('../models/Enrollment')).default;
            const enrollments = await Enrollment.find({
                courseId: targetCourseId,
                status: 'approved',
            }).populate('studentId', 'email');
            recipients = enrollments.map((e: any) => e.studentId?.email).filter(Boolean);
        } else if (targetType === 'student' && noticeData.targetStudentId) {
            const student = await Student.findById(noticeData.targetStudentId).select('email');
            if (student) recipients = [student.email];
        }

        if (recipients.length > 0) {
            sendNoticeEmail(recipients, title, content, notice._id.toString()).catch(err => {
                console.error('Error sending notice email:', err);
            });
        }
    } catch (emailError) {
        console.error('Error preparing notice emails:', emailError);
    }

    const populatedNotice = await Notice.findById(notice._id)
        .populate('postedBy', 'name username email')
        .populate('targetCourseId', 'code title')
        .populate('targetStudentId', 'name registrationId');

    res.status(201).json({
        success: true,
        message: 'Notice created and email notifications sent',
        data: populatedNotice,
    });
});




export const getNotices = asyncHandler(async (req: Request, res: Response) => {
    const { type } = req.query;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    const filter: any = { isActive: true };

    if (type) filter.type = type;

    // For students, filter based on enrollment
    if (userRole === 'student' && userId) {
        const Enrollment = (await import('../models/Enrollment')).default;

        // Get student's approved enrollments
        const enrollments = await Enrollment.find({
            studentId: userId,
            status: 'approved',
        }).select('courseId');

        const enrolledCourseIds = enrollments.map(e => e.courseId);

        // Build OR conditions for notices student should see:
        const orConditions: any[] = [
            { targetType: 'all' }, // All students
            { targetType: 'student', targetStudentId: userId }, // Individual notices to this student
        ];

        // Add course-specific notices for enrolled courses
        if (enrolledCourseIds.length > 0) {
            orConditions.push({
                targetType: 'course',
                targetCourseId: { $in: enrolledCourseIds },
            });
        }

        filter.$or = orConditions;
    }

    const notices = await Notice.find(filter)
        .populate('postedBy', 'name username email')
        .populate('targetCourseId', 'code title')
        .populate('targetStudentId', 'name registrationId')
        .sort({ createdAt: -1 })
        .limit(50);

    res.json({
        success: true,
        count: notices.length,
        data: notices,
    });
});




export const getNoticeById = asyncHandler(async (req: Request, res: Response) => {
    const notice = await Notice.findById(req.params.id)
        .populate('postedBy', 'name username email designation');

    if (!notice) {
        throw new AppError('Notice not found', 404);
    }

    res.json({
        success: true,
        data: notice,
    });
});




export const updateNotice = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
    }

    const notice = await Notice.findById(req.params.id);

    if (!notice) {
        throw new AppError('Notice not found', 404);
    }

    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;

    // Authorization check
    if (userRole !== 'admin' && userRole !== 'superadmin' && notice.postedBy.toString() !== userId) {
        throw new AppError('Not authorized to update this notice', 403);
    }

    const { title, content, type, targetType, targetCourseId, targetStudentId, attachments, isActive } = req.body;

    notice.title = title || notice.title;
    notice.content = content || notice.content;
    notice.type = type || notice.type;
    notice.targetType = targetType || notice.targetType;
    notice.targetCourseId = targetCourseId;
    notice.targetStudentId = targetStudentId;
    if (attachments !== undefined) notice.attachments = attachments;
    if (isActive !== undefined) notice.isActive = isActive;

    await notice.save();

    const updatedNotice = await Notice.findById(notice._id)
        .populate('postedBy', 'name username email')
        .populate('targetCourseId', 'code title')
        .populate('targetStudentId', 'name registrationId');

    res.json({
        success: true,
        message: 'Notice updated successfully',
        data: updatedNotice,
    });
});




export const deleteNotice = asyncHandler(async (req: Request, res: Response) => {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
        throw new AppError('Notice not found', 404);
    }

    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;


    if (userRole !== 'admin' && userRole !== 'superadmin' && notice.postedBy.toString() !== userId) {
        throw new AppError('Not authorized to delete this notice', 403);
    }

    await notice.deleteOne();

    res.json({
        success: true,
        message: 'Notice deleted successfully',
    });
});




export const uploadAttachments = asyncHandler(async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
        throw new AppError('Please upload at least one file', 400);
    }

    const attachmentPaths = files.map(file => `/uploads/notices/${file.filename}`);

    res.json({
        success: true,
        message: `${files.length} file(s) uploaded successfully`,
        data: {
            attachments: attachmentPaths,
        },
    });
});
