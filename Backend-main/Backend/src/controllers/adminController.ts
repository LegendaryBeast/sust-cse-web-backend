import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import StudentRegistration from '../models/StudentRegistration';
import { asyncHandler, AppError } from '../middleware/errorHandler';




export const uploadRegistrations = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
    }

    const { registrations } = req.body; 
    const uploadedBy = (req as any).user.id;

    if (!Array.isArray(registrations) || registrations.length === 0) {
        throw new AppError('Please provide an array of registrations', 400);
    }

    
    const registrationsWithUploader = registrations.map(reg => ({
        ...reg,
        uploadedBy,
    }));

    
    try {
        const inserted = await StudentRegistration.insertMany(registrationsWithUploader, {
            ordered: false,
        });

        res.status(201).json({
            success: true,
            message: `Successfully uploaded ${inserted.length} registration IDs`,
            data: {
                uploaded: inserted.length,
                total: registrations.length,
            },
        });
    } catch (error: any) {
        
        if (error.code === 11000) {
            const insertedCount = error.insertedDocs?.length || 0;
            res.status(201).json({
                success: true,
                message: `Successfully uploaded ${insertedCount} registration IDs (${registrations.length - insertedCount} duplicates skipped)`,
                data: {
                    uploaded: insertedCount,
                    total: registrations.length,
                    skipped: registrations.length - insertedCount,
                },
            });
        } else {
            throw error;
        }
    }
});




export const getRegistrations = asyncHandler(async (req: Request, res: Response) => {
    const { isUsed, session, batch } = req.query;

    const filter: any = {};
    if (isUsed !== undefined) filter.isUsed = isUsed === 'true';
    if (session) filter.session = session;
    if (batch) filter.batch = parseInt(batch as string);

    const registrations = await StudentRegistration.find(filter)
        .populate('uploadedBy', 'username email')
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        count: registrations.length,
        data: registrations,
    });
});




export const deleteRegistration = asyncHandler(async (req: Request, res: Response) => {
    const registration = await StudentRegistration.findById(req.params.id);

    if (!registration) {
        throw new AppError('Registration not found', 404);
    }

    if (registration.isUsed) {
        throw new AppError('Cannot delete a registration that has been used', 400);
    }

    await registration.deleteOne();

    res.json({
        success: true,
        message: 'Registration deleted successfully',
    });
});
