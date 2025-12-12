import mongoose, { Schema, Document } from 'mongoose';

interface IResult extends Document {
    studentId: mongoose.Types.ObjectId;
    courseId: mongoose.Types.ObjectId;
    session: string;
    semester: number;
    grade: string;
    gpa: number;
    marks?: number;
    uploadedBy: mongoose.Types.ObjectId;
    uploadedByModel: 'User' | 'Teacher';
    uploadSource: 'manual' | 'excel' | 'pdf';
}

const resultSchema = new Schema<IResult>(
    {
        studentId: {
            type: Schema.Types.ObjectId,
            ref: 'Student',
            required: [true, 'Student ID is required'],
        },
        courseId: {
            type: Schema.Types.ObjectId,
            ref: 'Course',
            required: [true, 'Course ID is required'],
        },
        session: {
            type: String,
            required: [true, 'Session is required'],
            trim: true,
        },
        semester: {
            type: Number,
            required: [true, 'Semester is required'],
            min: [1, 'Semester must be at least 1'],
            max: [8, 'Semester cannot exceed 8'],
        },
        grade: {
            type: String,
            required: [true, 'Grade is required'],
            trim: true,
            uppercase: true,
        },
        gpa: {
            type: Number,
            required: [true, 'GPA is required'],
            min: [0, 'GPA cannot be negative'],
            max: [4, 'GPA cannot exceed 4'],
        },
        marks: {
            type: Number,
            min: [0, 'Marks cannot be negative'],
            max: [100, 'Marks cannot exceed 100'],
        },
        uploadedBy: {
            type: Schema.Types.ObjectId,
            required: true,
            refPath: 'uploadedByModel',
        },
        uploadedByModel: {
            type: String,
            required: true,
            enum: ['User', 'Teacher'],
        },
        uploadSource: {
            type: String,
            enum: ['manual', 'excel', 'pdf'],
            default: 'manual',
        },
    },
    {
        timestamps: true,
    }
);


resultSchema.index({ studentId: 1, courseId: 1, semester: 1, session: 1 }, { unique: true });


resultSchema.index({ session: 1, semester: 1 });
resultSchema.index({ studentId: 1 });

export default mongoose.model<IResult>('Result', resultSchema);
