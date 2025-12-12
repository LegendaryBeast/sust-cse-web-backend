import mongoose, { Schema, Document } from 'mongoose';

interface IJob extends Document {
    title: string;
    company: string;
    companyLogo?: string;
    jobType: 'internship' | 'full-time' | 'part-time' | 'contract';
    location: string;
    workMode: 'onsite' | 'remote' | 'hybrid';
    description: string;
    requirements: string[];
    responsibilities: string[];
    salary?: string;
    applicationDeadline: Date;
    applicationLink: string;
    contactEmail: string;
    postedBy: mongoose.Types.ObjectId;
    postedByModel: 'User' | 'Teacher';
    isActive: boolean;
    featured: boolean;
}

const jobSchema = new Schema<IJob>(
    {
        title: {
            type: String,
            required: [true, 'Job title is required'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        company: {
            type: String,
            required: [true, 'Company name is required'],
            trim: true,
        },
        companyLogo: {
            type: String,
        },
        jobType: {
            type: String,
            enum: ['internship', 'full-time', 'part-time', 'contract'],
            required: [true, 'Job type is required'],
        },
        location: {
            type: String,
            required: [true, 'Location is required'],
            trim: true,
        },
        workMode: {
            type: String,
            enum: ['onsite', 'remote', 'hybrid'],
            required: [true, 'Work mode is required'],
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
        },
        requirements: {
            type: [String],
            required: [true, 'Requirements are required'],
        },
        responsibilities: {
            type: [String],
            default: [],
        },
        salary: {
            type: String,
            trim: true,
        },
        applicationDeadline: {
            type: Date,
            required: [true, 'Application deadline is required'],
        },
        applicationLink: {
            type: String,
            required: [true, 'Application link is required'],
            trim: true,
        },
        contactEmail: {
            type: String,
            required: [true, 'Contact email is required'],
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        postedBy: {
            type: Schema.Types.ObjectId,
            required: true,
            refPath: 'postedByModel',
        },
        postedByModel: {
            type: String,
            required: true,
            enum: ['User', 'Teacher'],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        featured: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

