import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { validationResult } from 'express-validator';
import Student from '../models/Student';
import StudentRegistration from '../models/StudentRegistration';
import { config } from '../config/env';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { sendVerificationEmail } from '../utils/emailService';


const generateToken = (id: string): string => {
    return jwt.sign({ id }, config.jwtSecret, {
        expiresIn: config.jwtExpire,
    } as jwt.SignOptions);
};




export const registerStudent = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
    }

    const { registrationId, name, email, password, session, batch } = req.body;


    const regEntry = await StudentRegistration.findOne({ registrationId, isUsed: false });
    if (!regEntry) {
        throw new AppError('Invalid or already used registration ID', 400);
    }


    if (regEntry.session !== session || regEntry.batch !== batch) {
        throw new AppError('Registration ID does not match provided session/batch', 400);
    }


    const studentExists = await Student.findOne({ $or: [{ email }, { registrationId }] });
    if (studentExists) {
        throw new AppError('Student with this email or registration ID already exists', 400);
    }


    const verificationToken = uuidv4();


    const student = await Student.create({
        registrationId,
        name,
        email,
        password,
        session,
        batch,
        isVerified: false,
        verificationToken,
    });

    // Mark registration as used
    regEntry.isUsed = true;
    await regEntry.save();

    // Try to send verification email, but don't fail registration if it fails
    try {
        await sendVerificationEmail(email, name, verificationToken);
    } catch (emailError) {
        console.error('Failed to send verification email, but registration succeeded:', emailError);
        // Continue despite email failure
    }

    res.status(201).json({
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
        data: {
            id: student._id,
            name: student.name,
            email: student.email,
            registrationId: student.registrationId,
        },
    });
});




export const loginStudent = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
    }

    const { email, password } = req.body;


    const student = await Student.findOne({ email }).select('+password');
    if (!student) {
        throw new AppError('Invalid credentials', 401);
    }

    // Skip email verification for development (SMTP not configured)
    // if (!student.isVerified) {
    //     throw new AppError('Please verify your email before logging in', 401);
    // }


    const isMatch = await student.comparePassword(password);
    if (!isMatch) {
        throw new AppError('Invalid credentials', 401);
    }

    res.json({
        success: true,
        data: {
            id: student._id,
            name: student.name,
            email: student.email,
            registrationId: student.registrationId,
            session: student.session,
            batch: student.batch,
            userType: 'student',
            token: generateToken(student._id.toString()),
        },
    });
});




export const getStudentProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const student = await Student.findById(userId).populate('advisorId', 'name designation');

    if (!student) {
        throw new AppError('Student not found', 404);
    }

    res.json({
        success: true,
        data: student,
    });
});




export const updateStudentProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { name, phone, photo, profileImage } = req.body;

    // Allow updating: name, phone, photo/profileImage
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;

    // Map 'photo' or 'profileImage' from request to 'profileImage' in database
    if (photo !== undefined) updateData.profileImage = photo;
    if (profileImage !== undefined) updateData.profileImage = profileImage;

    const student = await Student.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
    );

    if (!student) {
        throw new AppError('Student not found', 404);
    }

    // Add userType to match login response structure
    const responseData = {
        ...student.toObject(),
        userType: 'student'
    };

    res.json({
        success: true,
        data: responseData,
    });
});
