import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import News from '../models/News';
import { asyncHandler, AppError } from '../middleware/errorHandler';




export const getNews = asyncHandler(async (_req: Request, res: Response) => {
    const news = await News.find({ isActive: true }).sort({ order: 1, createdAt: -1 });

    res.json({
        success: true,
        count: news.length,
        data: news,
    });
});




export const getAllNews = asyncHandler(async (_req: Request, res: Response) => {
    const news = await News.find().sort({ order: 1, createdAt: -1 });

    res.json({
        success: true,
        count: news.length,
        data: news,
    });
});




export const getNewsById = asyncHandler(async (req: Request, res: Response) => {
    const news = await News.findById(req.params.id);

    if (!news) {
        throw new AppError('News item not found', 404);
    }

    res.json({
        success: true,
        data: news,
    });
});




export const createNews = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
    }

    const news = await News.create(req.body);

    res.status(201).json({
        success: true,
        data: news,
    });
});




export const updateNews = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
    }

    const news = await News.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!news) {
        throw new AppError('News item not found', 404);
    }

    res.json({
        success: true,
        data: news,
    });
});




export const deleteNews = asyncHandler(async (req: Request, res: Response) => {
    const news = await News.findByIdAndDelete(req.params.id);

    if (!news) {
        throw new AppError('News item not found', 404);
    }

    res.json({
        success: true,
        data: {},
    });
});
