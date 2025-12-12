import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { config } from '../config/env';


const createUploadDirs = () => {
    const dirs = [
        './uploads',
        './uploads/profiles',
        './uploads/notices',
        './uploads/results',
        './uploads/banners',
        './uploads/admissions',
        './uploads/societies',
    ];

    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
};

createUploadDirs();


const imageStorage = multer.diskStorage({
    destination: (_req: Request, _file: Express.Multer.File, cb) => {
        cb(null, path.join(config.uploadPath, 'profiles'));
    },
    filename: (_req: Request, file: Express.Multer.File, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'image-' + uniqueSuffix + path.extname(file.originalname));
    },
});


const pdfStorage = multer.diskStorage({
    destination: (req: Request, _file: Express.Multer.File, cb) => {

        const uploadType = (req as any).uploadType || 'notices';
        cb(null, path.join(config.uploadPath, uploadType));
    },
    filename: (_req: Request, file: Express.Multer.File, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'document-' + uniqueSuffix + path.extname(file.originalname));
    },
});


const imageFileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
};


const documentFileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = /pdf|doc|docx|xlsx|xls/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /pdf|msword|vnd.openxmlformats|vnd.ms-excel/.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only document files are allowed (pdf, doc, docx, xlsx, xls)'));
    }
};


export const upload = multer({
    storage: imageStorage,
    limits: {
        fileSize: config.maxFileSize,
    },
    fileFilter: imageFileFilter,
});


export const uploadDocument = multer({
    storage: pdfStorage,
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
    fileFilter: documentFileFilter,
});


export const uploadNoticeAttachments = multer({
    storage: pdfStorage,
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 5,
    },
    fileFilter: documentFileFilter,
});

// Memory storage for Cloudinary uploads
export const uploadToMemory = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: config.maxFileSize,
    },
    fileFilter: imageFileFilter,
});

