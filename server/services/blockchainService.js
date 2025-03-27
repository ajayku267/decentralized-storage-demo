const { ethers } = require('ethers');
const path = require('path');
const fs = require('fs');

// Default mock ABIs for development without compiled contracts
const DEFAULT_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)"
];

const DEFAULT_FILE_STORAGE_ABI = [
  "function uploadFile(string cid, uint256 size, string name, string fileType, bool isPrivate) returns (uint256)",
  "function getFileDetails(uint256 fileId) view returns (string, address, uint256, uint256, bool, string, string)",
  "function checkAccess(uint256 fileId, address user) view returns (bool)",
  "function grantAccess(uint256 fileId, address user)",
  "function revokeAccess(uint256 fileId, address user)",
  "function getUserFiles(address user) view returns (uint256[])",
  "event FileUploaded(uint256 indexed fileId, address indexed owner, string cid, uint256 size)"
];

// Load contract ABIs safely
let storageTokenAbi, fileStorageAbi, stakingContractAbi;

try {
  storageTokenAbi = require('../../artifacts/contracts/StorageToken.sol/StorageToken.json').abi;
} catch (error) {
  console.warn('StorageToken ABI not found, using mock ABI');
  storageTokenAbi = DEFAULT_ABI;
}

try {
  fileStorageAbi = require('../../artifacts/contracts/FileStorage.sol/FileStorage.json').abi;
} catch (error) {
  console.warn('FileStorage ABI not found, using mock ABI');
  fileStorageAbi = DEFAULT_FILE_STORAGE_ABI;
}

try {
  stakingContractAbi = require('../../artifacts/contracts/StakingContract.sol/StakingContract.json').abi;
} catch (error) {
  console.warn('StakingContract ABI not found, using mock ABI');
  stakingContractAbi = DEFAULT_ABI;
}

// Load deployed contract addresses (in a real app, these would be in a database or config file)
let contractAddresses;
try {
  const deploymentPath = path.join(__dirname, '../../deployment.json');
  if (fs.existsSync(deploymentPath)) {
    contractAddresses = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  } else {
    contractAddresses = {
      storageToken: process.env.STORAGE_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000',
      fileStorage: process.env.FILE_STORAGE_ADDRESS || '0x0000000000000000000000000000000000000000',
      stakingContract: process.env.STAKING_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
    };
  }
} catch (error) {
  console.error('Error loading contract addresses:', error);
  contractAddresses = {
    storageToken: process.env.STORAGE_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000',
    fileStorage: process.env.FILE_STORAGE_ADDRESS || '0x0000000000000000000000000000000000000000',
    stakingContract: process.env.STAKING_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
  };
}

// Set up provider
const getRpcUrl = () => {
  const network = process.env.NETWORK || 'localhost';
  
  switch (network) {
    case 'localhost':
      return 'http://localhost:8545';
    case 'sepolia':
      return process.env.SEPOLIA_RPC_URL;
    case 'mumbai':
      return process.env.MUMBAI_RPC_URL;
    default:
      return 'http://localhost:8545';
  }
};

let provider;
try {
  provider = new ethers.JsonRpcProvider(getRpcUrl());
} catch (error) {
  console.error('Error connecting to blockchain:', error);
}

// Check for required environment variables
function validatePrivateKey(privateKey) {
  // Check if private key is provided
  if (!privateKey) {
    throw new Error('Private key is required');
  }
  
  // Check that private key is not the zero key (common test key)
  if (privateKey === '0x0000000000000000000000000000000000000000000000000000000000000000') {
    throw new Error('Invalid private key: zero key');
  }
  
  // Check that private key is not a well-known test key
  const wellKnownTestKeys = [
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', // Hardhat default #0
    '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d', // Hardhat default #1
    '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a'  // Hardhat default #2
  ];
  
  if (wellKnownTestKeys.includes(privateKey)) {
    throw new Error('Invalid private key: Using a well-known test key in production is not allowed');
  }
  
  return true;
}

// Initialize the admin wallet more securely
const initializeWallet = () => {
  try {
    // Only access the private key from environment variable
    const privateKey = process.env.PRIVATE_KEY;
    
    // Validate in production mode
    if (process.env.NODE_ENV === 'production') {
      validatePrivateKey(privateKey);
    }
    
    // If no private key provided, create a random wallet for read-only operations
    if (!privateKey) {
      console.warn('No private key provided. Creating random wallet for read-only operations.');
      return ethers.Wallet.createRandom().connect(provider);
    }
    
    return new ethers.Wallet(privateKey, provider);
  } catch (error) {
    console.error('Failed to initialize wallet:', error.message);
    // In production, we don't want to crash the app, but we do want to log the error
    // and return a read-only wallet
    if (process.env.NODE_ENV === 'production') {
      console.warn('Using random wallet for read-only operations due to error.');
      return ethers.Wallet.createRandom().connect(provider);
    } else {
      throw error;
    }
  }
};

