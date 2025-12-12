import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: (process.env.PORT && process.env.PORT !== '5000') ? process.env.PORT : 5001,
    nodeEnv: process.env.NODE_ENV || 'development',
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/sust-cse-db',
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtExpire: process.env.JWT_EXPIRE || '7d',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'),
    uploadPath: process.env.UPLOAD_PATH || './uploads',


    smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
    smtpPort: parseInt(process.env.SMTP_PORT || '587'),
    smtpUser: process.env.SMTP_USER || 'your-email@gmail.com',
    smtpPass: process.env.SMTP_PASS || 'your-app-password',
    emailFrom: process.env.EMAIL_FROM || 'noreply@sust.edu',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

    // Cloudinary Configuration
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',
};
