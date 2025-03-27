import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import { FileStorage } from '../contracts/FileStorage';
import { getFromIPFS } from '../services/ipfsService';

const FileRetrieval = () => {
  const { account } = useWeb3React();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (account) {
      loadUserFiles();
    }
  }, [account]);

  const loadUserFiles = async () => {
    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const fileStorageContract = new ethers.Contract(
        process.env.REACT_APP_FILE_STORAGE_ADDRESS,
        FileStorage.abi,
        signer
      );

      // Get user's files
      const userFiles = await fileStorageContract.getUserFiles(account);
      const fileDetails = await Promise.all(
        userFiles.map(async (fileId) => {
          const details = await fileStorageContract.getFileDetails(fileId);
          return {
            id: fileId,
            ...details
          };
        })
      );

      setFiles(fileDetails);
    } catch (error) {
      setError('Failed to load files: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (file) => {
    try {
      setLoading(true);
      const fileBuffer = await getFromIPFS(file.cid);
      
      // Create blob and download
      const blob = new Blob([fileBuffer], { type: file.fileType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setError('Download failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (file) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const fileStorageContract = new ethers.Contract(
        process.env.REACT_APP_FILE_STORAGE_ADDRESS,
        FileStorage.abi,
        signer
      );

      // Get shareable link
      const shareableLink = `${window.location.origin}/share/${file.id}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareableLink);
      alert('Shareable link copied to clipboard!');
    } catch (error) {
      setError('Failed to generate shareable link: ' + error.message);
    }
  };

  if (!account) {
    return <div className="error-message">Please connect your wallet to view files</div>;
  }

  return (
    <div className="file-retrieval-container">
      <h2>Your Files</h2>
      
      {loading && <div className="loading">Loading files...</div>}
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="files-grid">
        {files.map((file) => (
          <div key={file.id} className="file-card">
            <div className="file-info">
              <h3>{file.name}</h3>
              <p>Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
              <p>Type: {file.fileType}</p>
              <p>Uploaded: {new Date(file.timestamp * 1000).toLocaleDateString()}</p>
            </div>
            
            <div className="file-actions">
              <button
                onClick={() => handleDownload(file)}
                disabled={loading}
                className="download-button"
              >
                Download
              </button>
              
              <button
                onClick={() => handleShare(file)}
                disabled={loading}
                className="share-button"
              >
                Share
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {files.length === 0 && !loading && (
        <div className="no-files">No files found. Upload some files to get started!</div>
      )}
    </div>
  );
};

export default FileRetrieval; 