// Admin wallet (for server-side operations)
let adminWallet;
try {
  adminWallet = initializeWallet();
  console.log('Admin wallet created successfully');
} catch (error) {
  console.error('Error creating admin wallet:', error);
  console.warn('Admin operations will not be available');
}

// Contract instances
let storageToken, fileStorage, stakingContract;

try {
  if (provider && contractAddresses.storageToken) {
    storageToken = new ethers.Contract(contractAddresses.storageToken, storageTokenAbi, provider);
  }
  
  if (provider && contractAddresses.fileStorage) {
    fileStorage = new ethers.Contract(contractAddresses.fileStorage, fileStorageAbi, provider);
  }
  
  if (provider && contractAddresses.stakingContract) {
    stakingContract = new ethers.Contract(contractAddresses.stakingContract, stakingContractAbi, provider);
  }
  
  // Connect admin wallet to contracts for write operations
  if (adminWallet) {
    if (storageToken) storageToken = storageToken.connect(adminWallet);
    if (fileStorage) fileStorage = fileStorage.connect(adminWallet);
    if (stakingContract) stakingContract = stakingContract.connect(adminWallet);
  }
} catch (error) {
  console.error('Error initializing contracts:', error);
}

/**
 * Get contract instance with signer
 * @param {String} contractName - Name of the contract (storageToken, fileStorage, stakingContract)
 * @param {String} signerPrivateKey - Private key to sign transactions
 * @returns {ethers.Contract} - Contract instance connected to signer
 */
const getContractWithSigner = (contractName, signerPrivateKey) => {
  if (!provider) throw new Error('Provider not initialized');
  
  const signer = new ethers.Wallet(signerPrivateKey, provider);
  
  switch (contractName) {
    case 'storageToken':
      if (!contractAddresses.storageToken) throw new Error('StorageToken address not set');
      return new ethers.Contract(contractAddresses.storageToken, storageTokenAbi, signer);
    
    case 'fileStorage':
      if (!contractAddresses.fileStorage) throw new Error('FileStorage address not set');
      return new ethers.Contract(contractAddresses.fileStorage, fileStorageAbi, signer);
    
    case 'stakingContract':
      if (!contractAddresses.stakingContract) throw new Error('StakingContract address not set');
      return new ethers.Contract(contractAddresses.stakingContract, stakingContractAbi, signer);
    
    default:
      throw new Error(`Unknown contract: ${contractName}`);
  }
};

/**
 * Upload a file to the blockchain
 * @param {String} cid - IPFS content identifier
 * @param {Number} size - File size in bytes
 * @param {String} name - File name
 * @param {String} fileType - File type
 * @param {Boolean} isPrivate - Whether the file is private
 * @param {String} userAddress - User's Ethereum address
 * @returns {Object} - Transaction result
 */
const uploadFile = async (cid, size, name, fileType, isPrivate, userAddress) => {
  if (!fileStorage) throw new Error('FileStorage contract not initialized');
  
  // In a real app, you'd use the user's wallet or a meta-transaction approach
  // Here we're using the admin wallet for simplicity
  try {
    const tx = await fileStorage.uploadFile(cid, size, name, fileType, isPrivate);
    const receipt = await tx.wait();
    
    // Get the file ID from the event logs
    const fileUploadedEvent = receipt.logs
      .map(log => {
        try {
          return fileStorage.interface.parseLog(log);
        } catch (e) {
          return null;
        }
      })
      .filter(parsed => parsed && parsed.name === 'FileUploaded')
      .pop();
    
    if (!fileUploadedEvent) {
      throw new Error('FileUploaded event not found in transaction logs');
    }
    
    return {
      fileId: fileUploadedEvent.args[0],
      owner: fileUploadedEvent.args[1],
      cid: fileUploadedEvent.args[2],
      size: fileUploadedEvent.args[3],
      transactionHash: receipt.hash
    };
  } catch (error) {
    console.error('Error uploading file to blockchain:', error);
    throw error;
  }
};

/**
 * Get file details from the blockchain
 * @param {String} fileId - ID of the file
 * @returns {Object} - File details
 */
const getFileDetails = async (fileId) => {
  if (!fileStorage) throw new Error('FileStorage contract not initialized');
  
  try {
    const result = await fileStorage.getFileDetails(fileId);
    
    return {
      cid: result[0],
      owner: result[1],
      size: result[2],
      timestamp: result[3],
      isPrivate: result[4],
      name: result[5],
      fileType: result[6]
    };
  } catch (error) {
    console.error('Error getting file details from blockchain:', error);
    throw error;
  }
};

/**
 * Check if a user has access to a file
 * @param {String} fileId - ID of the file
 * @param {String} userAddress - User's Ethereum address
 * @returns {Boolean} - Whether the user has access
 */
