import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import { Web3Context } from './Web3Context';

// Create context
export const StorageContext = createContext();

// Potential API ports to try
const API_PORTS = [5001, 50011, 5000];
let detectedPort = null;

// Configure axios with a default that will be updated
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
});

// Update the API client with the detected port
const updateApiClientPort = (port) => {
  apiClient.defaults.baseURL = `http://localhost:${port}/api`;
  console.log(`API client updated to use port ${port}`);
  return apiClient.defaults.baseURL;
};

// Log the initial API URL
console.log("Initial API URL configured as:", apiClient.defaults.baseURL);

// Demo data for when the API is not available
const DEMO_FILES = [
  {
    id: '1',
    cid: 'QmW2WQi7j6c7UgJTarActp7tDNikE4B2qXtFCfLPdsgaTQ',
    name: 'example.txt',
    size: '1024',
    fileType: 'text/plain',
    isPrivate: false,
    timestamp: new Date().toISOString(),
    owner: '0x123456789012345678901234567890123456789A',
  },
  {
    id: '2',
    cid: 'QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX',
    name: 'image.jpg',
    size: '102400',
    fileType: 'image/jpeg',
    isPrivate: true,
    timestamp: new Date().toISOString(),
    owner: '0x123456789012345678901234567890123456789A',
  },
];

// Demo storage providers
const DEMO_PROVIDERS = [
  {
    id: '1',
    address: '0xA1B2C3D4E5F67890A1B2C3D4E5F67890A1B2C3D4',
    name: 'Demo Provider 1',
    totalSpace: '1073741824', // 1 GB in bytes
    usedSpace: '536870912',    // 500 MB in bytes
    availableSpace: '536870912', // 500 MB in bytes
    reputation: '95',
    isActive: true,
    timestamp: new Date().toISOString(),
  },
  {
    id: '2',
    address: '0xF5E4D3C2B1A09876F5E4D3C2B1A09876F5E4D3C2',
    name: 'Demo Provider 2',
    totalSpace: '5368709120', // 5 GB in bytes
    usedSpace: '1073741824',  // 1 GB in bytes
    availableSpace: '4294967296', // 4 GB in bytes
    reputation: '87',
    isActive: true,
    timestamp: new Date().toISOString(),
  },
];

