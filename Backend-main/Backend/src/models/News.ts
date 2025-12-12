import mongoose, { Schema, Document } from 'mongoose';
import { INews } from '../types';

interface INewsDocument extends INews, Document { }

const newsSchema = new Schema<INewsDocument>(
    {
        title: {
            type: String,
            required: [true, 'Please provide news title'],
            trim: true,
        },
        excerpt: {
            type: String,
            required: [true, 'Please provide news excerpt'],
            trim: true,
        },
        image: {
            type: String,
            required: [true, 'Please provide news image'],
        },
        url: {
            type: String,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        order: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);


newsSchema.index({ order: 1, createdAt: -1 });

export default mongoose.model<INewsDocument>('News', newsSchema);
