import mongoose, { Schema, Document } from 'mongoose';

interface IComment {
    userId: mongoose.Types.ObjectId;
    userModel: 'Student' | 'Teacher';
    userName: string;
    comment: string;
    createdAt: Date;
}

interface IPost extends Document {
    teacherId: mongoose.Types.ObjectId;
    courseId?: mongoose.Types.ObjectId;
    title: string;
    content: string;
    attachments: string[];
    targetAudience: 'all' | 'session' | 'batch' | 'course';
    sessionFilter?: string;
    batchFilter?: number;
    isPinned: boolean;
    comments: IComment[];
    isActive: boolean;
}

const commentSchema = new Schema<IComment>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            refPath: 'comments.userModel',
        },
        userModel: {
            type: String,
            required: true,
            enum: ['Student', 'Teacher'],
        },
        userName: {
            type: String,
            required: true,
            trim: true,
        },
        comment: {
            type: String,
            required: [true, 'Comment is required'],
            trim: true,
            maxlength: [1000, 'Comment cannot exceed 1000 characters'],
        },
    },
    {
        timestamps: true,
    }
);

const postSchema = new Schema<IPost>(
    {
        teacherId: {
            type: Schema.Types.ObjectId,
            ref: 'Teacher',
            required: [true, 'Teacher ID is required'],
        },
        courseId: {
            type: Schema.Types.ObjectId,
            ref: 'Course',
        },
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        content: {
            type: String,
            required: [true, 'Content is required'],
            trim: true,
        },
        attachments: {
            type: [String],
            default: [],
        },
        targetAudience: {
            type: String,
            enum: ['all', 'session', 'batch', 'course'],
            default: 'all',
        },
        sessionFilter: {
            type: String,
            trim: true,
        },
        batchFilter: {
            type: Number,
        },
        isPinned: {
            type: Boolean,
            default: false,
        },
        comments: {
            type: [commentSchema],
            default: [],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

