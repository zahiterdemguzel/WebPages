// server.js
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // For password hashing

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for all origins (for development)
app.use(express.json()); // Enable JSON body parsing

// MongoDB Connection
const mongoUrl = process.env.MONGO_URL;

if (!mongoUrl) {
    console.error('MONGO_URL environment variable is not set. Please create a .env file.');
    process.exit(1); // Exit the process if MONGO_URL is not configured
}

mongoose.connect(mongoUrl, {
    // useNewUrlParser: true, // Deprecated
    // useUnifiedTopology: true, // Deprecated
    // useCreateIndex: true, // Deprecated
})
.then(() => console.log('MongoDB connected successfully!'))
.catch(err => console.error('MongoDB connection error:', err));

// --- User Schema and Model ---
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);


// --- Notebook Schema and Model ---
const notebookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, default: '' },
    userId: { type: String, required: true }, // This will be the User's _id
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Notebook = mongoose.model('Notebook', notebookSchema);

// Middleware to get user ID from header
function getUserId(req) {
    // This ID should be the MongoDB _id of the authenticated user
    return req.headers['x-user-id'];
}

// --- Authentication API Routes ---

// Register a new user
app.post('/api/auth/register', async (req, res) => {
    const { username, email, password } = req.body;
    console.log(`[POST] /api/auth/register attempt for email: ${email}`);

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please provide username, email, and password.' });
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            console.warn(`[POST] /api/auth/register: User already exists with email: ${email} or username: ${username}`);
            return res.status(409).json({ message: 'User with this email or username already exists.' });
        }

        // Create new user
        const newUser = new User({ username, email, password });
        await newUser.save();

        console.log(`[POST] /api/auth/register: User "${username}" registered successfully.`);
        // Return user info (excluding password)
        res.status(201).json({
            message: 'User registered successfully.',
            user: {
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email
            }
        });
    } catch (err) {
        console.error(`[POST] /api/auth/register error:`, err.message);
        res.status(500).json({ message: 'Server error during registration.', error: err.message });
    }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body; // Or use username for login
    console.log(`[POST] /api/auth/login attempt for email: ${email}`);

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password.' });
    }

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            console.warn(`[POST] /api/auth/login: User not found with email: ${email}`);
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.warn(`[POST] /api/auth/login: Password mismatch for email: ${email}`);
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        console.log(`[POST] /api/auth/login: User "${user.username}" logged in successfully.`);
        // Return user info (excluding password)
        res.status(200).json({
            message: 'Login successful.',
            user: {
                _id: user._id.toString(), // Ensure _id is a string
                username: user.username,
                email: user.email
            }
        });
    } catch (err) {
        console.error(`[POST] /api/auth/login error:`, err.message);
        res.status(500).json({ message: 'Server error during login.', error: err.message });
    }
});


// --- Notebook API Routes ---

// Get all notebooks for a user
app.get('/api/notebooks', async (req, res) => {
    const userId = getUserId(req);
    if (!userId) {
        return res.status(401).json({ message: 'User ID not provided in header.' });
    }
    console.log(`[GET] /api/notebooks requested for userId: ${userId}`);
    try {
        const notebooks = await Notebook.find({ userId: userId }).sort({ updatedAt: -1 });
        console.log(`[GET] /api/notebooks: Found ${notebooks.length} notebooks for userId: ${userId}`);
        res.json(notebooks);
    } catch (err) {
        console.error(`[GET] /api/notebooks error for userId: ${userId}:`, err.message);
        res.status(500).json({ message: err.message });
    }
});

// Get a single notebook by ID
app.get('/api/notebooks/:id', async (req, res) => {
    const userId = getUserId(req);
    if (!userId) {
        return res.status(401).json({ message: 'User ID not provided in header.' });
    }
    const notebookId = req.params.id;
    console.log(`[GET] /api/notebooks/${notebookId} requested for userId: ${userId}`);
    try {
        const notebook = await Notebook.findById(notebookId);
        if (!notebook) {
            console.warn(`[GET] /api/notebooks/${notebookId}: Notebook not found.`);
            return res.status(404).json({ message: 'Notebook not found' });
        }
        // Verify userId matches for authorization
        if (notebook.userId !== userId) {
            console.warn(`[GET] /api/notebooks/${notebookId}: Unauthorized access for userId: ${userId}. Notebook belongs to ${notebook.userId}`);
            return res.status(403).json({ message: 'Unauthorized access to this notebook.' });
        }
        console.log(`[GET] /api/notebooks/${notebookId}: Successfully retrieved notebook for userId: ${userId}`);
        res.json(notebook);
    } catch (err) {
        console.error(`[GET] /api/notebooks/${notebookId} error for userId: ${userId}:`, err.message);
        res.status(500).json({ message: err.message });
    }
});

