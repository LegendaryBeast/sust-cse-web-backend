import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Banner from '../models/Banner';
import { asyncHandler, AppError } from '../middleware/errorHandler';




export const createBanner = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
    }

    const { title, description, image, type, link, startDate, endDate, priority } = req.body;
    const uploadedBy = (req as any).user.id;

    const banner = await Banner.create({
        title,
        description,
        image,
        type,
        link,
        startDate,
        endDate,
        priority: priority || 0,
        uploadedBy,
    });

    res.status(201).json({
        success: true,
        message: 'Banner created successfully',
        data: banner,
    });
});




export const getBanners = asyncHandler(async (_req: Request, res: Response) => {
    const currentDate = new Date();

    const banners = await Banner.find({
        isActive: true,
        startDate: { $lte: currentDate },
        endDate: { $gte: currentDate },
    })
        .sort({ priority: -1, startDate: -1 })
        .limit(10);

    res.json({
        success: true,
        count: banners.length,
        data: banners,
    });
});




export const getAllBanners = asyncHandler(async (_req: Request, res: Response) => {
    const banners = await Banner.find()
        .populate('uploadedBy', 'username email')
        .sort({ priority: -1, createdAt: -1 });

    res.json({
        success: true,
        count: banners.length,
        data: banners,
    });
});




export const getBannerById = asyncHandler(async (req: Request, res: Response) => {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
        throw new AppError('Banner not found', 404);
    }

    res.json({
        success: true,
        data: banner,
    });
});




export const updateBanner = asyncHandler(async (req: Request, res: Response) => {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
        throw new AppError('Banner not found', 404);
    }

    const { title, description, image, type, link, startDate, endDate, priority, isActive } = req.body;

    banner.title = title || banner.title;
    banner.description = description !== undefined ? description : banner.description;
    banner.image = image || banner.image;
    banner.type = type || banner.type;
    banner.link = link !== undefined ? link : banner.link;
    banner.startDate = startDate || banner.startDate;
    banner.endDate = endDate || banner.endDate;
    banner.priority = priority !== undefined ? priority : banner.priority;
    if (isActive !== undefined) banner.isActive = isActive;

    await banner.save();

    res.json({
        success: true,
        message: 'Banner updated successfully',
        data: banner,
    });
});




export const deleteBanner = asyncHandler(async (req: Request, res: Response) => {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
        throw new AppError('Banner not found', 404);
    }

    await banner.deleteOne();

    res.json({
        success: true,
        message: 'Banner deleted successfully',
    });
});




export const toggleBanner = asyncHandler(async (req: Request, res: Response) => {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
        throw new AppError('Banner not found', 404);
    }

    banner.isActive = !banner.isActive;
    await banner.save();

    res.json({
        success: true,
        message: `Banner ${banner.isActive ? 'activated' : 'deactivated'} successfully`,
        data: banner,
    });
});
