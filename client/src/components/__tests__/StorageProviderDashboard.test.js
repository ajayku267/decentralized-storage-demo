import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';
import StorageProviderDashboard from '../StorageProviderDashboard';

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

const mockProvider = {
  getSigner: jest.fn(),
};

const mockSigner = {
  getAddress: jest.fn(),
};

const mockFileStorageContract = {
  getProviderInfo: jest.fn(),
};

const mockStorageTokenContract = {
  getStakingInfo: jest.fn(),
  stake: jest.fn(),
  unstake: jest.fn(),
  claimReward: jest.fn(),
};

const mockProviderInfo = {
  isActive: true,
  totalSpace: 1024 * 1024 * 1024, // 1GB
  usedSpace: 512 * 1024 * 1024, // 512MB
  reputationScore: 85,
};

const mockStakingInfo = {
  stakedAmount: ethers.utils.parseEther('1000'),
  stakingTimestamp: 1625097600,
  pendingReward: ethers.utils.parseEther('100'),
};

describe('StorageProviderDashboard Component', () => {
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
    mockFileStorageContract.getProviderInfo.mockResolvedValue(mockProviderInfo);
    mockStorageTokenContract.getStakingInfo.mockResolvedValue(mockStakingInfo);
    mockStorageTokenContract.stake.mockResolvedValue({ wait: jest.fn() });
    mockStorageTokenContract.unstake.mockResolvedValue({ wait: jest.fn() });
    mockStorageTokenContract.claimReward.mockResolvedValue({ wait: jest.fn() });
  });

  const renderComponent = () => {
    return render(
      <Web3ReactProvider getLibrary={(provider) => new ethers.providers.Web3Provider(provider)}>
        <StorageProviderDashboard />
      </Web3ReactProvider>
    );
  };

  test('displays message when wallet is not connected', () => {
    renderComponent();
    expect(screen.getByText(/Please connect your wallet/)).toBeInTheDocument();
  });

  test('loads and displays provider information', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText(/Status: Active/)).toBeInTheDocument();
      expect(screen.getByText(/Total Space: 1.00 GB/)).toBeInTheDocument();
      expect(screen.getByText(/Used Space: 0.50 GB/)).toBeInTheDocument();
      expect(screen.getByText(/Reputation Score: 85/)).toBeInTheDocument();
    });
  });

  test('handles staking tokens', async () => {
    renderComponent();
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText(/Status: Active/)).toBeInTheDocument();
    });

    // Enter stake amount
    const stakeInput = screen.getByPlaceholderText(/Amount to stake/i);
    fireEvent.change(stakeInput, { target: { value: '100' } });

    // Click stake button
    const stakeButton = screen.getByText(/Stake/i);
    fireEvent.click(stakeButton);

    // Verify stake function was called
    await waitFor(() => {
      expect(mockStorageTokenContract.stake).toHaveBeenCalled();
    });
  });

  test('handles unstaking tokens', async () => {
    renderComponent();
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText(/Status: Active/)).toBeInTheDocument();
    });

    // Click unstake button
    const unstakeButton = screen.getByText(/Unstake All/i);
    fireEvent.click(unstakeButton);

    // Verify unstake function was called
    await waitFor(() => {
      expect(mockStorageTokenContract.unstake).toHaveBeenCalled();
    });
  });

  test('handles claiming rewards', async () => {
    renderComponent();
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText(/Status: Active/)).toBeInTheDocument();
    });

    // Click claim rewards button
    const claimButton = screen.getByText(/Claim Rewards/i);
    fireEvent.click(claimButton);

    // Verify claimReward function was called
    await waitFor(() => {
      expect(mockStorageTokenContract.claimReward).toHaveBeenCalled();
    });
  });

  test('displays error message on load failure', async () => {
    mockFileStorageContract.getProviderInfo.mockRejectedValue(new Error('Failed to load provider info'));
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to load provider info/)).toBeInTheDocument();
    });
  });

  test('displays error message on stake failure', async () => {
    mockStorageTokenContract.stake.mockRejectedValue(new Error('Staking failed'));
    
    renderComponent();
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText(/Status: Active/)).toBeInTheDocument();
    });

    // Enter stake amount and click stake
    const stakeInput = screen.getByPlaceholderText(/Amount to stake/i);
    fireEvent.change(stakeInput, { target: { value: '100' } });
    fireEvent.click(screen.getByText(/Stake/i));

    // Verify error message
    await waitFor(() => {
      expect(screen.getByText(/Staking failed/)).toBeInTheDocument();
    });
  });
}); 