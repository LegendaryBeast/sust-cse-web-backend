import mongoose, { Schema, Document } from 'mongoose';

interface INotice extends Document {
    title: string;
    content: string;
    type: 'routine' | 'assignment' | 'announcement' | 'event';
    attachments: string[];
    targetType: 'all' | 'course' | 'student';
    targetCourseId?: mongoose.Types.ObjectId;
    targetStudentId?: mongoose.Types.ObjectId;
    postedBy: mongoose.Types.ObjectId;
    postedByModel: 'User' | 'Teacher';
    isActive: boolean;
}

const noticeSchema = new Schema<INotice>(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        content: {
            type: String,
            required: [true, 'Content is required'],
        },
        type: {
            type: String,
            enum: ['routine', 'assignment', 'announcement', 'event'],
            default: 'announcement',
        },
        attachments: {
            type: [String],
            default: [],
        },
        targetType: {
            type: String,
            enum: ['all', 'course', 'student'],
            default: 'all',
        },
        targetCourseId: {
            type: Schema.Types.ObjectId,
            ref: 'Course',
        },
        targetStudentId: {
            type: Schema.Types.ObjectId,
            ref: 'Student',
        },
        postedBy: {
            type: Schema.Types.ObjectId,
            required: true,
            refPath: 'postedByModel',
        },
        postedByModel: {
            type: String,
            required: true,
            enum: ['User', 'Teacher'],
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

// Indexes
noticeSchema.index({ isActive: 1, createdAt: -1 });
noticeSchema.index({ type: 1, isActive: 1 });
noticeSchema.index({ targetType: 1, targetCourseId: 1, targetStudentId: 1 });

// Text search index
noticeSchema.index({ title: 'text', content: 'text' });

export default mongoose.model<INotice>('Notice', noticeSchema);