export const StorageProvider = ({ children }) => {
  const { account, isConnected, contracts, contractsDeployed } = useContext(Web3Context);
  const [files, setFiles] = useState([]);
  const [userFiles, setUserFiles] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [demoMode, setDemoMode] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(false);

  // Initialize demo mode data
  const initDemoData = useCallback(() => {
    setUserFiles(DEMO_FILES.map(file => ({
      ...file,
      owner: account || file.owner // Use the current account if available
    })));
    setProviders(DEMO_PROVIDERS);
  }, [account]);

  // Check if API is available
  const checkApiAvailability = useCallback(async () => {
    // If we already found a working port, use that first
    if (detectedPort) {
      console.log(`Using previously detected port: ${detectedPort}`);
      try {
        const response = await axios.get(`http://localhost:${detectedPort}/api/health`, {
          timeout: 3000
        });
        console.log('API health check successful on previously detected port:', response.data);
        updateApiClientPort(detectedPort);
        setApiAvailable(true);
        setDemoMode(false);
        return true;
      } catch (error) {
        console.warn(`Previously detected port ${detectedPort} failed, will try all ports again`);
        detectedPort = null; // Reset if it failed
      }
    }
    
    // Try each port
    for (const port of API_PORTS) {
      console.log(`Attempting API connection on port ${port}...`);
      try {
        const response = await axios.get(`http://localhost:${port}/api/health`, {
          timeout: 3000
        });
        console.log(`API health check successful on port ${port}:`, response.data);
        
        // Update the API client to use this port
        detectedPort = port;
        updateApiClientPort(port);
        
        setApiAvailable(true);
        setDemoMode(false);
        return true;
      } catch (error) {
        console.warn(`Port ${port} not available:`, error.message);
      }
    }

    // If we get here, no ports worked
    console.warn('API not available on any port, switching to demo mode');
    setApiAvailable(false);
    setDemoMode(true);
    // Initialize demo data automatically
    initDemoData();
    return false;
  }, [initDemoData]);

  // Upload file to IPFS and blockchain
  const uploadFile = useCallback(
    async (file, isPrivate = true) => {
      if (!isConnected || !account) {
        setError('Please connect your wallet first');
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        // Check if API is available
        const apiAvailable = await checkApiAvailability();
        
        if (!apiAvailable || demoMode) {
          // Demo mode - simulate upload
          await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay
          
          const newFile = {
            id: Math.random().toString(36).substring(2, 15),
            cid: `Qm${Math.random().toString(36).substring(2, 37)}`,
            name: file.name,
            size: file.size.toString(),
            fileType: file.type,
            isPrivate: isPrivate,
            timestamp: new Date().toISOString(),
            owner: account,
          };
          
          setUserFiles(prev => [...prev, newFile]);
          return newFile;
        }

        // Create form data
        const formData = new FormData();
        formData.append('file', file);
        formData.append('isPrivate', isPrivate);
        formData.append('owner', account);

        // Upload file using the apiClient with the detected port
        console.log("Uploading file to:", apiClient.defaults.baseURL + '/files/upload-resilient');
        const response = await apiClient.post('/files/upload-resilient', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.success) {
          // Add new file to state
          const newFile = response.data.file;
          
          // Check if we received a warning that some operations were mocked
          if (response.data.warning) {
            console.warn("Server warning:", response.data.warning);
            
            // If operations were mocked, we should manually refresh the files
            // by getting them directly from the database
            const filesResponse = await apiClient.get(`/files?owner=${account}`);
            if (filesResponse.data.success) {
              console.log("Files refreshed after mocked upload:", filesResponse.data.files.length);
              setUserFiles(filesResponse.data.files);
            }
          } else {
            setUserFiles((prevFiles) => [...prevFiles, newFile]);
          }
          
          return newFile;
        } else {
          throw new Error(response.data.message || 'Failed to upload file');
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        setError(error.message || 'Failed to upload file');
        
        // If API error, prompt to use demo mode
        if (error.response && error.response.status >= 500) {
          initDemoData();
          setDemoMode(true);
          setError('Server unavailable. Using demo mode.');
        }
        
        return null;
      } finally {
        setLoading(false);
      }
    },
    [isConnected, account, demoMode, checkApiAvailability, initDemoData]
  );

  // Get user's files
  const getUserFiles = useCallback(async () => {
    if (!isConnected || !account) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Check if API is available
      const apiAvailable = await checkApiAvailability();
      
      if (!apiAvailable || demoMode) {
        // Demo mode - use demo files
        initDemoData();
        return;
      }

      // Get from API using the apiClient with the detected port
      console.log("Fetching files from:", apiClient.defaults.baseURL + `/files?owner=${account}`);
      const response = await apiClient.get(`/files?owner=${account}`);

      if (response.data.success) {
        console.log("Files retrieved successfully:", response.data.files);
        setUserFiles(response.data.files);
        
        // Check for warnings
        if (response.data.warning) {
          console.warn("Server warning when fetching files:", response.data.warning);
          setDemoMode(true);
        }
      } else {
        throw new Error(response.data.message || 'Failed to get files');
      }
    } catch (error) {
      console.error('Error getting user files:', error);
      setError(error.message || 'Failed to get files');
      
      // If API error, use demo mode
      if (error.response && error.response.status >= 500) {
        initDemoData();
        setDemoMode(true);
        setError('Server unavailable. Using demo mode.');
      }
    } finally {
      setLoading(false);
    }
  }, [isConnected, account, demoMode, checkApiAvailability, initDemoData]);

  // Get file by ID
  const getFileById = useCallback(
    async (fileId) => {
      if (!isConnected) {
        setError('Please connect your wallet first');
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        if (demoMode || !contractsDeployed) {
          // In demo mode, just find the file in userFiles
          const file = userFiles.find(f => f.id === fileId);
          if (!file) {
            throw new Error('File not found');
          }
          setCurrentFile(file);
          return file;
        }

        // Get file details from blockchain (if contracts are deployed)
        let fileDetails;
        try {
          fileDetails = await contracts.fileStorage.getFileDetails(fileId);
        } catch (error) {
          console.warn('Could not get file details from blockchain:', error);
          // If contract call fails, just use the file from state
          const file = userFiles.find(f => f.id === fileId);
          if (!file) {
            throw new Error('File not found');
          }
          setCurrentFile(file);
          return file;
        }

        // Get file from database
        const file = userFiles.find((f) => f.id === fileId) || {};

        // Combine data
        const fileData = {
          id: fileId,
          cid: fileDetails[0],
          owner: fileDetails[1],
          size: ethers.formatUnits(fileDetails[2], 0),
          timestamp: new Date(Number(fileDetails[3]) * 1000).toISOString(),
          isPrivate: fileDetails[4],
          name: fileDetails[5],
          fileType: fileDetails[6],
          ...file,
        };

        setCurrentFile(fileData);
        return fileData;
      } catch (error) {
        console.error('Error getting file:', error);
        setError(error.message || 'Failed to get file');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [isConnected, contracts, userFiles, contractsDeployed, demoMode]
  );

  // Download file
  const downloadFile = useCallback(
    async (fileId) => {
      if (!isConnected) {
        setError('Please connect your wallet first');
        return false;
      }

      try {
        setLoading(true);
        setError(null);

        // Get file details if not already loaded
        let fileData = currentFile;
        if (!fileData || fileData.id !== fileId) {
          fileData = await getFileById(fileId);
        }

        if (!fileData) {
          throw new Error('File not found');
        }

        if (demoMode) {
          // In demo mode, create a dummy file for download
          const content = `This is a demo file: ${fileData.name}`;
          const blob = new Blob([content], { type: fileData.fileType || 'text/plain' });
          
          // Create a download link
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', fileData.name);
          document.body.appendChild(link);
          link.click();
          link.remove();
          
          return true;
        }

        // Download file from API using the apiClient with the detected port
        console.log("Downloading file from:", apiClient.defaults.baseURL + `/files/${fileId}?user=${account}`);
        const response = await apiClient.get(`/files/${fileId}?user=${account}`, {
          responseType: 'blob',
        });

        // Create a download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileData.name);
        document.body.appendChild(link);
        link.click();
        link.remove();

        return true;
      } catch (error) {
        console.error('Error downloading file:', error);
        setError(error.message || 'Failed to download file');
        
        if (error.response && error.response.status >= 500) {
          setDemoMode(true);
          setError('Server unavailable. Using demo mode.');
        }
        
        return false;
      } finally {
        setLoading(false);
      }
    },
    [isConnected, account, currentFile, getFileById, demoMode]
  );

  // Get storage providers
  const getStorageProviders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if API is available
      const apiAvailable = await checkApiAvailability();
      
      if (!apiAvailable || demoMode) {
        // Demo mode - use demo providers
        setProviders(DEMO_PROVIDERS);
        return DEMO_PROVIDERS;
      }

      // Get from API
      const response = await apiClient.get('/providers');

      if (response.data.success) {
        setProviders(response.data.providers);
        return response.data.providers;
      } else {
        throw new Error(response.data.message || 'Failed to get providers');
      }
    } catch (error) {
      console.error('Error getting storage providers:', error);
      setError(error.message || 'Failed to get storage providers');
      
      // If API error, use demo mode
      if (error.response && error.response.status >= 500) {
        setProviders(DEMO_PROVIDERS);
        setDemoMode(true);
        setError('Server unavailable. Using demo providers.');
        return DEMO_PROVIDERS;
      }
      
      return [];
    } finally {
      setLoading(false);
    }
  }, [checkApiAvailability, demoMode, setProviders, setDemoMode, setError, setLoading]);

  // Register as storage provider
  const registerAsProvider = useCallback(async (totalSpace, nodeInfo, privateKey) => {
    if (!isConnected || !account) {
      setError('Please connect your wallet first');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      // Check if API is available
      const apiAvailable = await checkApiAvailability();
      
      if (!apiAvailable || demoMode) {
        // Demo mode - simulate provider registration
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay
        
        const newProvider = {
          id: Math.random().toString(36).substring(2, 15),
          address: account,
          name: nodeInfo.name || 'Demo Provider',
          totalSpace: totalSpace ? String(Number(totalSpace) * 1024 * 1024 * 1024) : '1073741824', // Convert GB to bytes
          usedSpace: '0',
          availableSpace: totalSpace ? String(Number(totalSpace) * 1024 * 1024 * 1024) : '1073741824',
          reputation: '100',
          isActive: true,
          timestamp: new Date().toISOString(),
          ...nodeInfo,
        };
        
        setProviders(prev => [...prev.filter(p => p.address.toLowerCase() !== account.toLowerCase()), newProvider]);
        return true;
      }

      // Register with API
      const response = await apiClient.post('/providers/register', {
        address: account,
        totalSpace,
        ...nodeInfo,
        privateKey, // Note: In production, never send private keys to server! This is a demo.
      });

      if (response.data.success) {
        // Update providers list
        setProviders(prev => [...prev, response.data.provider]);
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to register as provider');
      }
    } catch (error) {
      console.error('Error registering as provider:', error);
      setError(error.message || 'Failed to register as provider');
      
      // If API error, use demo mode
      if (error.response && error.response.status >= 500) {
        setDemoMode(true);
        setError('Server unavailable. Using demo mode.');
        
        // Create a demo provider in demo mode
        const newProvider = {
          id: Math.random().toString(36).substring(2, 15),
          address: account,
          name: nodeInfo.name || 'Demo Provider',
          totalSpace: totalSpace ? String(Number(totalSpace) * 1024 * 1024 * 1024) : '1073741824',
          usedSpace: '0',
          availableSpace: totalSpace ? String(Number(totalSpace) * 1024 * 1024 * 1024) : '1073741824',
          reputation: '100',
          isActive: true,
          timestamp: new Date().toISOString(),
          ...nodeInfo,
        };
        
        setProviders(prev => [...prev.filter(p => p.address.toLowerCase() !== account.toLowerCase()), newProvider]);
        return true;
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [isConnected, account, demoMode, checkApiAvailability, setProviders, setLoading, setError, setDemoMode]);

  // Initialize the context
  useEffect(() => {
    // For Vercel deployment, we want to ensure demo mode is enabled
    const isVercelDeployment = window.location.hostname.includes('vercel.app');
    if (isVercelDeployment) {
      console.log('Vercel deployment detected - enabling demo mode');
      setDemoMode(true);
      initDemoData();
      return;
    }
    
    // Otherwise, check API availability as usual
    checkApiAvailability();
  }, [checkApiAvailability, initDemoData]);

  // Provide values to components
  const value = {
    files,
    userFiles,
    providers,
    loading,
    error,
    currentFile,
    demoMode,
    apiAvailable,
    uploadFile,
    getUserFiles,
    getFileById,
    downloadFile,
    getStorageProviders,
    registerAsProvider,
    setDemoMode,
  };

  return <StorageContext.Provider value={value}>{children}</StorageContext.Provider>;
}; 