import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import User from '../models/User';

interface JwtPayload {
    id: string;
}

export interface AuthRequest extends Request {
    user?: {
        id: string;
        username: string;
        email: string;
        role: string;
    };
}

export const protect = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        let token: string | undefined;

        // Check for token in Authorization header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Not authorized to access this route',
            });
            return;
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

            // Check if user exists (Admin)
            let user = await User.findById(decoded.id).select('-password');
            let userType = 'admin';

            // Check if student
            if (!user) {
                const Student = (await import('../models/Student')).default;
                const student = await Student.findById(decoded.id).select('-password -verificationToken');
                if (student) {
                    user = student as any;
                    userType = 'student';
                }
            }

            // Check if teacher
            if (!user) {
                const Teacher = (await import('../models/Teacher')).default;
                const teacher = await Teacher.findById(decoded.id).select('-password -verificationToken');
                if (teacher) {
                    user = teacher as any;
                    userType = 'teacher';
                }
            }

            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'User not found',
                });
                return;
            }

            // Set user in request
            (req as AuthRequest).user = {
                id: user._id.toString(),
                username: userType === 'admin' ? (user as any).username : (user as any).name,
                email: user.email,
                role: userType === 'admin' ? (user as any).role : userType,
            };

            next();
        } catch (error) {
            res.status(401).json({
                success: false,
                message: 'Not authorized, token failed',
            });
            return;
        }
    } catch (error) {
        next(error);
    }
};


export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const authReq = req as AuthRequest;

        if (!authReq.user) {
            res.status(401).json({
                success: false,
                message: 'Not authorized',
            });
            return;
        }

        if (!roles.includes(authReq.user.role)) {
            res.status(403).json({
                success: false,
                message: `User role '${authReq.user.role}' is not authorized to access this route`,
            });
            return;
        }

        next();
    };
};
