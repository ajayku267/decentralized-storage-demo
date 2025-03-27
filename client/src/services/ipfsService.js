import axios from 'axios';

// API endpoints
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const IPFS_GATEWAY = process.env.REACT_APP_IPFS_GATEWAY || 'https://ipfs.io/ipfs/';

/**
 * Upload a file to IPFS through the backend service
 * 
 * @param {File} file - The file to upload
 * @param {Object} metadata - Additional metadata for the file
 * @returns {Promise<Object>} - Upload response with CID
 */
export const uploadToIPFS = async (file, metadata = {}) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add metadata
    Object.keys(metadata).forEach(key => {
      formData.append(key, metadata[key]);
    });

    const response = await axios.post(`${API_URL}/ipfs/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
};

/**
 * Get a file from IPFS via CID
 * 
 * @param {string} cid - Content ID to retrieve
 * @param {boolean} asBlob - Whether to return as Blob (true) or URL (false)
 * @returns {Promise<Blob|string>} - The file as Blob or gateway URL
 */
export const getFromIPFS = async (cid, asBlob = false) => {
  try {
    if (asBlob) {
      const response = await axios.get(`${API_URL}/ipfs/${cid}`, {
        responseType: 'blob',
      });
      return response.data;
    } else {
      return `${IPFS_GATEWAY}${cid}`;
    }
  } catch (error) {
    console.error('Error retrieving from IPFS:', error);
    throw error;
  }
};

/**
 * Pin a CID to ensure it remains available
 * 
 * @param {string} cid - Content ID to pin
 * @returns {Promise<Object>} - Pin response
 */
export const pinCID = async (cid) => {
  try {
    const response = await axios.post(`${API_URL}/ipfs/pin`, { cid });
    return response.data;
  } catch (error) {
    console.error('Error pinning CID:', error);
    throw error;
  }
};

/**
 * Unpin a CID
 * 
 * @param {string} cid - Content ID to unpin
 * @returns {Promise<Object>} - Unpin response
 */
export const unpinCID = async (cid) => {
  try {
    const response = await axios.post(`${API_URL}/ipfs/unpin`, { cid });
    return response.data;
  } catch (error) {
    console.error('Error unpinning CID:', error);
    throw error;
  }
};

/**
 * Check if a CID is pinned
 * 
 * @param {string} cid - Content ID to check
 * @returns {Promise<boolean>} - Whether the CID is pinned
 */
export const isPinned = async (cid) => {
  try {
    const response = await axios.get(`${API_URL}/ipfs/pins/${cid}`);
    return response.data.isPinned;
  } catch (error) {
    console.error('Error checking pin status:', error);
    throw error;
  }
};

/**
 * Get stats about a CID
 * 
 * @param {string} cid - Content ID to get stats for
 * @returns {Promise<Object>} - CID stats
 */
export const getCIDStats = async (cid) => {
  try {
    const response = await axios.get(`${API_URL}/ipfs/stats/${cid}`);
    return response.data;
  } catch (error) {
    console.error('Error getting CID stats:', error);
    throw error;
  }
};

export default {
  uploadToIPFS,
  getFromIPFS,
  pinCID,
  unpinCID,
  isPinned,
  getCIDStats,
}; 