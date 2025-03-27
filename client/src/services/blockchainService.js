import { ethers } from 'ethers';

// Import ABIs
import FileStorageABI from '../contracts/FileStorage.json';
import StorageTokenABI from '../contracts/StorageToken.json';
import StakingContractABI from '../contracts/StakingContract.json';

// Contract addresses from environment
const FILE_STORAGE_ADDRESS = process.env.REACT_APP_FILE_STORAGE_ADDRESS;
const STORAGE_TOKEN_ADDRESS = process.env.REACT_APP_STORAGE_TOKEN_ADDRESS;
const STAKING_CONTRACT_ADDRESS = process.env.REACT_APP_STAKING_CONTRACT_ADDRESS;

/**
 * Get the current Ethereum provider
 * 
 * @returns {ethers.BrowserProvider} - The Ethereum provider
 */
export const getProvider = async () => {
  if (window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  } else {
    throw new Error('No Ethereum provider found. Please install MetaMask or another Ethereum wallet.');
  }
};

/**
 * Get a signer for transactions
 * 
 * @returns {Promise<ethers.Signer>} - The signer
 */
export const getSigner = async () => {
  const provider = await getProvider();
  return provider.getSigner();
};

/**
 * Get the FileStorage contract instance
 * 
 * @param {boolean} withSigner - Whether to connect with a signer for write operations
 * @returns {Promise<ethers.Contract>} - The contract instance
 */
export const getFileStorageContract = async (withSigner = false) => {
  const provider = await getProvider();
  const abi = FileStorageABI.abi;
  
  if (withSigner) {
    const signer = await provider.getSigner();
    return new ethers.Contract(FILE_STORAGE_ADDRESS, abi, signer);
  }
  
  return new ethers.Contract(FILE_STORAGE_ADDRESS, abi, provider);
};

/**
 * Get the StorageToken contract instance
 * 
 * @param {boolean} withSigner - Whether to connect with a signer for write operations
 * @returns {Promise<ethers.Contract>} - The contract instance
 */
export const getStorageTokenContract = async (withSigner = false) => {
  const provider = await getProvider();
  const abi = StorageTokenABI.abi;
  
  if (withSigner) {
    const signer = await provider.getSigner();
    return new ethers.Contract(STORAGE_TOKEN_ADDRESS, abi, signer);
  }
  
  return new ethers.Contract(STORAGE_TOKEN_ADDRESS, abi, provider);
};

/**
 * Get the StakingContract instance
 * 
 * @param {boolean} withSigner - Whether to connect with a signer for write operations
 * @returns {Promise<ethers.Contract>} - The contract instance
 */
export const getStakingContract = async (withSigner = false) => {
  const provider = await getProvider();
  const abi = StakingContractABI.abi;
  
  if (withSigner) {
    const signer = await provider.getSigner();
    return new ethers.Contract(STAKING_CONTRACT_ADDRESS, abi, signer);
  }
  
  return new ethers.Contract(STAKING_CONTRACT_ADDRESS, abi, provider);
};

/**
 * Get connected accounts
 * 
 * @returns {Promise<string[]>} - Array of account addresses
 */
export const getAccounts = async () => {
  const provider = await getProvider();
  return provider.listAccounts();
};

/**
 * Request account access from user
 * 
 * @returns {Promise<string[]>} - Array of account addresses
 */
export const requestAccounts = async () => {
  if (window.ethereum) {
    return window.ethereum.request({ method: 'eth_requestAccounts' });
  } else {
    throw new Error('No Ethereum provider found. Please install MetaMask or another Ethereum wallet.');
  }
};

/**
 * Get the current chain ID
 * 
 * @returns {Promise<number>} - The chain ID
 */
export const getChainId = async () => {
  const provider = await getProvider();
  const network = await provider.getNetwork();
  return network.chainId;
};

/**
 * Upload a file to the blockchain
 * 
 * @param {string} cid - IPFS Content ID
 * @param {number} size - File size in bytes
 * @param {boolean} isPrivate - Whether the file is private
 * @param {string} name - File name
 * @param {string} fileType - MIME type of the file
 * @returns {Promise<any>} - Transaction receipt
 */
export const uploadFile = async (cid, size, isPrivate, name, fileType) => {
  try {
    const contract = await getFileStorageContract(true);
    const tx = await contract.uploadFile(cid, size, isPrivate, name, fileType);
    return tx.wait();
  } catch (error) {
    console.error('Error uploading file to blockchain:', error);
    throw error;
  }
};

