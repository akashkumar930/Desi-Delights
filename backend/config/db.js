import mongoose from 'mongoose';

const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI;
  const fallbackUri = process.env.FALLBACK_MONGODB_URI || 'mongodb://127.0.0.1:27017/desi-delights';

  try {
    const conn = await mongoose.connect(primaryUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`Primary MongoDB connection failed: ${error.message}`);
    console.warn(`Trying fallback connection to ${fallbackUri}`);

    try {
      const conn = await mongoose.connect(fallbackUri);
      console.log(`MongoDB Connected (fallback): ${conn.connection.host}`);
    } catch (fallbackError) {
      console.error(`Fallback MongoDB connection failed: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

export default connectDB;
