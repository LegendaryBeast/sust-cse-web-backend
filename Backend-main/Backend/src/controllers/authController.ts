import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User';
import { config } from '../config/env';
import { asyncHandler, AppError } from '../middleware/errorHandler';


const generateToken = (id: string): string => {
    return jwt.sign({ id }, config.jwtSecret, {
        expiresIn: config.jwtExpire,
    } as jwt.SignOptions);
};




export const register = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
    }

    const { username, email, password, role } = req.body;

    
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
        throw new AppError('User already exists', 400);
    }

    
    const user = await User.create({
        username,
        email,
        password,
        role: role || 'admin',
    });

    res.status(201).json({
        success: true,
        data: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            token: generateToken(user._id.toString()),
        },
    });
});




export const login = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
    }

    const { email, password } = req.body;

    
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        throw new AppError('Invalid credentials', 401);
    }

    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new AppError('Invalid credentials', 401);
    }

    res.json({
        success: true,
        data: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            token: generateToken(user._id.toString()),
        },
    });
});




export const getMe = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const user = await User.findById(userId);

    res.json({
        success: true,
        data: user,
    });
});
