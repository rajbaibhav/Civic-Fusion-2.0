import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/civicfusion';
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    console.error('\n⚠️  MongoDB is not running or not accessible.');
    console.error('Please ensure MongoDB is running on your system.');
    console.error('You can:');
    console.error('  1. Start MongoDB locally: mongod');
    console.error('  2. Use MongoDB Atlas and set MONGODB_URI in .env file');
    console.error('  3. Check if MongoDB service is running\n');
    process.exit(1);
  }
};

export default connectDB;
