import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Contact from '../models/Contact';
import { asyncHandler, AppError } from '../middleware/errorHandler';




export const submitContact = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
    }

    const contact = await Contact.create(req.body);

    res.status(201).json({
        success: true,
        message: 'Your message has been sent successfully',
        data: contact,
    });
});




export const getContacts = asyncHandler(async (req: Request, res: Response) => {
    const { isRead } = req.query;

    const query = isRead !== undefined ? { isRead: isRead === 'true' } : {};
    const contacts = await Contact.find(query).sort({ createdAt: -1 });

    res.json({
        success: true,
        count: contacts.length,
        data: contacts,
    });
});




export const getContactById = asyncHandler(async (req: Request, res: Response) => {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
        throw new AppError('Contact submission not found', 404);
    }

    res.json({
        success: true,
        data: contact,
    });
});




export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const contact = await Contact.findByIdAndUpdate(
        req.params.id,
        { isRead: true },
        { new: true }
    );

    if (!contact) {
        throw new AppError('Contact submission not found', 404);
    }

    res.json({
        success: true,
        data: contact,
    });
});




export const deleteContact = asyncHandler(async (req: Request, res: Response) => {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
        throw new AppError('Contact submission not found', 404);
    }

    res.json({
        success: true,
        data: {},
    });
});
