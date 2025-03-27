require('dotenv').config();
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import path from 'path';
import logger from './utils/logger';
import { getPort, getCorsOptions } from './config/ports.js';

// Import routes
const fileRoutes = require('./routes/file');
const ipfsRoutes = require('./routes/ipfs');
const providerRoutes = require('./routes/provider');
const healthRoutes = require('./routes/health');

// Initialize Express
const app = express();
const port = getPort();

// Middleware
app.use(cors(getCorsOptions()));
app.use(express.json());
app.use(morgan('combined', { stream: logger.stream }));

// Connect to MongoDB (if available)
if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => logger.info('MongoDB connected...'))
    .catch((err) => {
      logger.error('MongoDB connection error:', err.message);
      logger.warn('App will run without persistent database');
    });
} else {
  logger.warn('No MongoDB URI provided, app will run without persistent database');
}

// API Routes
app.use('/api/files', fileRoutes);
app.use('/api/ipfs', ipfsRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/health', healthRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    // Don't serve React app for API routes
    if (req.url.startsWith('/api/')) {
      return res.status(404).json({
        success: false,
        message: 'API endpoint not found'
      });
    }
    res.sendFile(path.resolve(__dirname, '../client', 'build', 'index.html'));
  });

  logger.info('Serving React production build');
}

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Server Error',
  });
});

// Log all environment variables for debugging (only in development)
if (process.env.NODE_ENV !== 'production') {
  logger.debug("Environment variables:", process.env);
}

// Start the server
app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
  logger.info(`API accessible at http://localhost:${port}/api`);
  logger.info(`Health endpoint: http://localhost:${port}/api/health`);
});

module.exports = app; 