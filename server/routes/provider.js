const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const blockchainService = require('../services/blockchainService');
const Provider = require('../models/Provider');

// Import authentication middleware
const { auth, apiKeyAuth, skipAuth } = require('../middleware/auth');

// For development, use skipAuth
// In production, switch to the appropriate auth middleware
const authMiddleware = process.env.NODE_ENV === 'production' ? apiKeyAuth : skipAuth;

/**
 * @route   GET /api/providers
 * @desc    Get all active storage providers
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // Get providers from blockchain
    let providers = [];
    try {
      providers = await blockchainService.getActiveProviders();
    } catch (error) {
      console.error('Error getting providers from blockchain:', error);
      // If blockchain fails, use database as fallback
      console.log('Falling back to database for providers');
    }
    
    // If no providers from blockchain, get from database
    if (providers.length === 0) {
      const dbProviders = await Provider.find({ isActive: true });
      providers = dbProviders.map(p => p.address);
    }
    
    // Get details for each provider
    const providerDetails = [];
    for (const address of providers) {
      try {
        // Try to get provider details from blockchain
        const details = await blockchainService.getProviderDetails(address);
        providerDetails.push({
          address,
          name: details.name || 'Unknown Provider',
          totalSpace: details.totalSpace.toString(),
          usedSpace: details.usedSpace.toString(),
          availableSpace: details.availableSpace.toString(),
          reputation: details.reputation.toString(),
          isActive: details.isActive,
          timestamp: new Date(Number(details.timestamp) * 1000).toISOString()
        });
      } catch (error) {
        console.error(`Error getting details for provider ${address}:`, error);
        
        // If blockchain fails, use database as fallback
        const dbProvider = await Provider.findOne({ address });
        if (dbProvider) {
          providerDetails.push({
            address,
            name: dbProvider.name || 'Unknown Provider',
            totalSpace: dbProvider.totalSpace.toString(),
            usedSpace: dbProvider.usedSpace.toString(),
            availableSpace: dbProvider.availableSpace.toString(),
            reputation: dbProvider.reputation.toString(),
            isActive: dbProvider.isActive,
            timestamp: dbProvider.updatedAt.toISOString()
          });
        }
      }
    }
    
    // If no providers found at all, create mock providers
    if (providerDetails.length === 0) {
      providerDetails.push({
        address: '0xMockProvider1',
        name: 'Demo Provider 1',
        totalSpace: '1073741824', // 1GB
        usedSpace: '536870912', // 512MB
        availableSpace: '536870912', // 512MB
        reputation: '95',
        isActive: true,
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      providers: providerDetails
    });
  } catch (error) {
    console.error('Error getting providers:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/providers/register
 * @desc    Register as a storage provider
 * @access  Private
 */
