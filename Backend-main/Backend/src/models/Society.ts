import mongoose, { Schema, Document } from 'mongoose';

interface ISociety extends Document {
    name: string;
    description: string;
    logo?: string;
    foundedYear: number;
    isActive: boolean;
}

const societySchema = new Schema<ISociety>(
    {
        name: {
            type: String,
            required: [true, 'Society name is required'],
            unique: true,
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
        },
        logo: {
            type: String,
        },
        foundedYear: {
            type: Number,
            required: [true, 'Founded year is required'],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);


societySchema.index({ isActive: 1, name: 1 });

export default mongoose.model<ISociety>('Society', societySchema);
