import mongoose, { Schema, Document } from 'mongoose';
import { ICourse } from '../types';

interface ICourseDocument extends ICourse, Document { }

const courseSchema = new Schema<ICourseDocument>(
    {
        title: {
            type: String,
            required: [true, 'Please provide course title'],
            trim: true,
        },
        code: {
            type: String,
            required: [true, 'Please provide course code'],
            unique: true,
            uppercase: true,
            trim: true,
        },
        level: {
            type: String,
            required: [true, 'Please provide course level'],
            enum: ['Undergraduate', 'M.Sc.', 'Ph.D.'],
        },
        description: {
            type: String,
            required: [true, 'Please provide course description'],
        },
        credits: {
            type: Number,
            min: 0,
            max: 10,
        },
        teacherId: {
            type: Schema.Types.ObjectId,
            ref: 'Teacher',
        },
        semester: {
            type: Number,
            min: 1,
            max: 8,
        },
        session: {
            type: String,
            trim: true,
        },
        isEnrollmentOpen: {
            type: Boolean,
            default: true,
        },
        department: {
            type: String,
            default: 'Computer Science and Engineering',
        },
    },
    {
        timestamps: true,
    }
);


courseSchema.index({ title: 'text', code: 'text', description: 'text' });
courseSchema.index({ teacherId: 1 });
courseSchema.index({ semester: 1, session: 1 });

export default mongoose.model<ICourseDocument>('Course', courseSchema);
