import mongoose, { Schema, Document } from 'mongoose';

interface IAdvisor extends Document {
    teacherId: mongoose.Types.ObjectId;
    session: string;
    batch: number;
    assignedBy: mongoose.Types.ObjectId;
    isActive: boolean;
}

const advisorSchema = new Schema<IAdvisor>(
    {
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
        batch: {
            type: Number,
            required: [true, 'Batch number is required'],
        },
        assignedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
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


advisorSchema.index({ session: 1, batch: 1 }, { unique: true });


advisorSchema.index({ teacherId: 1, isActive: 1 });

export default mongoose.model<IAdvisor>('Advisor', advisorSchema);
