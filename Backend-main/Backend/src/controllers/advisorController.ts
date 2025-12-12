import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Advisor from '../models/Advisor';
import Student from '../models/Student';
import Teacher from '../models/Teacher';
import Faculty from '../models/Faculty';
import { asyncHandler, AppError } from '../middleware/errorHandler';




export const assignAdvisor = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
    }

    const { teacherId, session, batch } = req.body;
    const assignedBy = (req as any).user.id;
    // Check both Teacher and Faculty models since they are merged
    let teacher = await Teacher.findById(teacherId);
    let isFaculty = false;

    if (!teacher) {
        // If not found in Teacher, check Faculty model
        const faculty = await Faculty.findById(teacherId);
        if (faculty) {
            // Faculty found, use it as teacher
            teacher = faculty as any; // Type coercion for compatibility
            isFaculty = true;
        }
    }

    if (!teacher) {
        throw new AppError('Teacher not found', 404);
    }

    // Only check isApproved if it's from Teacher model (Faculty doesn't have this field)
    if (!isFaculty && !(teacher as any).isApproved) {
        throw new AppError('Teacher must be approved before being assigned as advisor', 400);
    }


    const existingAdvisor = await Advisor.findOne({ session, batch, isActive: true });
    if (existingAdvisor) {
        throw new AppError(`An advisor is already assigned to ${session} Batch ${batch}`, 400);
    }

    const advisor = await Advisor.create({
        teacherId,
        session,
        batch,
        assignedBy,
    });


    await Student.updateMany(
        { session, batch },
        { advisorId: teacherId }
    );

    const populatedAdvisor = await Advisor.findById(advisor._id)
        .populate('teacherId', 'name employeeId designation email')
        .populate('assignedBy', 'username email');

    res.status(201).json({
        success: true,
        message: 'Advisor assigned successfully',
        data: populatedAdvisor,
    });
});




export const getAdvisors = asyncHandler(async (_req: Request, res: Response) => {
    const advisors = await Advisor.find({ isActive: true })
        .populate('teacherId', 'name employeeId designation email')
        .populate('assignedBy', 'username email')
        .sort({ session: -1, batch: 1 });

    res.json({
        success: true,
        count: advisors.length,
        data: advisors,
    });
});




export const getMyStudents = asyncHandler(async (req: Request, res: Response) => {
    const teacherId = (req as any).user.id;


    const advisorAssignments = await Advisor.find({ teacherId, isActive: true });

    if (advisorAssignments.length === 0) {
        res.json({
            success: true,
            message: 'No advisor assignments found',
            data: [],
        });
        return;
    }


    const students = await Student.find({ advisorId: teacherId })
        .select('-password -verificationToken')
        .sort({ session: -1, batch: 1, registrationId: 1 });

    res.json({
        success: true,
        count: students.length,
        data: {
            assignments: advisorAssignments,
            students,
        },
    });
});




export const getMyAdvisor = asyncHandler(async (req: Request, res: Response) => {
    const studentId = (req as any).user.id;

    const student = await Student.findById(studentId).populate('advisorId', 'name employeeId designation email phone research');

    if (!student) {
        throw new AppError('Student not found', 404);
    }

    if (!student.advisorId) {
        res.json({
            success: true,
            message: 'No advisor assigned yet',
            data: null,
        });
        return;
    }

    res.json({
        success: true,
        data: student.advisorId,
    });
});




export const removeAdvisor = asyncHandler(async (req: Request, res: Response) => {
    const advisor = await Advisor.findById(req.params.id);

    if (!advisor) {
        throw new AppError('Advisor not found', 404);
    }


    advisor.isActive = false;
    await advisor.save();


    await Student.updateMany(
        { advisorId: advisor.teacherId, session: advisor.session, batch: advisor.batch },
        { $unset: { advisorId: 1 } }
    );

    res.json({
        success: true,
        message: 'Advisor removed successfully',
    });
});
