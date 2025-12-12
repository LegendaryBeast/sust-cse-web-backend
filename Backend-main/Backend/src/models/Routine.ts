import mongoose, { Schema, Document } from 'mongoose';

interface ITimeSlot {
    day: 'Saturday' | 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
    startTime: string;
    endTime: string;
    courseId: mongoose.Types.ObjectId;
    teacherId: mongoose.Types.ObjectId;
    roomNumber?: string;
    type: 'lecture' | 'lab' | 'tutorial';
}

interface IRoutine extends Document {
    session: string;
    batch: number;
    semester: number;
    timeSlots: ITimeSlot[];
    effectiveFrom: Date;
    effectiveTo?: Date;
    isActive: boolean;
    createdBy: mongoose.Types.ObjectId;
}

const timeSlotSchema = new Schema<ITimeSlot>(
    {
        day: {
            type: String,
            enum: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            required: [true, 'Day is required'],
        },
        startTime: {
            type: String,
            required: [true, 'Start time is required'],
            match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide valid time in HH:MM format'],
        },
        endTime: {
            type: String,
            required: [true, 'End time is required'],
            match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide valid time in HH:MM format'],
        },
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
        roomNumber: {
            type: String,
            trim: true,
        },
        type: {
            type: String,
            enum: ['lecture', 'lab', 'tutorial'],
            default: 'lecture',
        },
    },
    { _id: true }
);

const routineSchema = new Schema<IRoutine>(
    {
        session: {
            type: String,
            required: [true, 'Session is required'],
            trim: true,
        },
        batch: {
            type: Number,
            required: [true, 'Batch is required'],
        },
        semester: {
            type: Number,
            required: [true, 'Semester is required'],
            min: 1,
            max: 8,
        },
        timeSlots: {
            type: [timeSlotSchema],
            required: [true, 'At least one time slot is required'],
            validate: {
                validator: function (v: ITimeSlot[]) {
                    return v.length > 0;
                },
                message: 'Routine must have at least one time slot',
            },
        },
        effectiveFrom: {
            type: Date,
            required: [true, 'Effective from date is required'],
        },
        effectiveTo: {
            type: Date,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Creator is required'],
        },
    },
    {
        timestamps: true,
    }
);

