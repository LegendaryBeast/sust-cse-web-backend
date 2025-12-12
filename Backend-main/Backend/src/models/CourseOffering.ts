import mongoose, { Schema, Document } from 'mongoose';

interface ICourseOffering extends Document {
    courseId: mongoose.Types.ObjectId;
    teacherId: mongoose.Types.ObjectId;
    semester: number;
    session: string;
    year: string;
    isEnrollmentOpen: boolean;
    maxStudents?: number;
    enrolledCount: number;
    startDate?: Date;
    endDate?: Date;
}

const courseOfferingSchema = new Schema<ICourseOffering>(
    {
        courseId: {
            type: Schema.Types.ObjectId,
            ref: 'Course',
            required: [true, 'Course is required'],
        },
        teacherId: {
            type: Schema.Types.ObjectId,
            ref: 'Teacher',
            required: [true, 'Teacher is required'],
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
        year: {
            type: String,
            required: [true, 'Year is required'],
            trim: true,
        },
        isEnrollmentOpen: {
            type: Boolean,
            default: true,
        },
        maxStudents: {
            type: Number,
            min: 1,
        },
        enrolledCount: {
            type: Number,
            default: 0,
        },
        startDate: {
            type: Date,
        },
        endDate: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Ensure unique offering per course-teacher-semester-session-year combination
courseOfferingSchema.index(
    { courseId: 1, teacherId: 1, semester: 1, session: 1, year: 1 },
    { unique: true }
);

// Indexes for queries
courseOfferingSchema.index({ teacherId: 1, isEnrollmentOpen: 1 });
courseOfferingSchema.index({ semester: 1, session: 1, year: 1 });
courseOfferingSchema.index({ courseId: 1 });

export default mongoose.model<ICourseOffering>('CourseOffering', courseOfferingSchema);
