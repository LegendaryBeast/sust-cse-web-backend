import mongoose, { Schema, Document } from 'mongoose';

interface IStudentRegistration extends Document {
    registrationId: string;
    session: string;
    batch: number;
    isUsed: boolean;
    uploadedBy: mongoose.Types.ObjectId;
}

const studentRegistrationSchema = new Schema<IStudentRegistration>(
    {
        registrationId: {
            type: String,
            required: [true, 'Registration ID is required'],
            unique: true,
            trim: true,
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
        isUsed: {
            type: Boolean,
            default: false,
        },
        uploadedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);


studentRegistrationSchema.index({ registrationId: 1, isUsed: 1 });

export default mongoose.model<IStudentRegistration>(
    'StudentRegistration',
    studentRegistrationSchema
);
