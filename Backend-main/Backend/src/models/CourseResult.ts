import mongoose, { Schema, Document } from 'mongoose';

interface ICourseResult extends Document {
    courseId: mongoose.Types.ObjectId;
    teacherId: mongoose.Types.ObjectId;
    session: string;
    semester: number;
    fileName: string;
    filePath: string;
    fileType: 'excel' | 'pdf' | 'doc' | 'docx';
    fileSize: number;
    uploadedAt: Date;
    description?: string;
}

const courseResultSchema = new Schema<ICourseResult>(
    {
        courseId: {
            type: Schema.Types.ObjectId,
            ref: 'Course',
            required: [true, 'Course ID is required'],
        },
        teacherId: {
            type: Schema.Types.ObjectId,
            ref: 'Teacher',
            required: [true, 'Teacher ID is required'],
        },
        session: {
            type: String,
            required: [true, 'Session is required'],
            trim: true,
        },
        semester: {
            type: Number,
            required: [true, 'Semester is required'],
            min: 1,
            max: 8,
        },
        fileName: {
            type: String,
            required: [true, 'File name is required'],
        },
        filePath: {
            type: String,
            required: [true, 'File path is required'],
        },
        fileType: {
            type: String,
            enum: ['excel', 'pdf', 'doc', 'docx'],
            required: [true, 'File type is required'],
        },
        fileSize: {
            type: Number,
            required: [true, 'File size is required'],
        },
        uploadedAt: {
            type: Date,
            default: Date.now,
        },
        description: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for queries
courseResultSchema.index({ courseId: 1, session: 1, semester: 1 });
courseResultSchema.index({ teacherId: 1 });

export default mongoose.model<ICourseResult>('CourseResult', courseResultSchema);
