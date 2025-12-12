import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import path from 'path';
import { connectDB } from './config/database';
import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { upload } from './middleware/upload';
import { protect } from './middleware/auth';
import logger from './utils/logger';


import authRoutes from './routes/authRoutes';
import facultyRoutes from './routes/facultyRoutes';
import courseRoutes from './routes/courseRoutes';
import newsRoutes from './routes/newsRoutes';
import contactRoutes from './routes/contactRoutes';
import studentAuthRoutes from './routes/studentAuthRoutes';
import teacherAuthRoutes from './routes/teacherAuthRoutes';
import verificationRoutes from './routes/verificationRoutes';
import adminRoutes from './routes/adminRoutes';
import advisorRoutes from './routes/advisorRoutes';
import noticeRoutes from './routes/noticeRoutes';
import feedbackRoutes from './routes/feedbackRoutes';
import resultRoutes from './routes/resultRoutes';
import admissionRoutes from './routes/admissionRoutes';
import societyRoutes from './routes/societyRoutes';
import bannerRoutes from './routes/bannerRoutes';
import statsRoutes from './routes/statsRoutes';
import enrollmentRoutes from './routes/enrollmentRoutes';
import courseResultRoutes from './routes/courseResultRoutes';
import courseOfferingRoutes from './routes/courseOfferingRoutes';
import uploadRoutes from './routes/uploadRoutes';


const app: Application = express();


connectDB();


// CORS must be first
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174', config.corsOrigin].filter(Boolean);
console.log('Allowed CORS Origins:', allowedOrigins);

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(helmet());


const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later',
});
app.use('/api/', limiter);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(compression());


app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


app.post('/api/upload', protect, upload.single('image'), (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a file',
            });
        }

        return res.json({
            success: true,
            data: {
                filename: req.file.filename,
                path: `/uploads/${req.file.filename}`,
                size: req.file.size,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'File upload failed',
        });
    }
});


app.use('/api/auth', authRoutes);
app.use('/api/auth/student', studentAuthRoutes);
app.use('/api/auth/teacher', teacherAuthRoutes);
app.use('/api/auth', verificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/advisors', advisorRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/admissions', admissionRoutes);
app.use('/api/societies', societyRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/course-results', courseResultRoutes);
app.use('/api/course-offerings', courseOfferingRoutes);
app.use('/api/upload', uploadRoutes);


app.get('/api/health', (_req: Request, res: Response) => {
    return res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});


app.use((_req: Request, res: Response) => {
    return res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});


app.use(errorHandler);


const PORT = config.port;
app.listen(PORT, () => {
    logger.info(` Server running in ${config.nodeEnv} mode on port ${PORT}`);
    console.log(` Server running in ${config.nodeEnv} mode on port ${PORT}`);
});

export default app;