// Create a new notebook
app.post('/api/notebooks', async (req, res) => {
    const userId = getUserId(req);
    if (!userId) {
        return res.status(401).json({ message: 'User ID not provided in header.' });
    }
    const { title, content } = req.body;
    console.log(`[POST] /api/notebooks requested by userId: ${userId} with title: "${title}"`);
    const newNotebook = new Notebook({
        title,
        content,
        userId: userId, // Ensure this is the authenticated user's ID
    });

    try {
        const savedNotebook = await newNotebook.save();
        console.log(`[POST] /api/notebooks: Notebook "${savedNotebook.title}" created successfully for userId: ${userId}`);
        res.status(201).json(savedNotebook);
    } catch (err) {
        console.error(`[POST] /api/notebooks error for userId: ${userId}:`, err.message);
        res.status(400).json({ message: err.message });
    }
});

// Update a notebook
app.put('/api/notebooks/:id', async (req, res) => {
    const userId = getUserId(req);
    if (!userId) {
        return res.status(401).json({ message: 'User ID not provided in header.' });
    }
    const notebookId = req.params.id;
    const { title, content } = req.body;
    console.log(`[PUT] /api/notebooks/${notebookId} requested by userId: ${userId} with new title: "${title}"`);
    try {
        const updatedNotebook = await Notebook.findById(notebookId);

        if (!updatedNotebook) {
            console.warn(`[PUT] /api/notebooks/${notebookId}: Notebook not found.`);
            return res.status(404).json({ message: 'Notebook not found' });
        }

        // Verify userId matches for authorization
        if (updatedNotebook.userId !== userId) {
            console.warn(`[PUT] /api/notebooks/${notebookId}: Unauthorized access for userId: ${userId}. Notebook belongs to ${updatedNotebook.userId}`);
            return res.status(403).json({ message: 'Unauthorized access to this notebook.' });
        }

        updatedNotebook.title = title !== undefined ? title : updatedNotebook.title;
        updatedNotebook.content = content !== undefined ? content : updatedNotebook.content;
        updatedNotebook.updatedAt = Date.now();

        const savedNotebook = await updatedNotebook.save();
        console.log(`[PUT] /api/notebooks/${notebookId}: Notebook "${savedNotebook.title}" updated successfully for userId: ${userId}`);
        res.json(savedNotebook);
    } catch (err) {
        console.error(`[PUT] /api/notebooks/${notebookId} error for userId: ${userId}:`, err.message);
        res.status(400).json({ message: err.message });
    }
});

// Delete a notebook
app.delete('/api/notebooks/:id', async (req, res) => {
    const userId = getUserId(req);
    if (!userId) {
        return res.status(401).json({ message: 'User ID not provided in header.' });
    }
    const notebookId = req.params.id;
    console.log(`[DELETE] /api/notebooks/${notebookId} requested by userId: ${userId}`);
    try {
        const notebookToDelete = await Notebook.findById(notebookId);
        if (!notebookToDelete) {
            console.warn(`[DELETE] /api/notebooks/${notebookId}: Notebook not found.`);
            return res.status(404).json({ message: 'Notebook not found' });
        }

        // Verify userId matches for authorization
        if (notebookToDelete.userId !== userId) {
            console.warn(`[DELETE] /api/notebooks/${notebookId}: Unauthorized access for userId: ${userId}. Notebook belongs to ${notebookToDelete.userId}`);
            return res.status(403).json({ message: 'Unauthorized access to this notebook.' });
        }

        await Notebook.deleteOne({ _id: notebookId });
        console.log(`[DELETE] /api/notebooks/${notebookId}: Notebook deleted successfully for userId: ${userId}`);
        res.json({ message: 'Notebook deleted' });
    } catch (err) {
        console.error(`[DELETE] /api/notebooks/${notebookId} error for userId: ${userId}:`, err.message);
        res.status(500).json({ message: err.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
