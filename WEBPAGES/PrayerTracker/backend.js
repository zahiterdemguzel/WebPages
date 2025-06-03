// routes/api.js (Conceptual Backend Routes - NOT RUNNABLE HERE)
// This file would contain your API routes, exported as an Express Router.

// 1. Ensure you have these dependencies installed in your backend project:
// npm install express mongoose bcryptjs jsonwebtoken dotenv cors

// 2. Make sure your .env file is set up in your main server directory:
// MONGO_URL="YOUR_MONGODB_CONNECTION_STRING_HERE"
// JWT_SECRET="YOUR_SUPER_SECRET_KEY" // Use a strong, random string

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// dotenv is typically loaded in the main server.js, but included here for clarity
require('dotenv').config();

const router = express.Router(); // Create an Express Router

const MONGO_URL = process.env.MONGO_URL; // MONGO_URL is needed for schema definitions if models are defined here
const JWT_SECRET = process.env.JWT_SECRET;

// --- Mongoose Schemas and Models ---

// User Schema
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    registeredAt: { type: Date, default: Date.now }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

const User = mongoose.model('User', UserSchema);

// Prayer Data Schema
const PrayerDataSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    fajr: { type: Boolean, default: false },
    dhuhr: { type: Boolean, default: false },
    asr: { type: Boolean, default: false },
    maghrib: { type: Boolean, default: false },
    isha: { type: Boolean, default: false },
    updatedAt: { type: Date, default: Date.now }
});

// Ensure unique prayer data per user per day
PrayerDataSchema.index({ userId: 1, date: 1 }, { unique: true });

const PrayerData = mongoose.model('PrayerData', PrayerDataSchema);

// --- Authentication Middleware ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) return res.status(401).json({ message: 'Authentication token required' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid or expired token' });
        req.user = user; // Attach user payload to request
        next();
    });
};

// --- API Routes (attached to the router) ---

// Register User
router.post('/auth/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const newUser = new User({ username, password });
        await newUser.save();

        const token = jwt.sign({ userId: newUser._id, username: newUser.username }, JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ message: 'User registered successfully', token, userId: newUser._id, username: newUser.username });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Login User
router.post('/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'Logged in successfully', token, userId: user._id, username: user.username });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Get Prayer Data for a User (for a specific date or all)
router.get('/prayers/:userId', authenticateToken, async (req, res) => {
    // Ensure the requested userId matches the authenticated user's ID
    if (req.user.userId.toString() !== req.params.userId) { // Convert ObjectId to string for comparison
        return res.status(403).json({ message: 'Unauthorized access to prayer data' });
    }
    const { userId } = req.params;
    const { date } = req.query; // Optional: get data for a specific date

    try {
        let query = { userId };
        if (date) {
            query.date = date;
            const prayer = await PrayerData.findOne(query);
            return res.status(200).json(prayer || {}); // Return empty object if no data for date
        } else {
            // Fetch all prayer data for the user, format as { 'YYYY-MM-DD': {fajr: true, ...} }
            const prayers = await PrayerData.find(query);
            const formattedData = {};
            prayers.forEach(p => {
                formattedData[p.date] = {
                    fajr: p.fajr,
                    dhuhr: p.dhuhr,
                    asr: p.asr,
                    maghrib: p.maghrib,
                    isha: p.isha
                };
            });
            return res.status(200).json(formattedData);
        }
    } catch (error) {
        console.error('Error fetching prayer data:', error);
        res.status(500).json({ message: 'Server error fetching prayer data' });
    }
});

// Update/Create Prayer Data for a User and Date
router.put('/prayers/:userId/:date', authenticateToken, async (req, res) => {
    if (req.user.userId.toString() !== req.params.userId) { // Convert ObjectId to string for comparison
        return res.status(403).json({ message: 'Unauthorized to update this prayer data' });
    }
    const { userId, date } = req.params;
    const { fajr, dhuhr, asr, maghrib, isha } = req.body;

    try {
        const updatedPrayer = await PrayerData.findOneAndUpdate(
            { userId, date },
            { fajr, dhuhr, asr, maghrib, isha, updatedAt: Date.now() },
            { new: true, upsert: true } // Create if not exists, return new document
        );
        res.status(200).json({ message: 'Prayer data updated successfully', data: updatedPrayer });
    } catch (error) {
        console.error('Error updating prayer data:', error);
        res.status(500).json({ message: 'Server error updating prayer data' });
    }
});

module.exports = router; // Export the router
