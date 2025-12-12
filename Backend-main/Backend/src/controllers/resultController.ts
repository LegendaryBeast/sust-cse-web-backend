import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as XLSX from 'xlsx';
import Result from '../models/Result';
import Student from '../models/Student';
import Course from '../models/Course';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { sendResultEmail } from '../utils/emailService';




export const uploadResultManual = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
    }

    const { studentId, courseId, session, semester, grade, gpa, marks } = req.body;
    const uploadedBy = (req as any).user.id;
    const uploadedByModel = (req as any).user.role === 'teacher' ? 'Teacher' : 'User';

    
    const student = await Student.findById(studentId);
    if (!student) {
        throw new AppError('Student not found', 404);
    }

    const course = await Course.findById(courseId);
    if (!course) {
        throw new AppError('Course not found', 404);
    }

    
    const existingResult = await Result.findOne({ studentId, courseId, semester, session });
    if (existingResult) {
        
        existingResult.grade = grade;
        existingResult.gpa = gpa;
        existingResult.marks = marks;
        existingResult.uploadedBy = uploadedBy;
        existingResult.uploadedByModel = uploadedByModel;
        existingResult.uploadSource = 'manual';
        await existingResult.save();

        res.json({
            success: true,
            message: 'Result updated successfully',
            data: existingResult,
        });
        return;
    }

    
    const result = await Result.create({
        studentId,
        courseId,
        session,
        semester,
        grade,
        gpa,
        marks,
        uploadedBy,
        uploadedByModel,
        uploadSource: 'manual',
    });

    res.status(201).json({
        success: true,
        message: 'Result uploaded successfully',
        data: result,
    });
});




export const uploadResultsExcel = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
        throw new AppError('Please upload an Excel file', 400);
    }

    const { session, semester } = req.body;
    if (!session || !semester) {
        throw new AppError('Session and semester are required', 400);
    }

    const uploadedBy = (req as any).user.id;

    try {
        
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        if (data.length === 0) {
            throw new AppError('Excel file is empty', 400);
        }

        const results: any[] = [];
        const errors: any[] = [];

        
        for (let i = 0; i < data.length; i++) {
            const row: any = data[i];

            try {
                
                const student = await Student.findOne({ registrationId: row.registrationId });
                if (!student) {
                    errors.push({ row: i + 2, error: `Student not found: ${row.registrationId}` });
                    continue;
                }

                const course = await Course.findOne({ code: row.courseCode });
                if (!course) {
                    errors.push({ row: i + 2, error: `Course not found: ${row.courseCode}` });
                    continue;
                }

                
                const existingResult = await Result.findOne({
                    studentId: student._id,
                    courseId: course._id,
                    semester: parseInt(semester),
                    session,
                });

                if (existingResult) {
                    
                    existingResult.grade = row.grade.toString().toUpperCase();
                    existingResult.gpa = parseFloat(row.gpa);
                    existingResult.marks = row.marks ? parseFloat(row.marks) : undefined;
                    existingResult.uploadedBy = uploadedBy;
                    existingResult.uploadedByModel = 'User';
                    existingResult.uploadSource = 'excel';
                    await existingResult.save();
                    results.push(existingResult);
                } else {
                    
                    const result = await Result.create({
                        studentId: student._id,
                        courseId: course._id,
                        session,
                        semester: parseInt(semester),
                        grade: row.grade.toString().toUpperCase(),
                        gpa: parseFloat(row.gpa),
                        marks: row.marks ? parseFloat(row.marks) : undefined,
                        uploadedBy,
                        uploadedByModel: 'User',
                        uploadSource: 'excel',
                    });
                    results.push(result);
                }
            } catch (error: any) {
                errors.push({ row: i + 2, error: error.message });
            }
        }

        
        try {
            const students = await Student.find({ session, isVerified: true }).select('email');
            const recipients = students.map(s => s.email);
            if (recipients.length > 0) {
                sendResultEmail(recipients, session, parseInt(semester)).catch(err => {
                    console.error('Error sending result emails:', err);
                });
            }
        } catch (emailError) {
            console.error('Error preparing result emails:', emailError);
        }

        res.status(201).json({
            success: true,
            message: `Uploaded ${results.length} results successfully`,
            data: {
                uploaded: results.length,
                errors: errors.length > 0 ? errors : undefined,
            },
        });
    } catch (error: any) {
        throw new AppError('Error processing Excel file: ' + error.message, 400);
    }
});




export const getMyResults = asyncHandler(async (req: Request, res: Response) => {
    const studentId = (req as any).user.id;

    const results = await Result.find({ studentId })
        .populate('courseId', 'title code credits')
        .sort({ session: -1, semester: -1 });

    
    const semesterStats: any = {};
    let totalGpa = 0;
    let totalCredits = 0;

    results.forEach(result => {
        const key = `${result.session}-${result.semester}`;
        if (!semesterStats[key]) {
            semesterStats[key] = {
                session: result.session,
                semester: result.semester,
                results: [],
                totalGpa: 0,
                totalCredits: 0,
            };
        }
        semesterStats[key].results.push(result);
        const credits = (result.courseId as any).credits || 3;
        semesterStats[key].totalGpa += result.gpa * credits;
        semesterStats[key].totalCredits += credits;

        totalGpa += result.gpa * credits;
        totalCredits += credits;
    });

    
    Object.keys(semesterStats).forEach(key => {
        const stats = semesterStats[key];
        stats.semesterGPA = stats.totalCredits > 0
            ? (stats.totalGpa / stats.totalCredits).toFixed(2)
            : '0.00';
    });

    const cgpa = totalCredits > 0 ? (totalGpa / totalCredits).toFixed(2) : '0.00';

    res.json({
        success: true,
        count: results.length,
        cgpa,
        data: {
            semesters: Object.values(semesterStats),
            allResults: results,
        },
    });
});




export const getResultsBySession = asyncHandler(async (req: Request, res: Response) => {
    const { session, semester } = req.params;

    const results = await Result.find({ session, semester: parseInt(semester) })
        .populate('studentId', 'name registrationId batch email')
        .populate('courseId', 'title code credits')
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        count: results.length,
        data: results,
    });
});




export const getStudentResults = asyncHandler(async (req: Request, res: Response) => {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
        throw new AppError('Student not found', 404);
    }

    const results = await Result.find({ studentId })
        .populate('courseId', 'title code credits')
        .sort({ session: -1, semester: -1 });

    res.json({
        success: true,
        count: results.length,
        data: {
            student: {
                name: student.name,
                registrationId: student.registrationId,
                session: student.session,
                batch: student.batch,
            },
            results,
        },
    });
});




export const deleteResult = asyncHandler(async (req: Request, res: Response) => {
    const result = await Result.findById(req.params.id);

    if (!result) {
        throw new AppError('Result not found', 404);
    }

    await result.deleteOne();

    res.json({
        success: true,
        message: 'Result deleted successfully',
    });
});
