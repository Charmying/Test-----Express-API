/**
 * Main server file
 * Sets up the Express server, connects to the MongoDB database,
 * and configures routes and middleware
 */

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

/** Import routes */
const test1Routes = require('./routes/test1Routes');
const test2Routes = require('./routes/test2Routes');
const userRoutes = require('./routes/userRoutes');

/** Initialize Express */
const app = express();

/** Middleware */
app.use(cors()); // Allow cross-origin requests
app.use(bodyParser.json()); // Parse JSON
app.use(express.static(path.join(__dirname, 'pages'))); // Serve static files

/** Get MongoDB URI from environment variables */
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌ Missing MONGO_URI in environment variables.');
  process.exit(1); // Stop server if MongoDB URI is missing
}

/** Connect to MongoDB */
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1); // Stop server if database connection fails
  });

/** Use routes */
app.use('/test1', test1Routes);
app.use('/test2', test2Routes);
app.use('/users', userRoutes);

// Set up homepage route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});

// Set up login page route
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'login', 'login.html'));
});

// Set up registration page route
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'register', 'register.html'));
});

// Set up profile page route
app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'profile', 'profile.html'));
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
