import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

interface ITeacher extends Document {
    employeeId: string;
    name: string;
    email: string;
    password: string;
    designation: string;
    department: string;
    phone?: string;
    profileImage?: string;
    research: string[];
    education: string[];
    isApproved: boolean;
    isVerified: boolean;
    verificationToken?: string;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const teacherSchema = new Schema<ITeacher>(
    {
        employeeId: {
            type: String,
            required: [true, 'Employee ID is required'],
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
        designation: {
            type: String,
            required: [true, 'Designation is required'],
            trim: true,
        },
        department: {
            type: String,
            default: 'Computer Science and Engineering',
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        profileImage: {
            type: String,
        },
        research: {
            type: [String],
            default: [],
        },
        education: {
            type: [String],
            default: [],
        },
        isApproved: {
            type: Boolean,
            default: false,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        verificationToken: {
            type: String,
            select: false,
        },
    },
    {
        timestamps: true,
    }
);


teacherSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});


teacherSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
};


teacherSchema.index({ employeeId: 1, name: 'text' });

export default mongoose.model<ITeacher>('Teacher', teacherSchema);
