import mongoose, { Schema, Document } from 'mongoose';
import { IContact } from '../types';

interface IContactDocument extends IContact, Document { }

const contactSchema = new Schema<IContactDocument>(
    {
        name: {
            type: String,
            required: [true, 'Please provide your name'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Please provide your email'],
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        subject: {
            type: String,
            required: [true, 'Please provide subject'],
            trim: true,
        },
        message: {
            type: String,
            required: [true, 'Please provide message'],
            trim: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);


contactSchema.index({ isRead: 1, createdAt: -1 });

export default mongoose.model<IContactDocument>('Contact', contactSchema);
