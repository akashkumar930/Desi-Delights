import dotenv from 'dotenv';
// Load environment variables FIRST before any other imports
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import analyticsRoutes from './routes/analytics.js';
import activityRoutes from './routes/activity.js';
import uploadRoutes from './routes/upload.js';
import userRoutes from './routes/users.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, 'uploads');

// Middleware
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploaded images
app.use('/uploads', express.static(uploadsDir, {
    setHeaders: (res, path) => {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Test users endpoint
app.get('/api/test-users', async (req, res) => {
    try {
        const User = (await import('./models/User.js')).default;
        const users = await User.find({}).select('-password');
        res.json({
            count: users.length,
            users: users.map(u => ({ name: u.name, email: u.email, role: u.role }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Error handling
app.use(notFound);
app.use(errorHandler);

const seedDemoUsers = async () => {
    try {
        const User = (await import('./models/User.js')).default;
        const demoUsers = [
            { name: 'Sandhya', email: 'sandhya@example.com', password: 'sandhya123', role: 'admin' },
            { name: 'Demo User', email: 'user@test.com', password: 'password123', role: 'user' },
            { name: 'Admin Demo', email: 'admin@test.com', password: 'password123', role: 'admin' }
        ];

        for (const userData of demoUsers) {
            const existingUser = await User.findOne({ email: userData.email });
            if (existingUser) {
                existingUser.name = userData.name;
                existingUser.role = userData.role;
                existingUser.password = userData.password;
                await existingUser.save();
                console.log(`Seeded existing user: ${userData.email}`);
            } else {
                await User.create(userData);
                console.log(`Seeded new user: ${userData.email}`);
            }
        }
    } catch (error) {
        console.error('Demo user seeding failed:', error.message);
    }
};

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        await seedDemoUsers();
        app.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();
