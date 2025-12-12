import mongoose, { Schema, Document } from 'mongoose';

interface IAdmission extends Document {
    title: string;
    session: string;
    offeredCourses: string[];
    description: string;
    startDate: Date;
    endDate: Date;
    requirements: string[];
    isActive: boolean;
}

const admissionSchema = new Schema<IAdmission>(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
        },
        session: {
            type: String,
            required: [true, 'Session is required'],
            trim: true,
        },
        offeredCourses: {
            type: [String],
            default: [],
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
        },
        startDate: {
            type: Date,
            required: [true, 'Start date is required'],
        },
        endDate: {
            type: Date,
            required: [true, 'End date is required'],
        },
        requirements: {
            type: [String],
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


admissionSchema.index({ isActive: 1, endDate: -1 });

export default mongoose.model<IAdmission>('Admission', admissionSchema);
