import mongoose, { Schema, Document } from 'mongoose';
import { IFaculty } from '../types';

interface IFacultyDocument extends IFaculty, Document { }

const facultySchema = new Schema<IFacultyDocument>(
    {
        name: {
            type: String,
            required: [true, 'Please provide faculty name'],
            trim: true,
        },
        designation: {
            type: String,
            required: [true, 'Please provide designation'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Please provide email'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        phone: {
            type: String,
            trim: true,
        },
        image: {
            type: String,
            required: false,
        },
        education: {
            type: [String],
            default: [],
        },
        research: {
            type: [String],
            default: [],
        },
        publications: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);


facultySchema.index({ name: 'text', designation: 'text' });

export default mongoose.model<IFacultyDocument>('Faculty', facultySchema);
