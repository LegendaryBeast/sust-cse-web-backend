import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Society from '../models/Society';
import SocietyMember from '../models/SocietyMember';
import Student from '../models/Student';
import Teacher from '../models/Teacher';
import { asyncHandler, AppError } from '../middleware/errorHandler';




export const createSociety = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
    }

    const { name, description, logo, foundedYear } = req.body;

    const society = await Society.create({
        name,
        description,
        logo,
        foundedYear,
    });

    res.status(201).json({
        success: true,
        message: 'Society created successfully',
        data: society,
    });
});




export const getSocieties = asyncHandler(async (_req: Request, res: Response) => {
    const societies = await Society.find({ isActive: true }).sort({ name: 1 });

    
    const societiesWithCounts = await Promise.all(
        societies.map(async (society) => {
            const memberCount = await SocietyMember.countDocuments({ societyId: society._id });
            return {
                ...society.toObject(),
                memberCount,
            };
        })
    );

    res.json({
        success: true,
        count: societies.length,
        data: societiesWithCounts,
    });
});




export const getSocietyById = asyncHandler(async (req: Request, res: Response) => {
    const society = await Society.findById(req.params.id);

    if (!society) {
        throw new AppError('Society not found', 404);
    }

    
    const members = await SocietyMember.find({ societyId: society._id })
        .populate('userId', 'name email registrationId employeeId')
        .populate('addedBy', 'username email')
        .sort({ joinedDate: 1 });

    res.json({
        success: true,
        data: {
            society,
            members,
        },
    });
});




export const updateSociety = asyncHandler(async (req: Request, res: Response) => {
    const society = await Society.findById(req.params.id);

    if (!society) {
        throw new AppError('Society not found', 404);
    }

    const { name, description, logo, foundedYear, isActive } = req.body;

    society.name = name || society.name;
    society.description = description || society.description;
    society.logo = logo || society.logo;
    society.foundedYear = foundedYear || society.foundedYear;
    if (isActive !== undefined) society.isActive = isActive;

    await society.save();

    res.json({
        success: true,
        message: 'Society updated successfully',
        data: society,
    });
});




export const deleteSociety = asyncHandler(async (req: Request, res: Response) => {
    const society = await Society.findById(req.params.id);

    if (!society) {
        throw new AppError('Society not found', 404);
    }

    
    await SocietyMember.deleteMany({ societyId: society._id });

    await society.deleteOne();

    res.json({
        success: true,
        message: 'Society and all members deleted successfully',
    });
});




export const addMember = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
    }

    const societyId = req.params.id;
    const { userId, userType, role } = req.body;
    const addedBy = (req as any).user.id;

    
    const society = await Society.findById(societyId);
    if (!society) {
        throw new AppError('Society not found', 404);
    }

    
    if (userType === 'Student') {
        const student = await Student.findById(userId);
        if (!student) {
            throw new AppError('Student not found', 404);
        }
    } else if (userType === 'Teacher') {
        const teacher = await Teacher.findById(userId);
        if (!teacher) {
            throw new AppError('Teacher not found', 404);
        }
    } else {
        throw new AppError('Invalid user type', 400);
    }

    
    const existingMember = await SocietyMember.findOne({ societyId, userId, userType });
    if (existingMember) {
        throw new AppError('User is already a member of this society', 400);
    }

    const member = await SocietyMember.create({
        societyId,
        userId,
        userType,
        role: role || 'Member',
        addedBy,
    });

    const populatedMember = await SocietyMember.findById(member._id)
        .populate('userId', 'name email registrationId employeeId')
        .populate('addedBy', 'username email');

    res.status(201).json({
        success: true,
        message: 'Member added successfully',
        data: populatedMember,
    });
});




export const removeMember = asyncHandler(async (req: Request, res: Response) => {
    const { memberId } = req.params;

    const member = await SocietyMember.findById(memberId);

    if (!member) {
        throw new AppError('Member not found', 404);
    }

    await member.deleteOne();

    res.json({
        success: true,
        message: 'Member removed successfully',
    });
});




export const getMySocieties = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;

    const userType = userRole === 'student' ? 'Student' : userRole === 'teacher' ? 'Teacher' : null;

    if (!userType) {
        throw new AppError('Invalid user type', 400);
    }

    const memberships = await SocietyMember.find({ userId, userType })
        .populate('societyId')
        .sort({ joinedDate: -1 });

    res.json({
        success: true,
        count: memberships.length,
        data: memberships,
    });
});
