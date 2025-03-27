/**
 * Format file size in bytes to human readable format
 * 
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Format date string to human readable format
 * 
 * @param {string|number|Date} dateString - Date to format
 * @param {boolean} includeTime - Whether to include time
 * @returns {string} - Formatted date
 */
export const formatDate = (dateString, includeTime = false) => {
  const date = new Date(dateString);
  
  if (isNaN(date)) {
    return 'Invalid date';
  }
  
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return date.toLocaleDateString('en-US', options);
};

/**
 * Truncate address for display
 * 
 * @param {string} address - Ethereum address
 * @param {number} startChars - Number of characters to show at start
 * @param {number} endChars - Number of characters to show at end
 * @returns {string} - Truncated address
 */
export const truncateAddress = (address, startChars = 6, endChars = 4) => {
  if (!address) return '';
  
  if (address.length <= startChars + endChars) {
    return address;
  }
  
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

/**
 * Truncate text with ellipsis
 * 
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 30) => {
  if (!text) return '';
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.slice(0, maxLength) + '...';
};

/**
 * Check if a string is a valid Ethereum address
 * 
 * @param {string} address - Address to validate
 * @returns {boolean} - Whether the address is valid
 */
export const isValidEthereumAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Detect file type from MIME type
 * 
 * @param {string} mimeType - MIME type
 * @returns {string} - File type category
 */
export const getFileTypeFromMime = (mimeType) => {
  if (!mimeType) return 'unknown';
  
  if (mimeType.startsWith('image/')) {
    return 'image';
  } else if (mimeType.startsWith('video/')) {
    return 'video';
  } else if (mimeType.startsWith('audio/')) {
    return 'audio';
  } else if (mimeType.startsWith('text/')) {
    return 'text';
  } else if (mimeType === 'application/pdf') {
    return 'pdf';
  } else if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
    return 'spreadsheet';
  } else if (mimeType.includes('document') || mimeType.includes('word')) {
    return 'document';
  } else if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
    return 'presentation';
  } else {
    return 'file';
  }
};

/**
 * Get file extension from name
 * 
 * @param {string} filename - File name
 * @returns {string} - File extension
 */
export const getFileExtension = (filename) => {
  if (!filename) return '';
  
  const parts = filename.split('.');
  if (parts.length === 1 || (parts[0] === '' && parts.length === 2)) {
    return '';
  }
  return parts.pop().toLowerCase();
};

/**
 * Generate a random color based on a string
 * 
 * @param {string} str - String to base color on
 * @returns {string} - CSS color value
 */
export const stringToColor = (str) => {
  if (!str) return '#000000';
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  
  return color;
};

export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export default {
  formatFileSize,
  formatDate,
  truncateAddress,
  truncateText,
  isValidEthereumAddress,
  getFileTypeFromMime,
  getFileExtension,
  stringToColor,
  sleep,
};