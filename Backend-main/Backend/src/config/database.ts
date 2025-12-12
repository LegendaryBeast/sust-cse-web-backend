import mongoose from 'mongoose';
import { config } from './env';

export const connectDB = async (): Promise<void> => {
    try {
        const conn = await mongoose.connect(config.mongodbUri);
        console.log(` MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(' MongoDB connection error:', error);
        process.exit(1);
    }
};


process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
});
