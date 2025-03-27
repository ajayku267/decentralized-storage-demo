import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import { FileStorage } from '../contracts/FileStorage';
import { StorageToken } from '../contracts/StorageToken';

const StorageProviderDashboard = () => {
  const { account } = useWeb3React();
  const [providerInfo, setProviderInfo] = useState(null);
  const [stakedAmount, setStakedAmount] = useState('0');
  const [rewards, setRewards] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (account) {
      loadProviderInfo();
    }
  }, [account]);

  const loadProviderInfo = async () => {
    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      const fileStorageContract = new ethers.Contract(
        process.env.REACT_APP_FILE_STORAGE_ADDRESS,
        FileStorage.abi,
        signer
      );

      const storageTokenContract = new ethers.Contract(
        process.env.REACT_APP_STORAGE_TOKEN_ADDRESS,
        StorageToken.abi,
        signer
      );

      // Get provider info
      const info = await fileStorageContract.getProviderInfo(account);
      setProviderInfo(info);

      // Get staking info
      const stakingInfo = await storageTokenContract.getStakingInfo(account);
      setStakedAmount(ethers.utils.formatEther(stakingInfo.stakedAmount));
      setRewards(ethers.utils.formatEther(stakingInfo.pendingReward));
    } catch (error) {
      setError('Failed to load provider info: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStake = async () => {
    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const storageTokenContract = new ethers.Contract(
        process.env.REACT_APP_STORAGE_TOKEN_ADDRESS,
        StorageToken.abi,
        signer
      );

      const amount = ethers.utils.parseEther(stakedAmount);
      const tx = await storageTokenContract.stake(amount);
      await tx.wait();
      
      loadProviderInfo();
    } catch (error) {
      setError('Staking failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnstake = async () => {
    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const storageTokenContract = new ethers.Contract(
        process.env.REACT_APP_STORAGE_TOKEN_ADDRESS,
        StorageToken.abi,
        signer
      );

      const amount = ethers.utils.parseEther(stakedAmount);
      const tx = await storageTokenContract.unstake(amount);
      await tx.wait();
      
      loadProviderInfo();
    } catch (error) {
      setError('Unstaking failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimRewards = async () => {
    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const storageTokenContract = new ethers.Contract(
        process.env.REACT_APP_STORAGE_TOKEN_ADDRESS,
        StorageToken.abi,
        signer
      );

      const tx = await storageTokenContract.claimReward();
      await tx.wait();
      
      loadProviderInfo();
    } catch (error) {
      setError('Failed to claim rewards: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return <div className="error-message">Please connect your wallet to access the dashboard</div>;
  }

  return (
    <div className="provider-dashboard">
      <h2>Storage Provider Dashboard</h2>
      
      {loading && <div className="loading">Loading...</div>}
      
      {error && <div className="error-message">{error}</div>}
      
      {providerInfo && (
        <div className="provider-info">
          <div className="info-card">
            <h3>Provider Status</h3>
            <p>Status: {providerInfo.isActive ? 'Active' : 'Inactive'}</p>
            <p>Total Space: {(providerInfo.totalSpace / 1024 / 1024 / 1024).toFixed(2)} GB</p>
            <p>Used Space: {(providerInfo.usedSpace / 1024 / 1024 / 1024).toFixed(2)} GB</p>
            <p>Reputation Score: {providerInfo.reputationScore}</p>
          </div>

          <div className="staking-card">
            <h3>Staking</h3>
            <div className="input-group">
              <input
                type="number"
                value={stakedAmount}
                onChange={(e) => setStakedAmount(e.target.value)}
                placeholder="Amount to stake"
                disabled={loading}
              />
              <button
                onClick={handleStake}
                disabled={loading}
                className="stake-button"
              >
                Stake
              </button>
            </div>
            <button
              onClick={handleUnstake}
              disabled={loading}
              className="unstake-button"
            >
              Unstake All
            </button>
          </div>

          <div className="rewards-card">
            <h3>Rewards</h3>
            <p>Pending Rewards: {rewards} STR</p>
            <button
              onClick={handleClaimRewards}
              disabled={loading || rewards === '0'}
              className="claim-button"
            >
              Claim Rewards
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorageProviderDashboard; 