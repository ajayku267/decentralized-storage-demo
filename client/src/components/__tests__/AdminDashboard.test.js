import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';
import AdminDashboard from '../AdminDashboard';

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

// Mock recharts
jest.mock('recharts', () => ({
  LineChart: () => <div data-testid="line-chart">Line Chart</div>,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
}));

const mockProvider = {
  getSigner: jest.fn(),
};

const mockSigner = {
  getAddress: jest.fn(),
};

const mockFileStorageContract = {
  getTotalStorage: jest.fn(),
  getTotalProviders: jest.fn(),
  getTotalFiles: jest.fn(),
  getRecentTransactions: jest.fn(),
};

const mockStorageTokenContract = {
  getTotalStaked: jest.fn(),
  setRewardRate: jest.fn(),
};

const mockStats = {
  totalStorage: ethers.utils.parseEther('1000'),
  totalProviders: 5,
  totalFiles: 100,
  totalStaked: ethers.utils.parseEther('5000'),
};

const mockTransactions = [
  {
    type: 'Upload',
    amount: ethers.utils.parseEther('10'),
    timestamp: 1625097600,
    status: 'Completed',
    storageUsed: 1024,
  },
  {
    type: 'Download',
    amount: ethers.utils.parseEther('5'),
    timestamp: 1625184000,
    status: 'Completed',
    storageUsed: 2048,
  },
];

describe('AdminDashboard Component', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup ethers mocks
    ethers.providers.Web3Provider.mockImplementation(() => mockProvider);
    mockProvider.getSigner.mockImplementation(() => mockSigner);
    ethers.Contract.mockImplementation((address, abi, signer) => {
      if (address === process.env.REACT_APP_FILE_STORAGE_ADDRESS) {
        return mockFileStorageContract;
      }
      return mockStorageTokenContract;
    });

    // Setup default mock implementations
    mockSigner.getAddress.mockResolvedValue('0x123');
    mockFileStorageContract.getTotalStorage.mockResolvedValue(mockStats.totalStorage);
    mockFileStorageContract.getTotalProviders.mockResolvedValue(mockStats.totalProviders);
    mockFileStorageContract.getTotalFiles.mockResolvedValue(mockStats.totalFiles);
    mockStorageTokenContract.getTotalStaked.mockResolvedValue(mockStats.totalStaked);
    mockFileStorageContract.getRecentTransactions.mockResolvedValue(mockTransactions);
    mockStorageTokenContract.setRewardRate.mockResolvedValue({ wait: jest.fn() });
  });

  const renderComponent = () => {
    return render(
      <Web3ReactProvider getLibrary={(provider) => new ethers.providers.Web3Provider(provider)}>
        <AdminDashboard />
      </Web3ReactProvider>
    );
  };

  test('displays message when wallet is not connected', () => {
    renderComponent();
    expect(screen.getByText(/Please connect your wallet/)).toBeInTheDocument();
  });

  test('loads and displays dashboard statistics', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText(/Total Storage/)).toBeInTheDocument();
      expect(screen.getByText(/Active Providers/)).toBeInTheDocument();
      expect(screen.getByText(/Total Files/)).toBeInTheDocument();
      expect(screen.getByText(/Total Staked/)).toBeInTheDocument();
    });
  });

  test('displays storage usage chart', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  test('handles time range selection', async () => {
    renderComponent();
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText(/Total Storage/)).toBeInTheDocument();
    });

    // Change time range
    const timeRangeSelect = screen.getByLabelText(/Time Range/i);
    fireEvent.change(timeRangeSelect, { target: { value: '7d' } });

    // Verify getRecentTransactions was called with new time range
    await waitFor(() => {
      expect(mockFileStorageContract.getRecentTransactions).toHaveBeenCalledWith('7d');
    });
  });

  test('handles reward rate update', async () => {
    renderComponent();
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText(/Total Storage/)).toBeInTheDocument();
    });

    // Update reward rate
    const rewardRateInput = screen.getByLabelText(/Reward Rate/i);
    fireEvent.change(rewardRateInput, { target: { value: '0.0001' } });

    // Verify setRewardRate was called
    await waitFor(() => {
      expect(mockStorageTokenContract.setRewardRate).toHaveBeenCalled();
    });
  });

  test('displays recent transactions table', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Upload')).toBeInTheDocument();
      expect(screen.getByText('Download')).toBeInTheDocument();
    });
  });

  test('displays error message on load failure', async () => {
    mockFileStorageContract.getTotalStorage.mockRejectedValue(new Error('Failed to load stats'));
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to load dashboard data/)).toBeInTheDocument();
    });
  });

  test('displays error message on reward rate update failure', async () => {
    mockStorageTokenContract.setRewardRate.mockRejectedValue(new Error('Failed to update reward rate'));
    
    renderComponent();
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText(/Total Storage/)).toBeInTheDocument();
    });

    // Update reward rate
    const rewardRateInput = screen.getByLabelText(/Reward Rate/i);
    fireEvent.change(rewardRateInput, { target: { value: '0.0001' } });

    // Verify error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to update reward rate/)).toBeInTheDocument();
    });
  });
}); 