import mongoose, { Schema, Document } from 'mongoose';

interface IComplaint extends Document {
    studentId?: mongoose.Types.ObjectId;
    studentName?: string;
    subject: string;
    description: string;
    category: 'academic' | 'facility' | 'administration' | 'other';
    isAnonymous: boolean;
    status: 'pending' | 'in-progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high';
    adminResponse?: string;
    respondedBy?: mongoose.Types.ObjectId;
    respondedAt?: Date;
}

const complaintSchema = new Schema<IComplaint>(
    {
        studentId: {
            type: Schema.Types.ObjectId,
            ref: 'Student',
        },
        studentName: {
            type: String,
            trim: true,
        },
        subject: {
            type: String,
            required: [true, 'Subject is required'],
            trim: true,
            maxlength: [200, 'Subject cannot exceed 200 characters'],
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
            maxlength: [2000, 'Description cannot exceed 2000 characters'],
        },
        category: {
            type: String,
            enum: ['academic', 'facility', 'administration', 'other'],
            required: [true, 'Category is required'],
        },
        isAnonymous: {
            type: Boolean,
            default: true,
        },
        status: {
            type: String,
            enum: ['pending', 'in-progress', 'resolved', 'closed'],
            default: 'pending',
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium',
        },
        adminResponse: {
            type: String,
            trim: true,
        },
        respondedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        respondedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform: function (_doc, ret) {
                if (ret.isAnonymous) {
                    delete ret.studentId;
                    delete ret.studentName;
                }
                return ret;
            }
        }
    }
);

complaintSchema.index({ studentId: 1, createdAt: -1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ category: 1 });

export default mongoose.model<IComplaint>('Complaint', complaintSchema);