const checkAccess = async (fileId, userAddress) => {
  if (!fileStorage) throw new Error('FileStorage contract not initialized');
  
  try {
    return await fileStorage.checkAccess(fileId, userAddress);
  } catch (error) {
    console.error('Error checking access on blockchain:', error);
    throw error;
  }
};

/**
 * Grant access to a file
 * @param {String} fileId - ID of the file
 * @param {String} granteeAddress - Address to grant access to
 * @param {String} ownerPrivateKey - Private key of the file owner
 * @returns {Object} - Transaction result
 */
const grantAccess = async (fileId, granteeAddress, ownerPrivateKey) => {
  try {
    const fileStorageWithSigner = getContractWithSigner('fileStorage', ownerPrivateKey);
    
    const tx = await fileStorageWithSigner.grantAccess(fileId, granteeAddress);
    const receipt = await tx.wait();
    
    return {
      transactionHash: receipt.hash,
      success: true
    };
  } catch (error) {
    console.error('Error granting access on blockchain:', error);
    throw error;
  }
};

/**
 * Revoke access to a file
 * @param {String} fileId - ID of the file
 * @param {String} revokeAddress - Address to revoke access from
 * @param {String} ownerPrivateKey - Private key of the file owner
 * @returns {Object} - Transaction result
 */
const revokeAccess = async (fileId, revokeAddress, ownerPrivateKey) => {
  try {
    const fileStorageWithSigner = getContractWithSigner('fileStorage', ownerPrivateKey);
    
    const tx = await fileStorageWithSigner.revokeAccess(fileId, revokeAddress);
    const receipt = await tx.wait();
    
    return {
      transactionHash: receipt.hash,
      success: true
    };
  } catch (error) {
    console.error('Error revoking access on blockchain:', error);
    throw error;
  }
};

/**
 * Get all files owned by a user
 * @param {String} userAddress - User's Ethereum address
 * @returns {Array} - Array of file IDs
 */
const getUserFiles = async (userAddress) => {
  if (!fileStorage) throw new Error('FileStorage contract not initialized');
  
  try {
    // When in mock/test mode, return empty array
    if (!contractAddresses.fileStorage || contractAddresses.fileStorage === '0x0000000000000000000000000000000000000000') {
      console.warn('Using mock file storage contract - returning empty file list');
      return [];
    }
    
    // Call getUserFiles instead of getMyFiles
    return await fileStorage.getUserFiles(userAddress);
  } catch (error) {
    console.error('Error getting user files from blockchain:', error);
    console.warn('Returning empty file list due to error');
    return [];
  }
};

/**
 * Register as a storage provider
 * @param {Number} availableBytes - Available bytes for storage
 * @param {String} providerPrivateKey - Private key of the provider
 * @returns {Object} - Transaction result
 */
const registerProvider = async (availableBytes, providerPrivateKey) => {
  try {
    const stakingContractWithSigner = getContractWithSigner('stakingContract', providerPrivateKey);
    
    const tx = await stakingContractWithSigner.registerProvider(availableBytes);
    const receipt = await tx.wait();
    
    return {
      transactionHash: receipt.hash,
      success: true
    };
  } catch (error) {
    console.error('Error registering provider on blockchain:', error);
    throw error;
  }
};

/**
 * Get all active storage providers
 * @returns {Array} - Array of provider addresses
 */
const getActiveProviders = async () => {
  if (!stakingContract) throw new Error('StakingContract not initialized');
  
  try {
    return await stakingContract.getActiveProviders();
  } catch (error) {
    console.error('Error getting active providers from blockchain:', error);
    throw error;
  }
};

/**
 * Get provider details
 * @param {String} providerAddress - Provider's Ethereum address
 * @returns {Object} - Provider details
 */
const getProviderDetails = async (providerAddress) => {
  if (!stakingContract) throw new Error('StakingContract not initialized');
  
  try {
    const result = await stakingContract.getProviderDetails(providerAddress);
    
    return {
      stakedAmount: result[0],
      totalBytes: result[1],
      availableBytes: result[2],
      isActive: result[3],
      pendingRewards: result[4]
    };
  } catch (error) {
    console.error('Error getting provider details from blockchain:', error);
    throw error;
  }
};

/**
 * Get token balance
 * @param {String} address - Ethereum address
 * @returns {String} - Token balance
 */
const getTokenBalance = async (address) => {
  if (!storageToken) throw new Error('StorageToken contract not initialized');
  
  try {
    const balance = await storageToken.balanceOf(address);
    return balance.toString();
  } catch (error) {
    console.error('Error getting token balance from blockchain:', error);
    throw error;
  }
};

module.exports = {
  provider,
  storageToken,
  fileStorage,
  stakingContract,
  getContractWithSigner,
  uploadFile,
  getFileDetails,
  checkAccess,
  grantAccess,
  revokeAccess,
  getUserFiles,
  registerProvider,
  getActiveProviders,
  getProviderDetails,
  getTokenBalance
}; 