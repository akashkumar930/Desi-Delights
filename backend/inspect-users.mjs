import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fallbackUri = process.env.FALLBACK_MONGODB_URI || 'mongodb://127.0.0.1:27017/desi-delights';
await mongoose.connect(fallbackUri);
const User = (await import('./models/User.js')).default;
const users = await User.find({
  email: { $in: ['sandhya@example.com', 'user@test.com', 'admin@test.com', 'testuser@example.com', 'test2@example.com'] }
}).select('+password').lean();

console.log(JSON.stringify(users, null, 2));
await mongoose.disconnect();
