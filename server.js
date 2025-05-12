/**
 * Main server file
 * Sets up the Express server, connects to the MongoDB database,
 * and configures routes and middleware
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

/** Import routes */
const test1Routes = require('./routes/test1Routes');
const test2Routes = require('./routes/test2Routes');
const userRoutes = require('./routes/userRoutes');
const qrcodeOrderRoutes = require('./routes/qrcodeOrderRoutes');

/** Initialize Express */
const app = express();
/** use http server */
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

/** send io to routes */
app.set('io', io);

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
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    /** initial table number */
    const Table = require('./models/table');
    for (let i = 1; i <= 10; i++) {
      const tableNumber = i.toString();
      const existingTable = await Table.findOne({ tableNumber });
      if (!existingTable) {
        await Table.create({ tableNumber, status: 'available', qrCodeUrl: null });
        console.log(`✅ 桌號 ${tableNumber} 初始化完成`);
      }
    }
    console.log('✅ 所有桌號初始化完成');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1); // Stop server if database connection fails
  });

/** Use routes */
app.use('/test1', test1Routes);
app.use('/test2', test2Routes);
app.use('/users', userRoutes);
app.use('/qrcodeOrder', qrcodeOrderRoutes);

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
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
