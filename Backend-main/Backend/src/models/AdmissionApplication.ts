import mongoose, { Schema, Document } from 'mongoose';

interface IAdmissionApplication extends Document {
    admissionId: mongoose.Types.ObjectId;
    applicantName: string;
    email: string;
    phone: string;
    appliedCourses: string[];
    documents: string[];
    status: 'pending' | 'approved' | 'rejected';
    reviewedBy?: mongoose.Types.ObjectId;
    reviewNotes?: string;
}

const admissionApplicationSchema = new Schema<IAdmissionApplication>(
    {
        admissionId: {
            type: Schema.Types.ObjectId,
            ref: 'Admission',
            required: [true, 'Admission ID is required'],
        },
        applicantName: {
            type: String,
            required: [true, 'Applicant name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true,
        },
        appliedCourses: {
            type: [String],
            required: [true, 'At least one course must be selected'],
            validate: {
                validator: function (v: string[]) {
                    return v && v.length > 0;
                },
                message: 'At least one course must be selected',
            },
        },
        documents: {
            type: [String],
            default: [],
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        reviewedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        reviewNotes: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);


admissionApplicationSchema.index({ admissionId: 1, status: 1 });
admissionApplicationSchema.index({ email: 1 });

export default mongoose.model<IAdmissionApplication>(
    'AdmissionApplication',
    admissionApplicationSchema
);
