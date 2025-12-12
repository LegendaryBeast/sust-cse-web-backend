import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

interface IStudent extends Document {
    registrationId: string;
    name: string;
    email: string;
    password: string;
    session: string;
    batch: number;
    phone?: string;
    profileImage?: string;
    isVerified: boolean;
    verificationToken?: string;
    advisorId?: mongoose.Types.ObjectId;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const studentSchema = new Schema<IStudent>(
    {
        registrationId: {
            type: String,
            required: [true, 'Registration ID is required'],
            unique: true,
            trim: true,
        },
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false,
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
        phone: {
            type: String,
            trim: true,
        },
        profileImage: {
            type: String,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        verificationToken: {
            type: String,
            select: false,
        },
        advisorId: {
            type: Schema.Types.ObjectId,
            ref: 'Teacher',
        },
    },
    {
        timestamps: true,
    }
);


studentSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});


studentSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
};


studentSchema.index({ registrationId: 1, session: 1, batch: 1 });

export default mongoose.model<IStudent>('Student', studentSchema);
