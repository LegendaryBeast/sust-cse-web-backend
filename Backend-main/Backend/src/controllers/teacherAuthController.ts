import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { validationResult } from 'express-validator';
import Teacher from '../models/Teacher';
import { config } from '../config/env';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { sendVerificationEmail, sendTeacherApprovalEmail } from '../utils/emailService';

const generateToken = (id: string): string => {
    return jwt.sign({ id }, config.jwtSecret, {
        expiresIn: config.jwtExpire,
    } as jwt.SignOptions);
};

export const registerTeacher = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
    }

    const { employeeId, name, email, password, designation, phone, education, research } = req.body;

    const teacherExists = await Teacher.findOne({ $or: [{ email }, { employeeId }] });
    if (teacherExists) {
        throw new AppError('Teacher with this email or employee ID already exists', 400);
    }

    const verificationToken = uuidv4();

    const teacher = await Teacher.create({
        employeeId,
        name,
        email,
        password,
        designation,
        phone,
        education: education || [],
        research: research || [],
        isApproved: false,
        isVerified: false,
        verificationToken,
    });


    try {
        await sendVerificationEmail(email, name, verificationToken);
    } catch (emailError) {
        console.error('Failed to send verification email, but registration succeeded:', emailError);
    }

    res.status(201).json({
        success: true,
        message: 'Registration successful! Please check your email to verify your account. Admin approval is also required before you can log in.',
        data: {
            id: teacher._id,
            name: teacher.name,
            email: teacher.email,
            employeeId: teacher.employeeId,
        },
    });
});

export const loginTeacher = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
    }

    const { email, password } = req.body;

    const teacher = await Teacher.findOne({ email }).select('+password');
    if (!teacher) {
        throw new AppError('Invalid credentials', 401);
    }


    // if (!teacher.isVerified) {
    //     throw new AppError('Please verify your email before logging in', 401);
    // }


    if (!teacher.isApproved) {
        throw new AppError('Your account is pending admin approval', 401);
    }

    const isMatch = await teacher.comparePassword(password);
    if (!isMatch) {
        throw new AppError('Invalid credentials', 401);
    }

    res.json({
        success: true,
        data: {
            id: teacher._id,
            name: teacher.name,
            email: teacher.email,
            employeeId: teacher.employeeId,
            designation: teacher.designation,
            userType: 'teacher',
            token: generateToken(teacher._id.toString()),
        },
    });
});

export const getTeacherProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const teacher = await Teacher.findById(userId);

    if (!teacher) {
        throw new AppError('Teacher not found', 404);
    }

    res.json({
        success: true,
        data: teacher,
    });
});

export const updateTeacherProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { name, designation, phone, officeRoom, photo, profileImage, research, education } = req.body;

    // Allow updating: name, designation, phone, officeRoom, photo/profileImage, research, education
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (designation !== undefined) updateData.designation = designation;
    if (phone !== undefined) updateData.phone = phone;
    if (officeRoom !== undefined) updateData.officeRoom = officeRoom;

    // Map 'photo' or 'profileImage' from request to 'profileImage' in database
    if (photo !== undefined) updateData.profileImage = photo;
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    if (research !== undefined) updateData.research = research;
    if (education !== undefined) updateData.education = education;

    const teacher = await Teacher.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
    );

    if (!teacher) {
        throw new AppError('Teacher not found', 404);
    }

    // Add userType to match login response structure
    const responseData = {
        ...teacher.toObject(),
        userType: 'teacher'
    };

    res.json({
        success: true,
        data: responseData,
    });
});

export const getPendingTeachers = asyncHandler(async (_req: Request, res: Response) => {
    // Get all teachers waiting for approval, regardless of verification status
    // since email verification is now bypassed
    const teachers = await Teacher.find({ isApproved: false }).sort({ createdAt: -1 });

    res.json({
        success: true,
        count: teachers.length,
        data: teachers,
    });
});

export const getApprovedTeachers = asyncHandler(async (_req: Request, res: Response) => {
    // Get all approved teachers, verification status is no longer relevant
    const teachers = await Teacher.find({ isApproved: true }).sort({ createdAt: -1 });

    res.json({
        success: true,
        count: teachers.length,
        data: teachers,
    });
});

export const approveTeacher = asyncHandler(async (req: Request, res: Response) => {
    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
        throw new AppError('Teacher not found', 404);
    }

    if (teacher.isApproved) {
        throw new AppError('Teacher is already approved', 400);
    }

    teacher.isApproved = true;
    await teacher.save();

    try {
        await sendTeacherApprovalEmail(teacher.email, teacher.name);
    } catch (emailError) {
        console.error('Failed to send approval email:', emailError);
    }

    res.json({
        success: true,
        message: 'Teacher approved successfully',
        data: teacher,
    });
});

export const createTeacherByAdmin = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
    }

    const { employeeId, name, email, password, designation, phone, education, research, department } = req.body;

    const teacherExists = await Teacher.findOne({ $or: [{ email }, { employeeId }] });
    if (teacherExists) {
        throw new AppError('Teacher with this email or employee ID already exists', 400);
    }

    // Map department codes to full names
    const departmentMap: { [key: string]: string } = {
        'CSE': 'Computer Science and Engineering',
        'EEE': 'Electrical and Electronic Engineering',
        'CE': 'Civil Engineering',
        'ME': 'Mechanical Engineering',
    };

    const fullDepartmentName = departmentMap[department] || department || 'Computer Science and Engineering';

    const teacher = await Teacher.create({
        employeeId,
        name,
        email,
        password: password || 'Password@123',
        designation,
        department: fullDepartmentName,
        phone: phone || '',
        education: education || [],
        research: research || [],
        isApproved: true,
        isVerified: true,
    });

    res.status(201).json({
        success: true,
        message: 'Teacher created successfully',
        data: {
            id: teacher._id,
            name: teacher.name,
            email: teacher.email,
            employeeId: teacher.employeeId,
        },
    });
});