/**
 * Get file details from the blockchain
 * 
 * @param {number} fileId - The file ID
 * @returns {Promise<any>} - File details
 */
export const getFileDetails = async (fileId) => {
  try {
    const contract = await getFileStorageContract();
    return contract.getFileDetails(fileId);
  } catch (error) {
    console.error('Error getting file details:', error);
    throw error;
  }
};

/**
 * Grant file access to another user
 * 
 * @param {number} fileId - The file ID
 * @param {string} granteeAddress - Address to grant access to
 * @returns {Promise<any>} - Transaction receipt
 */
export const grantAccess = async (fileId, granteeAddress) => {
  try {
    const contract = await getFileStorageContract(true);
    const tx = await contract.grantAccess(fileId, granteeAddress);
    return tx.wait();
  } catch (error) {
    console.error('Error granting access:', error);
    throw error;
  }
};

/**
 * Revoke file access from a user
 * 
 * @param {number} fileId - The file ID
 * @param {string} revokeeAddress - Address to revoke access from
 * @returns {Promise<any>} - Transaction receipt
 */
export const revokeAccess = async (fileId, revokeeAddress) => {
  try {
    const contract = await getFileStorageContract(true);
    const tx = await contract.revokeAccess(fileId, revokeeAddress);
    return tx.wait();
  } catch (error) {
    console.error('Error revoking access:', error);
    throw error;
  }
};

/**
 * Check if a user has access to a file
 * 
 * @param {number} fileId - The file ID
 * @param {string} userAddress - Address to check
 * @returns {Promise<boolean>} - Whether the user has access
 */
export const checkAccess = async (fileId, userAddress) => {
  try {
    const contract = await getFileStorageContract();
    return contract.checkAccess(fileId, userAddress);
  } catch (error) {
    console.error('Error checking access:', error);
    throw error;
  }
};

/**
 * Get all files owned by a user
 * 
 * @param {string} ownerAddress - Owner address
 * @returns {Promise<number[]>} - Array of file IDs
 */
export const getFilesByOwner = async (ownerAddress) => {
  try {
    const contract = await getFileStorageContract();
    return contract.getFilesByOwner(ownerAddress);
  } catch (error) {
    console.error('Error getting files by owner:', error);
    throw error;
  }
};

/**
 * Stake tokens in the staking contract
 * 
 * @param {number} amount - Amount to stake
 * @returns {Promise<any>} - Transaction receipt
 */
export const stakeTokens = async (amount) => {
  try {
    // First approve the token transfer
    const tokenContract = await getStorageTokenContract(true);
    const amountWei = ethers.parseUnits(amount.toString(), 18);
    
    const approveTx = await tokenContract.approve(STAKING_CONTRACT_ADDRESS, amountWei);
    await approveTx.wait();
    
    // Then stake the tokens
    const stakingContract = await getStakingContract(true);
    const tx = await stakingContract.stake(amountWei);
    return tx.wait();
  } catch (error) {
    console.error('Error staking tokens:', error);
    throw error;
  }
};

/**
 * Get provider info from staking contract
 * 
 * @param {string} providerAddress - Provider address
 * @returns {Promise<any>} - Provider info
 */
export const getProviderInfo = async (providerAddress) => {
  try {
    const contract = await getStakingContract();
    return contract.getProviderInfo(providerAddress);
  } catch (error) {
    console.error('Error getting provider info:', error);
    throw error;
  }
};

/**
 * Get pending rewards for a provider
 * 
 * @param {string} providerAddress - Provider address
 * @returns {Promise<bigint>} - Pending rewards
 */
export const getPendingRewards = async (providerAddress) => {
  try {
    const contract = await getStakingContract();
    return contract.getPendingRewards(providerAddress);
  } catch (error) {
    console.error('Error getting pending rewards:', error);
    throw error;
  }
};

/**
 * Claim rewards from the staking contract
 * 
 * @returns {Promise<any>} - Transaction receipt
 */
export const claimRewards = async () => {
  try {
    const contract = await getStakingContract(true);
    const tx = await contract.claimRewards();
    return tx.wait();
  } catch (error) {
    console.error('Error claiming rewards:', error);
    throw error;
  }
};

export default {
  getProvider,
  getSigner,
  getFileStorageContract,
  getStorageTokenContract,
  getStakingContract,
  getAccounts,
  requestAccounts,
  getChainId,
  uploadFile,
  getFileDetails,
  grantAccess,
  revokeAccess,
  checkAccess,
  getFilesByOwner,
  stakeTokens,
  getProviderInfo,
  getPendingRewards,
  claimRewards,
}; 