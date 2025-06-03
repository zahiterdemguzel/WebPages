// server.js
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors'); // Required for cross-origin requests from your client
const path = require('path'); // Import the path module
require('dotenv').config(); // To load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL; // Your MongoDB Cluster connection string
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey'; // Change this to a strong, random secret!

// --- Middleware ---
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Enable JSON body parsing for incoming requests

// Serve static files from the 'public' directory
// Make sure your index.html is inside a folder named 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve the index.html file for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// --- MongoDB Connection ---
mongoose.connect(MONGO_URL)
    .then(() => console.log('MongoDB Connected Successfully!'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- Mongoose Schemas and Models ---

// User Schema
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // Optional: You could add a username field if you want it separate from email
    // username: { type: String, unique: true, sparse: true } 
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

const User = mongoose.model('User', UserSchema);

// Prayer Data Schema
// Stores prayer status for each day for a given user
const PrayerDataSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, //YYYY-MM-DD format
    prayers: { type: Map, of: Boolean, default: {} } // e.g., { "Fajr": true, "Dhuhr": false, "Duha": true }
}, { timestamps: true });

// Ensure unique combination of userId and date
PrayerDataSchema.index({ userId: 1, date: 1 }, { unique: true });

const PrayerData = mongoose.model('PrayerData', PrayerDataSchema);

// User Settings Schema
const UserSettingsSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    optionalPrayers: { type: [String], default: [] } // Array of custom optional prayer names
}, { timestamps: true });

const UserSettings = mongoose.model('UserSettings', UserSettingsSchema);

// --- Authentication Middleware ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ message: 'Authentication token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user; // Attach user payload to request
        next();
    });
};

// --- API Routes ---

// User Registration
app.post('/api/auth/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already registered.' });
        }

        const newUser = new User({ email, password });
        await newUser.save();

        // Create initial settings for the new user
        const newSettings = new UserSettings({ userId: newUser._id, optionalPrayers: [] });
        await newSettings.save();

        // Log in the user immediately after registration
        const token = jwt.sign({ userId: newUser._id, email: newUser.email }, JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ 
            message: 'User registered successfully. Logged in.', 
            token, 
            userId: newUser._id, 
            email: newUser.email 
        });

    } catch (error) {
        console.error('Registration error:', error);
        // Handle Mongoose validation errors or other issues
        if (error.code === 11000) { // Duplicate key error
            return res.status(409).json({ message: 'Email already registered.' });
        }
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ 
            message: 'Logged in successfully.', 
            token, 
            userId: user._id, 
            email: user.email 
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// Get all prayer data for a user
app.get('/api/prayers/:userId', authenticateToken, async (req, res) => {
    // Ensure the requested userId matches the authenticated user's userId
    if (req.user.userId !== req.params.userId) {
        return res.status(403).json({ message: 'Unauthorized access to prayer data.' });
    }

    try {
        const prayers = await PrayerData.find({ userId: req.params.userId });
        // Transform data into the { "YYYY-MM-DD": { prayers: { ... } } } format
        const formattedPrayers = prayers.reduce((acc, curr) => {
            acc[curr.date] = curr.prayers;
            return acc;
        }, {});
        res.status(200).json(formattedPrayers);
    } catch (error) {
        console.error('Error fetching prayer data:', error);
        res.status(500).json({ message: 'Server error fetching prayer data.' });
    }
});

// Update/Set prayer data for a specific date
app.put('/api/prayers/:userId/:date', authenticateToken, async (req, res) => {
    // Ensure the requested userId matches the authenticated user's userId
    if (req.user.userId !== req.params.userId) {
        return res.status(403).json({ message: 'Unauthorized access to prayer data.' });
    }

    const { userId, date } = req.params;
    const prayers = req.body; // Expects an object like { "Fajr": true, "Dhuhr": false }

    if (!prayers || typeof prayers !== 'object') {
        return res.status(400).json({ message: 'Invalid prayer data provided.' });
    }

    try {
        const updatedPrayerData = await PrayerData.findOneAndUpdate(
            { userId: userId, date: date },
            { $set: { prayers: prayers } }, // Use $set to update the 'prayers' map
            { upsert: true, new: true } // Create if not exists, return updated document
        );
        res.status(200).json({ message: 'Prayer data updated successfully.', data: updatedPrayerData });
    } catch (error) {
        console.error('Error updating prayer data:', error);
        res.status(500).json({ message: 'Server error updating prayer data.' });
    }
});

// Get user settings
app.get('/api/settings/:userId', authenticateToken, async (req, res) => {
    // Ensure the requested userId matches the authenticated user's userId
    if (req.user.userId !== req.params.userId) {
        return res.status(403).json({ message: 'Unauthorized access to settings.' });
    }

    try {
        const settings = await UserSettings.findOne({ userId: req.params.userId });
        if (!settings) {
            // If no settings found, return default empty settings
            return res.status(200).json({ optionalPrayers: [] });
        }
        res.status(200).json(settings);
    } catch (error) {
        console.error('Error fetching user settings:', error);
        res.status(500).json({ message: 'Server error fetching user settings.' });
    }
});

// Update user settings
app.put('/api/settings/:userId', authenticateToken, async (req, res) => {
    // Ensure the requested userId matches the authenticated user's userId
    if (req.user.userId !== req.params.userId) {
        return res.status(403).json({ message: 'Unauthorized access to settings.' });
    }

    const { userId } = req.params;
    const { optionalPrayers } = req.body; // Expects { optionalPrayers: ["Duha", "Witr"] }

    if (!Array.isArray(optionalPrayers)) {
        return res.status(400).json({ message: 'Invalid optionalPrayers format. Expected an array.' });
    }

    try {
        const updatedSettings = await UserSettings.findOneAndUpdate(
            { userId: userId },
            { $set: { optionalPrayers: optionalPrayers } },
            { upsert: true, new: true }
        );
        res.status(200).json({ message: 'User settings updated successfully.', data: updatedSettings });
    } catch (error) {
        console.error('Error updating user settings:', error);
        res.status(500).json({ message: 'Server error updating user settings.' });
    }
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access client at: http://localhost:${PORT}/index.html (if serving static files)`);
});
