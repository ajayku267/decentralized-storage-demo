import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import { FileStorage } from '../contracts/FileStorage';
import { StorageToken } from '../contracts/StorageToken';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const AdminDashboard = () => {
  const { account } = useWeb3React();
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');

  useEffect(() => {
    if (account) {
      loadDashboardData();
    }
  }, [account, timeRange]);

  const loadDashboardData = async () => {
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

      // Get system stats
      const [
        totalStorage,
        totalProviders,
        totalFiles,
        totalStaked,
        recentTransactions
      ] = await Promise.all([
        fileStorageContract.getTotalStorage(),
        fileStorageContract.getTotalProviders(),
        fileStorageContract.getTotalFiles(),
        storageTokenContract.getTotalStaked(),
        fileStorageContract.getRecentTransactions(timeRange)
      ]);

      setStats({
        totalStorage: ethers.utils.formatEther(totalStorage),
        totalProviders: totalProviders.toNumber(),
        totalFiles: totalFiles.toNumber(),
        totalStaked: ethers.utils.formatEther(totalStaked)
      });

      setTransactions(recentTransactions);
    } catch (error) {
      setError('Failed to load dashboard data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRewardRate = async (newRate) => {
    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const storageTokenContract = new ethers.Contract(
        process.env.REACT_APP_STORAGE_TOKEN_ADDRESS,
        StorageToken.abi,
        signer
      );

      const tx = await storageTokenContract.setRewardRate(
        ethers.utils.parseEther(newRate)
      );
      await tx.wait();
      
      loadDashboardData();
    } catch (error) {
      setError('Failed to update reward rate: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return <div className="error-message">Please connect your wallet to access the admin dashboard</div>;
  }

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      
      {loading && <div className="loading">Loading dashboard data...</div>}
      
      {error && <div className="error-message">{error}</div>}
      
      {stats && (
        <div className="dashboard-content">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Storage</h3>
              <p>{stats.totalStorage} GB</p>
            </div>
            
            <div className="stat-card">
              <h3>Active Providers</h3>
              <p>{stats.totalProviders}</p>
            </div>
            
            <div className="stat-card">
              <h3>Total Files</h3>
              <p>{stats.totalFiles}</p>
            </div>
            
            <div className="stat-card">
              <h3>Total Staked</h3>
              <p>{stats.totalStaked} STR</p>
            </div>
          </div>

          <div className="charts-section">
            <div className="chart-card">
              <h3>Storage Usage Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={transactions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="storageUsed"
                    stroke="#8884d8"
                    name="Storage Used (GB)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="admin-controls">
            <h3>Admin Controls</h3>
            <div className="control-group">
              <label>Time Range:</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                disabled={loading}
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>

            <div className="control-group">
              <label>Reward Rate (STR/byte/day):</label>
              <input
                type="number"
                step="0.000000000000000001"
                onChange={(e) => handleUpdateRewardRate(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="recent-transactions">
            <h3>Recent Transactions</h3>
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Timestamp</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, index) => (
                  <tr key={index}>
                    <td>{tx.type}</td>
                    <td>{ethers.utils.formatEther(tx.amount)} STR</td>
                    <td>{new Date(tx.timestamp * 1000).toLocaleString()}</td>
                    <td>{tx.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 