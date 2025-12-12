import mongoose, { Schema, Document } from 'mongoose';

interface IEnrollment extends Document {
    studentId: mongoose.Types.ObjectId;
    courseId: mongoose.Types.ObjectId;
    teacherId: mongoose.Types.ObjectId;
    status: 'pending' | 'approved' | 'rejected';
    requestedAt: Date;
    approvedAt?: Date;
    rejectedAt?: Date;
    semester: number;
    session: string;
}

const enrollmentSchema = new Schema<IEnrollment>(
    {
        studentId: {
            type: Schema.Types.ObjectId,
            ref: 'Student',
            required: [true, 'Student ID is required'],
        },
        courseId: {
            type: Schema.Types.ObjectId,
            ref: 'Course',
            required: [true, 'Course ID is required'],
        },
        teacherId: {
            type: Schema.Types.ObjectId,
            ref: 'Teacher',
            required: [true, 'Teacher ID is required'],
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        requestedAt: {
            type: Date,
            default: Date.now,
        },
        approvedAt: {
            type: Date,
        },
        rejectedAt: {
            type: Date,
        },
        semester: {
            type: Number,
            required: [true, 'Semester is required'],
            min: 1,
            max: 8,
        },
        session: {
            type: String,
            required: [true, 'Session is required'],
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate enrollment requests
enrollmentSchema.index({ studentId: 1, courseId: 1, session: 1, semester: 1 }, { unique: true });

// Indexes for queries
enrollmentSchema.index({ teacherId: 1, status: 1 });
enrollmentSchema.index({ studentId: 1, status: 1 });
enrollmentSchema.index({ courseId: 1 });

export default mongoose.model<IEnrollment>('Enrollment', enrollmentSchema);
