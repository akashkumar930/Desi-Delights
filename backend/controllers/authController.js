import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
    try {
        const { name, email, password, role, adminSecret } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Validate admin secret key if registering as admin
        if (role === 'admin') {
            const expectedAdminSecret = process.env.ADMIN_SECRET || 'admin123';
            if (!adminSecret || adminSecret !== expectedAdminSecret) {
                return res.status(403).json({ message: 'Invalid admin secret key' });
            }
        }

        // Create user (role defaults to 'user' if not provided)
        const user = await User.create({
            name,
            email,
            password,
            role: role === 'admin' ? 'admin' : 'user'
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user email
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.comparePassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user role to admin
// @route   PUT /api/auth/update-role
// @access  Private
export const updateRole = async (req, res) => {
    try {
        const { adminSecret } = req.body;
        const expectedAdminSecret = process.env.ADMIN_SECRET || 'admin123';

        if (!adminSecret || adminSecret !== expectedAdminSecret) {
            return res.status(403).json({ message: 'Invalid admin secret key' });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { role: 'admin' },
            { new: true }
        );

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
