import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';
import FileUpload from '../FileUpload';

// Mock ethers
jest.mock('ethers', () => ({
  providers: {
    Web3Provider: jest.fn(),
  },
  Contract: jest.fn(),
  utils: {
    parseEther: jest.fn(),
    formatEther: jest.fn(),
  },
}));

// Mock IPFS service
jest.mock('../../services/ipfsService', () => ({
  uploadToIPFS: jest.fn(),
}));

const mockProvider = {
  getSigner: jest.fn(),
};

const mockSigner = {
  getAddress: jest.fn(),
};

const mockContract = {
  uploadFile: jest.fn(),
  uploadCostPerByte: jest.fn(),
};

describe('FileUpload Component', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup ethers mocks
    ethers.providers.Web3Provider.mockImplementation(() => mockProvider);
    mockProvider.getSigner.mockImplementation(() => mockSigner);
    ethers.Contract.mockImplementation(() => mockContract);

    // Setup default mock implementations
    mockSigner.getAddress.mockResolvedValue('0x123');
    mockContract.uploadCostPerByte.mockResolvedValue(ethers.utils.parseEther('0.0001'));
    mockContract.uploadFile.mockResolvedValue({ wait: jest.fn() });
  });

  const renderComponent = () => {
    return render(
      <Web3ReactProvider getLibrary={(provider) => new ethers.providers.Web3Provider(provider)}>
        <FileUpload />
      </Web3ReactProvider>
    );
  };

  test('renders connect wallet button when not connected', () => {
    renderComponent();
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
  });

  test('handles file selection', () => {
    renderComponent();
    const fileInput = screen.getByLabelText(/file/i);
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(fileInput.files[0]).toBe(file);
  });

  test('handles file upload process', async () => {
    renderComponent();
    
    // Connect wallet
    fireEvent.click(screen.getByText('Connect Wallet'));
    await waitFor(() => {
      expect(screen.getByText(/Connected:/)).toBeInTheDocument();
    });

    // Select file
    const fileInput = screen.getByLabelText(/file/i);
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Upload file
    fireEvent.click(screen.getByText('Upload File'));
    
    await waitFor(() => {
      expect(mockContract.uploadFile).toHaveBeenCalled();
    });
  });

  test('displays error message on upload failure', async () => {
    mockContract.uploadFile.mockRejectedValue(new Error('Upload failed'));
    
    renderComponent();
    
    // Connect wallet
    fireEvent.click(screen.getByText('Connect Wallet'));
    await waitFor(() => {
      expect(screen.getByText(/Connected:/)).toBeInTheDocument();
    });

    // Select file
    const fileInput = screen.getByLabelText(/file/i);
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Upload file
    fireEvent.click(screen.getByText('Upload File'));
    
    await waitFor(() => {
      expect(screen.getByText(/Upload failed/)).toBeInTheDocument();
    });
  });

  test('displays progress during upload', async () => {
    renderComponent();
    
    // Connect wallet
    fireEvent.click(screen.getByText('Connect Wallet'));
    await waitFor(() => {
      expect(screen.getByText(/Connected:/)).toBeInTheDocument();
    });

    // Select file
    const fileInput = screen.getByLabelText(/file/i);
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Upload file
    fireEvent.click(screen.getByText('Upload File'));
    
    expect(screen.getByText('Uploading...')).toBeInTheDocument();
  });
}); 