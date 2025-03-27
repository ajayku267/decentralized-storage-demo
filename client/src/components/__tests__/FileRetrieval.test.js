import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';
import FileRetrieval from '../FileRetrieval';

// Mock ethers
jest.mock('ethers', () => ({
  providers: {
    Web3Provider: jest.fn(),
  },
  Contract: jest.fn(),
  utils: {
    formatEther: jest.fn(),
  },
}));

// Mock IPFS service
jest.mock('../../services/ipfsService', () => ({
  getFromIPFS: jest.fn(),
}));

const mockProvider = {
  getSigner: jest.fn(),
};

const mockSigner = {
  getAddress: jest.fn(),
};

const mockContract = {
  getUserFiles: jest.fn(),
  getFileDetails: jest.fn(),
};

const mockFiles = [
  {
    id: '1',
    cid: 'QmTest1',
    name: 'test1.txt',
    size: 1024,
    fileType: 'text/plain',
    timestamp: 1625097600,
  },
  {
    id: '2',
    cid: 'QmTest2',
    name: 'test2.txt',
    size: 2048,
    fileType: 'text/plain',
    timestamp: 1625184000,
  },
];

describe('FileRetrieval Component', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup ethers mocks
    ethers.providers.Web3Provider.mockImplementation(() => mockProvider);
    mockProvider.getSigner.mockImplementation(() => mockSigner);
    ethers.Contract.mockImplementation(() => mockContract);

    // Setup default mock implementations
    mockSigner.getAddress.mockResolvedValue('0x123');
    mockContract.getUserFiles.mockResolvedValue(['1', '2']);
    mockContract.getFileDetails.mockImplementation((id) => {
      return mockFiles.find(file => file.id === id);
    });
  });

  const renderComponent = () => {
    return render(
      <Web3ReactProvider getLibrary={(provider) => new ethers.providers.Web3Provider(provider)}>
        <FileRetrieval />
      </Web3ReactProvider>
    );
  };

  test('displays message when wallet is not connected', () => {
    renderComponent();
    expect(screen.getByText(/Please connect your wallet/)).toBeInTheDocument();
  });

  test('loads and displays user files', async () => {
    renderComponent();
    
    // Mock wallet connection
    await waitFor(() => {
      expect(mockContract.getUserFiles).toHaveBeenCalled();
    });

    // Check if files are displayed
    expect(screen.getByText('test1.txt')).toBeInTheDocument();
    expect(screen.getByText('test2.txt')).toBeInTheDocument();
  });

  test('handles file download', async () => {
    const mockFileBuffer = Buffer.from('test content');
    require('../../services/ipfsService').getFromIPFS.mockResolvedValue(mockFileBuffer);
    
    renderComponent();
    
    // Wait for files to load
    await waitFor(() => {
      expect(screen.getByText('test1.txt')).toBeInTheDocument();
    });

    // Click download button
    const downloadButtons = screen.getAllByText('Download');
    fireEvent.click(downloadButtons[0]);

    // Verify IPFS service was called
    await waitFor(() => {
      expect(require('../../services/ipfsService').getFromIPFS).toHaveBeenCalledWith('QmTest1');
    });
  });

  test('handles file sharing', async () => {
    const mockClipboard = {
      writeText: jest.fn(),
    };
    Object.assign(navigator, {
      clipboard: mockClipboard,
    });

    renderComponent();
    
    // Wait for files to load
    await waitFor(() => {
      expect(screen.getByText('test1.txt')).toBeInTheDocument();
    });

    // Click share button
    const shareButtons = screen.getAllByText('Share');
    fireEvent.click(shareButtons[0]);

    // Verify clipboard was updated
    expect(mockClipboard.writeText).toHaveBeenCalled();
  });

  test('displays error message on load failure', async () => {
    mockContract.getUserFiles.mockRejectedValue(new Error('Failed to load files'));
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to load files/)).toBeInTheDocument();
    });
  });

  test('displays no files message when user has no files', async () => {
    mockContract.getUserFiles.mockResolvedValue([]);
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText(/No files found/)).toBeInTheDocument();
    });
  });
}); 