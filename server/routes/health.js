const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const os = require('os');
const logger = require('../utils/logger');
const ipfsService = require('../services/ipfsService');
const blockchainService = require('../services/blockchainService');

/**
 * @route   GET /api/health
 * @desc    Basic health check
 * @access  Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

/**
 * @route   GET /api/health/detailed
 * @desc    Detailed health check of all services
 * @access  Public
 */
router.get('/detailed', async (req, res) => {
  // Initialize health status object
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    host: os.hostname(),
    services: {
      server: {
        status: 'ok',
        memory: {
          total: os.totalmem(),
          free: os.freemem(),
          used: os.totalmem() - os.freemem()
        },
        cpu: os.loadavg(),
        platform: os.platform(),
        nodeVersion: process.version
      },
      database: {
        status: 'unknown'
      },
      blockchain: {
        status: 'unknown'
      },
      ipfs: {
        status: 'unknown'
      }
    }
  };

  // Check MongoDB connection
  try {
    if (mongoose.connection.readyState === 1) {
      health.services.database = {
        status: 'ok',
        name: 'MongoDB',
        connection: mongoose.connection.host,
        database: mongoose.connection.name
      };
    } else {
      health.services.database = {
        status: 'error',
        name: 'MongoDB',
        state: mongoose.connection.readyState
      };
      health.status = 'degraded';
    }
  } catch (error) {
    logger.error('Health check - Database error:', error);
    health.services.database = {
      status: 'error',
      name: 'MongoDB',
      error: error.message
    };
    health.status = 'degraded';
  }

  // Check Blockchain connection
  try {
    const blockchainInfo = await blockchainService.getNetworkInfo();
    health.services.blockchain = {
      status: 'ok',
      name: blockchainInfo.name,
      chainId: blockchainInfo.chainId,
      network: blockchainInfo.network
    };
  } catch (error) {
    logger.error('Health check - Blockchain error:', error);
    health.services.blockchain = {
      status: 'error',
      error: error.message
    };
    health.status = 'degraded';
  }

  // Check IPFS connection
  try {
    const ipfsInfo = await ipfsService.getNodeInfo();
    health.services.ipfs = {
      status: 'ok',
      version: ipfsInfo.version,
      gatewayUrl: ipfsInfo.gatewayUrl
    };
  } catch (error) {
    logger.error('Health check - IPFS error:', error);
    health.services.ipfs = {
      status: 'error',
      error: error.message
    };
    health.status = 'degraded';
  }

  // If anything is in error state, add a warning
  if (health.status === 'degraded') {
    health.warning = 'One or more services are not functioning correctly';
    health.features = {
      fileUploads: health.services.ipfs.status === 'ok',
      blockchainRegistration: health.services.blockchain.status === 'ok',
      dataPersistence: health.services.database.status === 'ok'
    };
  }

  res.status(200).json(health);
});

/**
 * @route   GET /api/health/readiness
 * @desc    Kubernetes-style readiness probe
 * @access  Public
 */
router.get('/readiness', async (req, res) => {
  // For a readiness probe, we just need to know if the application can serve requests
  const isReady = mongoose.connection.readyState === 1;
  
  if (isReady) {
    return res.status(200).json({ status: 'ready' });
  } else {
    return res.status(503).json({ status: 'not ready', message: 'Database connection not established' });
  }
});

/**
 * @route   GET /api/health/liveness
 * @desc    Kubernetes-style liveness probe
 * @access  Public
 */
router.get('/liveness', (req, res) => {
  // For a liveness probe, we just need to know if the application is running
  res.status(200).json({ status: 'alive' });
});

module.exports = router; 