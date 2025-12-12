import mongoose, { Schema, Document } from 'mongoose';

interface IFeedback extends Document {
    studentId: mongoose.Types.ObjectId;
    targetType: 'course' | 'teacher';
    targetId: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
    isAnonymous: boolean;
    session: string;
}

const feedbackSchema = new Schema<IFeedback>(
    {
        studentId: {
            type: Schema.Types.ObjectId,
            ref: 'Student',
            required: [true, 'Student ID is required'],
        },
        targetType: {
            type: String,
            enum: ['course', 'teacher'],
            required: [true, 'Target type is required'],
        },
        targetId: {
            type: Schema.Types.ObjectId,
            refPath: 'targetModel',
            required: [true, 'Target ID is required'],
        },
        rating: {
            type: Number,
            required: [true, 'Rating is required'],
            min: [1, 'Rating must be at least 1'],
            max: [5, 'Rating cannot exceed 5'],
        },
        comment: {
            type: String,
            trim: true,
            maxlength: [1000, 'Comment cannot exceed 1000 characters'],
        },
        isAnonymous: {
            type: Boolean,
            default: true,
        },
        session: {
            type: String,
            required: [true, 'Session is required'],
            trim: true,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform: function (_doc, ret) {
                
                if (ret.isAnonymous) {
                    delete (ret as any).studentId;
                }
                return ret;
            },
        },
    }
);


feedbackSchema.virtual('targetModel').get(function () {
    return this.targetType === 'course' ? 'Course' : 'Teacher';
});


feedbackSchema.index({ targetType: 1, targetId: 1 });
feedbackSchema.index({ studentId: 1, targetType: 1, targetId: 1 }, { unique: true }); 
feedbackSchema.index({ session: 1 });

export default mongoose.model<IFeedback>('Feedback', feedbackSchema);
