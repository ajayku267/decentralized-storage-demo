const mongoose = require('mongoose');

const ProviderSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
    unique: true
  },
  totalSpace: {
    type: Number,
    required: true
  },
  usedSpace: {
    type: Number,
    default: 0
  },
  availableSpace: {
    type: Number,
    required: true
  },
  stakedAmount: {
    type: String,
    required: true
  },
  reputationScore: {
    type: Number,
    default: 50
  },
  isActive: {
    type: Boolean,
    default: true
  },
  fileCount: {
    type: Number,
    default: 0
  },
  rewards: {
    type: String,
    default: "0"
  },
  stakingTimestamp: {
    type: Date,
    default: Date.now
  },
  lastRewardClaimTimestamp: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  nodeInfo: {
    ipAddress: {
      type: String,
      default: null
    },
    port: {
      type: Number,
      default: null
    },
    url: {
      type: String,
      default: null
    },
    region: {
      type: String,
      default: null
    }
  },
  performanceMetrics: {
    uptime: {
      type: Number,
      default: 100
    },
    responseTime: {
      type: Number,
      default: 0
    },
    retrievalSuccess: {
      type: Number,
      default: 100
    },
    failedRetrievals: {
      type: Number,
      default: 0
    }
  }
});

// Indexes for better query performance
ProviderSchema.index({ address: 1 });
ProviderSchema.index({ isActive: 1 });
ProviderSchema.index({ reputationScore: -1 });

module.exports = mongoose.model('Provider', ProviderSchema); 