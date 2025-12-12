import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import Student from '../models/Student';
import Teacher from '../models/Teacher';
import Course from '../models/Course';
import Notice from '../models/Notice';
import Feedback from '../models/Feedback';
import Result from '../models/Result';
import Admission from '../models/Admission';
import AdmissionApplication from '../models/AdmissionApplication';
import Society from '../models/Society';
import Banner from '../models/Banner';
import Advisor from '../models/Advisor';




export const getSystemStats = asyncHandler(async (_req: Request, res: Response) => {
    const [
        totalStudents,
        verifiedStudents,
        totalTeachers,
        approvedTeachers,
        totalCourses,
        totalNotices,
        totalFeedbacks,
        totalResults,
        totalAdmissions,
        pendingApplications,
        totalSocieties,
        activeBanners,
        totalAdvisors,
    ] = await Promise.all([
        Student.countDocuments(),
        Student.countDocuments({ isVerified: true }),
        Teacher.countDocuments(),
        Teacher.countDocuments({ isApproved: true, isVerified: true }),
        Course.countDocuments(),
        Notice.countDocuments({ isActive: true }),
        Feedback.countDocuments(),
        Result.countDocuments(),
        Admission.countDocuments({ isActive: true }),
        AdmissionApplication.countDocuments({ status: 'pending' }),
        Society.countDocuments({ isActive: true }),
        Banner.countDocuments({ isActive: true }),
        Advisor.countDocuments({ isActive: true }),
    ]);

    res.json({
        success: true,
        data: {
            users: {
                students: {
                    total: totalStudents,
                    verified: verifiedStudents,
                },
                teachers: {
                    total: totalTeachers,
                    approved: approvedTeachers,
                },
            },
            academic: {
                courses: totalCourses,
                notices: totalNotices,
                feedbacks: totalFeedbacks,
                results: totalResults,
                advisors: totalAdvisors,
            },
            admissions: {
                active: totalAdmissions,
                pendingApplications,
            },
            community: {
                societies: totalSocieties,
                activeBanners,
            },
        },
    });
});
