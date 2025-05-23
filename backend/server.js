const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartpark');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/parking-slots', require('./routes/parkingSlots'));
app.use('/api/cars', require('./routes/cars'));
app.use('/api/parking-records', require('./routes/parkingRecords'));
app.use('/api/payments', require('./routes/payments'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    message: 'SmartPark API is running',
    timestamp: new Date().toISOString(),
    company: 'SmartPark - Rubavu District, West Province, Rwanda'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

// Connect to database and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`SmartPark server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
});
