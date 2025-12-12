import { Request, Response } from 'express';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import Student from '../models/Student';
import Teacher from '../models/Teacher';




export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params;


    let student = await Student.findOne({ verificationToken: token }).select('+verificationToken');

    if (student) {
        if (student.isVerified) {
            throw new AppError('Email already verified', 400);
        }

        student.isVerified = true;
        student.verificationToken = undefined;
        await student.save();

        return res.json({
            success: true,
            message: 'Email verified successfully! You can now log in.',
            userType: 'student',
        });
    }


    let teacher = await Teacher.findOne({ verificationToken: token }).select('+verificationToken');

    if (teacher) {
        if (teacher.isVerified) {
            throw new AppError('Email already verified', 400);
        }

        teacher.isVerified = true;
        teacher.verificationToken = undefined;
        await teacher.save();

        const message = teacher.isApproved
            ? 'Email verified successfully! You can now log in.'
            : 'Email verified successfully! Your account is pending admin approval.';

        return res.json({
            success: true,
            message,
            userType: 'teacher',
            requiresApproval: !teacher.isApproved,
        });
    }

    throw new AppError('Invalid or expired verification token', 400);
});
