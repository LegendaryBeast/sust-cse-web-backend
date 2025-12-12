import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';
import { asyncHandler, AppError } from '../middleware/errorHandler';

interface CloudinaryUploadResult {
    secure_url: string;
    public_id: string;
    [key: string]: any;
}

// Upload image to Cloudinary
export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
        throw new AppError('No file uploaded', 400);
    }

    try {
        // Convert buffer to base64
        const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(fileStr, {
            folder: 'sust-cse/profiles',
            resource_type: 'image',
            transformation: [
                { width: 500, height: 500, crop: 'fill', gravity: 'face' },
                { quality: 'auto', fetch_format: 'auto' }
            ]
        }) as CloudinaryUploadResult;

        res.json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                url: result.secure_url,
                publicId: result.public_id
            }
        });
    } catch (error: any) {
        console.error('Cloudinary upload error:', error);
        throw new AppError('Failed to upload image', 500);
    }
});

// Delete image from Cloudinary
export const deleteImage = asyncHandler(async (req: Request, res: Response) => {
    const { publicId } = req.body;

    if (!publicId) {
        throw new AppError('Public ID is required', 400);
    }

    try {
        await cloudinary.uploader.destroy(publicId);
        res.json({
            success: true,
            message: 'Image deleted successfully'
        });
    } catch (error: any) {
        console.error('Cloudinary delete error:', error);
        throw new AppError('Failed to delete image', 500);
    }
});
