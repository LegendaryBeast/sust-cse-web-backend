import mongoose, { Schema, Document } from 'mongoose';

interface IBanner extends Document {
    title: string;
    description?: string;
    image: string;
    type: 'event' | 'notice' | 'announcement';
    link?: string;
    startDate: Date;
    endDate: Date;
    priority: number;
    isActive: boolean;
    uploadedBy: mongoose.Types.ObjectId;
}

const bannerSchema = new Schema<IBanner>(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        image: {
            type: String,
            required: [true, 'Image is required'],
        },
        type: {
            type: String,
            enum: ['event', 'notice', 'announcement'],
            default: 'announcement',
        },
        link: {
            type: String,
            trim: true,
        },
        startDate: {
            type: Date,
            required: [true, 'Start date is required'],
        },
        endDate: {
            type: Date,
            required: [true, 'End date is required'],
        },
        priority: {
            type: Number,
            default: 0,
            min: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        uploadedBy: {
            type: Schema.Types.ObjectId,
            refPath: 'uploadedByModel',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);


bannerSchema.virtual('uploadedByModel').get(function () {
    return 'User'; 
});


bannerSchema.index({ isActive: 1, priority: -1, startDate: -1 });

export default mongoose.model<IBanner>('Banner', bannerSchema);
