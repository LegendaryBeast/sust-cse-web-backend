import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Admission from '../models/Admission';
import AdmissionApplication from '../models/AdmissionApplication';
import { asyncHandler, AppError } from '../middleware/errorHandler';




export const createAdmission = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
    }

    const { title, session, offeredCourses, description, startDate, endDate, requirements } = req.body;

    const admission = await Admission.create({
        title,
        session,
        offeredCourses,
        description,
        startDate,
        endDate,
        requirements,
    });

    res.status(201).json({
        success: true,
        message: 'Admission created successfully',
        data: admission,
    });
});




export const getAdmissions = asyncHandler(async (_req: Request, res: Response) => {
    const admissions = await Admission.find({ isActive: true })
        .sort({ startDate: -1 });

    res.json({
        success: true,
        count: admissions.length,
        data: admissions,
    });
});




export const getAdmissionById = asyncHandler(async (req: Request, res: Response) => {
    const admission = await Admission.findById(req.params.id);

    if (!admission) {
        throw new AppError('Admission not found', 404);
    }

    res.json({
        success: true,
        data: admission,
    });
});




export const updateAdmission = asyncHandler(async (req: Request, res: Response) => {
    const admission = await Admission.findById(req.params.id);

    if (!admission) {
        throw new AppError('Admission not found', 404);
    }

    const { title, session, offeredCourses, description, startDate, endDate, requirements, isActive } = req.body;

    admission.title = title || admission.title;
    admission.session = session || admission.session;
    admission.offeredCourses = offeredCourses || admission.offeredCourses;
    admission.description = description || admission.description;
    admission.startDate = startDate || admission.startDate;
    admission.endDate = endDate || admission.endDate;
    admission.requirements = requirements || admission.requirements;
    if (isActive !== undefined) admission.isActive = isActive;

    await admission.save();

    res.json({
        success: true,
        message: 'Admission updated successfully',
        data: admission,
    });
});




export const deleteAdmission = asyncHandler(async (req: Request, res: Response) => {
    const admission = await Admission.findById(req.params.id);

    if (!admission) {
        throw new AppError('Admission not found', 404);
    }

    await admission.deleteOne();

    res.json({
        success: true,
        message: 'Admission deleted successfully',
    });
});




export const submitApplication = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
    }

    const admissionId = req.params.id;
    const { applicantName, email, phone, appliedCourses, documents } = req.body;

    
    const admission = await Admission.findById(admissionId);
    if (!admission) {
        throw new AppError('Admission not found', 404);
    }

    if (!admission.isActive) {
        throw new AppError('This admission is no longer accepting applications', 400);
    }

    
    if (new Date() > admission.endDate) {
        throw new AppError('Application deadline has passed', 400);
    }

    
    const existingApplication = await AdmissionApplication.findOne({ admissionId, email });
    if (existingApplication) {
        throw new AppError('You have already applied for this admission', 400);
    }

    const application = await AdmissionApplication.create({
        admissionId,
        applicantName,
        email,
        phone,
        appliedCourses,
        documents: documents || [],
    });

    res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: application,
    });
});




export const getApplications = asyncHandler(async (req: Request, res: Response) => {
    const admissionId = req.params.id;
    const { status } = req.query;

    const filter: any = { admissionId };
    if (status) filter.status = status;

    const applications = await AdmissionApplication.find(filter)
        .populate('admissionId', 'title session')
        .populate('reviewedBy', 'username email')
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        count: applications.length,
        data: applications,
    });
});




export const reviewApplication = asyncHandler(async (req: Request, res: Response) => {
    const { id, action } = req.params;
    const { reviewNotes } = req.body;

    if (!['approve', 'reject'].includes(action)) {
        throw new AppError('Invalid action. Use approve or reject', 400);
    }

    const application = await AdmissionApplication.findById(id);

    if (!application) {
        throw new AppError('Application not found', 404);
    }

    if (application.status !== 'pending') {
        throw new AppError('This application has already been reviewed', 400);
    }

    application.status = action === 'approve' ? 'approved' : 'rejected';
    application.reviewedBy = (req as any).user.id;
    application.reviewNotes = reviewNotes;

    await application.save();

    res.json({
        success: true,
        message: `Application ${action}d successfully`,
        data: application,
    });
});
