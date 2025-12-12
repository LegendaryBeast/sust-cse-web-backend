import mongoose, { Schema, Document } from 'mongoose';

interface ISocietyMember extends Document {
    societyId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    userType: 'Student' | 'Teacher';
    role: string;
    joinedDate: Date;
    addedBy: mongoose.Types.ObjectId;
}

const societyMemberSchema = new Schema<ISocietyMember>(
    {
        societyId: {
            type: Schema.Types.ObjectId,
            ref: 'Society',
            required: [true, 'Society ID is required'],
        },
        userId: {
            type: Schema.Types.ObjectId,
            refPath: 'userType',
            required: [true, 'User ID is required'],
        },
        userType: {
            type: String,
            required: [true, 'User type is required'],
            enum: ['Student', 'Teacher'],
        },
        role: {
            type: String,
            required: [true, 'Role is required'],
            trim: true,
            default: 'Member',
        },
        joinedDate: {
            type: Date,
            default: Date.now,
        },
        addedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);


societyMemberSchema.index({ societyId: 1, userId: 1, userType: 1 }, { unique: true });


societyMemberSchema.index({ societyId: 1 });
societyMemberSchema.index({ userId: 1, userType: 1 });

export default mongoose.model<ISocietyMember>('SocietyMember', societyMemberSchema);
