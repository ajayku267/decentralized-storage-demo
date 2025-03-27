module.exports = {
  // Server ports
  HTTP_PORT: process.env.HTTP_PORT || 3000,
  HTTPS_PORT: process.env.HTTPS_PORT || 3443,
  WS_PORT: process.env.WS_PORT || 3001,

  // Blockchain ports
  ETHEREUM_RPC_PORT: process.env.ETHEREUM_RPC_PORT || 8545,
  IPFS_HTTP_PORT: process.env.IPFS_HTTP_PORT || 5001,
  IPFS_WS_PORT: process.env.IPFS_WS_PORT || 5002,

  // Database ports
  MONGODB_PORT: process.env.MONGODB_PORT || 27017,
  REDIS_PORT: process.env.REDIS_PORT || 6379,

  // Service ports
  STORAGE_SERVICE_PORT: process.env.STORAGE_SERVICE_PORT || 3002,
  AUTH_SERVICE_PORT: process.env.AUTH_SERVICE_PORT || 3003,
  OPTIMIZER_SERVICE_PORT: process.env.OPTIMIZER_SERVICE_PORT || 3004,

  // Development ports
  DEV_SERVER_PORT: process.env.DEV_SERVER_PORT || 3005,
  TEST_SERVER_PORT: process.env.TEST_SERVER_PORT || 3006,
}; 