import mongoose, { Schema, Document } from 'mongoose';

interface IStudyMaterial extends Document {
    courseId: mongoose.Types.ObjectId;
    teacherId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    materialType: 'slides' | 'notes' | 'reference' | 'assignment' | 'other';
    fileUrl: string;
    fileName: string;
    fileSize: number;
    session?: string;
    batch?: number;
    isPublic: boolean;
    downloads: number;
}

const studyMaterialSchema = new Schema<IStudyMaterial>(
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
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [1000, 'Description cannot exceed 1000 characters'],
        },
        materialType: {
            type: String,
            enum: ['slides', 'notes', 'reference', 'assignment', 'other'],
            required: [true, 'Material type is required'],
        },
        fileUrl: {
            type: String,
            required: [true, 'File URL is required'],
        },
        fileName: {
            type: String,
            required: [true, 'File name is required'],
        },
        fileSize: {
            type: Number,
            required: [true, 'File size is required'],
        },
        session: {
            type: String,
            trim: true,
        },
        batch: {
            type: Number,
        },
        isPublic: {
            type: Boolean,
            default: true,
        },
        downloads: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