router.post(
  '/register',
  authMiddleware, // Apply authentication middleware for this sensitive operation
  [
    check('address', 'Address is required').isEthereumAddress(),
    check('totalSpace', 'Total space is required').isNumeric(),
    check('name', 'Name is required').notEmpty()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { address, totalSpace, name, privateKey } = req.body;
      
      // Register on blockchain
      let result;
      try {
        result = await blockchainService.registerProvider(address, totalSpace, name, privateKey);
        console.log('Provider registered on blockchain:', result);
      } catch (error) {
        console.error('Error registering provider on blockchain:', error);
        // Continue anyway to save in database
      }
      
      // Save to database
      let provider = await Provider.findOne({ address });
      
      if (provider) {
        // Update existing provider
        provider.name = name;
        provider.totalSpace = totalSpace;
        provider.isActive = true;
        provider.updatedAt = new Date();
      } else {
        // Create new provider
        provider = new Provider({
          address,
          name,
          totalSpace,
          usedSpace: 0,
          isActive: true
        });
      }
      
      await provider.save();
      
      res.json({
        success: true,
        provider: {
          address,
          name,
          totalSpace,
          usedSpace: provider.usedSpace.toString(),
          availableSpace: (totalSpace - provider.usedSpace).toString(),
          reputation: provider.reputation.toString(),
          isActive: provider.isActive,
          timestamp: provider.updatedAt.toISOString()
        },
        transactionHash: result ? result.transactionHash : null
      });
    } catch (error) {
      console.error('Error registering provider:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @route   PUT /api/providers/:address/status
 * @desc    Update provider status (active/inactive)
 * @access  Private
 */
router.put(
  '/:address/status',
  authMiddleware, // Apply authentication middleware for this sensitive operation
  [
    check('isActive', 'isActive must be a boolean').isBoolean(),
    check('privateKey', 'Private key is required').exists()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { address } = req.params;
      const { isActive, privateKey } = req.body;
      
      // Update on blockchain
      let result;
      try {
        result = await blockchainService.updateProviderStatus(address, isActive, privateKey);
      } catch (error) {
        console.error('Error updating provider status on blockchain:', error);
        // Continue anyway to update database
      }
      
      // Update in database
      const provider = await Provider.findOne({ address });
      
      if (!provider) {
        return res.status(404).json({ message: 'Provider not found' });
      }
      
      provider.isActive = isActive;
      provider.updatedAt = new Date();
      await provider.save();
      
      res.json({
        success: true,
        provider: {
          address,
          name: provider.name,
          isActive,
          updatedAt: provider.updatedAt.toISOString()
        },
        transactionHash: result ? result.transactionHash : null
      });
    } catch (error) {
      console.error('Error updating provider status:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @route   GET /api/providers/:address
 * @desc    Get a storage provider by address
 * @access  Public
 */
router.get('/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    // Get provider from database
    const provider = await Provider.findOne({ address });
    
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    
    // Get blockchain info
    const blockchainInfo = await blockchainService.getProviderDetails(address);
    
    res.json({
      success: true,
      provider: {
        address: provider.address,
        totalSpace: provider.totalSpace,
        availableSpace: provider.availableSpace,
        stakedAmount: provider.stakedAmount,
        reputationScore: provider.reputationScore,
        isActive: provider.isActive,
        fileCount: provider.fileCount,
        nodeInfo: provider.nodeInfo,
        rewards: blockchainInfo.pendingRewards.toString(),
        performanceMetrics: provider.performanceMetrics
      }
    });
  } catch (error) {
    console.error('Error getting provider:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/providers/:address/claim-rewards
 * @desc    Claim rewards for a provider
 * @access  Public
 */
router.post(
  '/:address/claim-rewards',
  [
    check('privateKey', 'Private key is required').exists()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { address } = req.params;
      const { privateKey } = req.body;
      
      // Check if provider exists
      const provider = await Provider.findOne({ address });
      
      if (!provider) {
        return res.status(404).json({ message: 'Provider not found' });
      }
      
      // Get staking contract with signer
      const stakingContract = blockchainService.getContractWithSigner('stakingContract', privateKey);
      
      // Claim rewards
      const tx = await stakingContract.claimRewards();
      const receipt = await tx.wait();
      
      // Get reward amount from event logs
      const rewardPaidEvent = receipt.logs
        .map(log => {
          try {
            return stakingContract.interface.parseLog(log);
          } catch (e) {
            return null;
          }
        })
        .filter(parsed => parsed && parsed.name === 'RewardPaid')
        .pop();
      
      if (!rewardPaidEvent) {
        return res.status(400).json({ message: 'No rewards claimed' });
      }
      
      const rewardAmount = rewardPaidEvent.args[1];
      
      // Update provider in database
      provider.lastRewardClaimTimestamp = Date.now();
      await provider.save();
      
      res.json({
        success: true,
        rewardAmount: rewardAmount.toString(),
        transactionHash: receipt.hash
      });
    } catch (error) {
      console.error('Error claiming rewards:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @route   POST /api/providers/:address/update-metrics
 * @desc    Update performance metrics for a provider
 * @access  Public
 */
router.post(
  '/:address/update-metrics',
  [
    check('uptime', 'Uptime is required').optional().isNumeric(),
    check('responseTime', 'Response time is required').optional().isNumeric(),
    check('retrievalSuccess', 'Retrieval success is required').optional().isNumeric(),
    check('failedRetrievals', 'Failed retrievals is required').optional().isNumeric()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { address } = req.params;
      const { uptime, responseTime, retrievalSuccess, failedRetrievals } = req.body;
      
      // Check if provider exists
      const provider = await Provider.findOne({ address });
      
      if (!provider) {
        return res.status(404).json({ message: 'Provider not found' });
      }
      
      // Update metrics
      if (uptime !== undefined) {
        provider.performanceMetrics.uptime = uptime;
      }
      
      if (responseTime !== undefined) {
        provider.performanceMetrics.responseTime = responseTime;
      }
      
      if (retrievalSuccess !== undefined) {
        provider.performanceMetrics.retrievalSuccess = retrievalSuccess;
      }
      
      if (failedRetrievals !== undefined) {
        provider.performanceMetrics.failedRetrievals = failedRetrievals;
      }
      
      // Calculate reputation score based on metrics
      const uptimeWeight = 0.4;
      const responseTimeWeight = 0.2;
      const retrievalSuccessWeight = 0.4;
      
      // Map response time to a 0-100 score (lower is better, assuming milliseconds)
      // 0ms = 100, 1000ms = 0
      const responseTimeScore = Math.max(0, 100 - (responseTime / 10));
      
      provider.reputationScore = Math.round(
        (provider.performanceMetrics.uptime * uptimeWeight) +
        (responseTimeScore * responseTimeWeight) +
        (provider.performanceMetrics.retrievalSuccess * retrievalSuccessWeight)
      );
      
      await provider.save();
      
      res.json({
        success: true,
        performanceMetrics: provider.performanceMetrics,
        reputationScore: provider.reputationScore
      });
    } catch (error) {
      console.error('Error updating metrics:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router; 