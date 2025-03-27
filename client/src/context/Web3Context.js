import React, { createContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

// Contract ABIs
import storageTokenAbi from '../contracts/StorageToken.json';
import fileStorageAbi from '../contracts/FileStorage.json';
import stakingContractAbi from '../contracts/StakingContract.json';

// Create context
export const Web3Context = createContext();

// Contract addresses (this would come from your deployment)
const CONTRACT_ADDRESSES = {
  storageToken: process.env.REACT_APP_STORAGE_TOKEN_ADDRESS,
  fileStorage: process.env.REACT_APP_FILE_STORAGE_ADDRESS,
  stakingContract: process.env.REACT_APP_STAKING_CONTRACT_ADDRESS,
};

// Add a function to check if we're running on Vercel deployment
const isVercelDeployment = () => {
  return window.location.hostname.includes('vercel.app');
};

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [network, setNetwork] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [contracts, setContracts] = useState({
    storageToken: null,
    fileStorage: null,
    stakingContract: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ethBalance, setEthBalance] = useState('0');
  const [tokenBalance, setTokenBalance] = useState('0');
  const [contractsDeployed, setContractsDeployed] = useState(false);

  // Check if a contract is deployed
  const isContractDeployed = useCallback(async (address, provider) => {
    if (!address || !ethers.isAddress(address)) return false;
    try {
      const code = await provider.getCode(address);
      return code !== '0x';
    } catch (error) {
      console.warn(`Error checking if contract is deployed at ${address}:`, error);
      return false;
    }
  }, []);

  // Connect to MetaMask
  const connectWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if MetaMask is installed
      if (!window.ethereum) {
        setError('MetaMask is not installed. Please install MetaMask to use this app.');
        setLoading(false);
        return;
      }

      // Request account access
      let accounts;
      try {
        accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      } catch (err) {
        setError('Failed to connect to MetaMask. Please try again.');
        setLoading(false);
        return;
      }
      
      if (accounts.length === 0) {
        setError('No accounts found. Please unlock MetaMask and refresh the page.');
        setLoading(false);
        return;
      }

      // Get the connected account
      const account = accounts[0];
      setAccount(account);

      // Create provider and signer
      let provider, signer;
      try {
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
      } catch (err) {
        console.error('Failed to create provider:', err);
        setError('Failed to connect to blockchain. Please check your MetaMask connection.');
        setLoading(false);
        return;
      }
      
      setProvider(provider);
      setSigner(signer);

      // Get network info
      let network;
      try {
        network = await provider.getNetwork();
        setNetwork(network);
      } catch (err) {
        console.warn('Could not get network info:', err);
        // Continue without network info
      }

      // Initialize contracts (with error handling)
      try {
        if (!CONTRACT_ADDRESSES.storageToken || !CONTRACT_ADDRESSES.fileStorage || !CONTRACT_ADDRESSES.stakingContract) {
          console.warn('Contract addresses are not configured properly');
        }
        
        // Check if contracts are deployed
        const storageTokenDeployed = await isContractDeployed(CONTRACT_ADDRESSES.storageToken, provider);
        const fileStorageDeployed = await isContractDeployed(CONTRACT_ADDRESSES.fileStorage, provider);
        const stakingContractDeployed = await isContractDeployed(CONTRACT_ADDRESSES.stakingContract, provider);
        
        setContractsDeployed(storageTokenDeployed && fileStorageDeployed && stakingContractDeployed);
        
        // Even if not deployed, create contract instances for future use
        const storageToken = new ethers.Contract(
          CONTRACT_ADDRESSES.storageToken,
          storageTokenAbi.abi,
          signer
        );
        
        const fileStorage = new ethers.Contract(
          CONTRACT_ADDRESSES.fileStorage,
          fileStorageAbi.abi,
          signer
        );
        
        const stakingContract = new ethers.Contract(
          CONTRACT_ADDRESSES.stakingContract,
          stakingContractAbi.abi,
          signer
        );

        setContracts({
          storageToken,
          fileStorage,
          stakingContract,
        });

        // Get ETH balance
        try {
          const balance = await provider.getBalance(account);
          setEthBalance(ethers.formatEther(balance));
        } catch (err) {
          console.warn('Could not get ETH balance:', err);
        }

        // Get token balance only if the contract is deployed
        if (storageTokenDeployed) {
          try {
            const tokenBalance = await storageToken.balanceOf(account);
            setTokenBalance(ethers.formatUnits(tokenBalance, 18));
          } catch (err) {
            console.warn('Could not get token balance:', err);
            // Silent fail - the contract might not be fully deployed or not have the right interface
          }
        }
      } catch (err) {
        console.error('Failed to initialize contracts:', err);
        // Continue without contract initialization
      }

      setIsConnected(true);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError(error.message || 'Failed to connect wallet');
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, [isContractDeployed]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setNetwork(null);
    setIsConnected(false);
    setContracts({
      storageToken: null,
      fileStorage: null,
      stakingContract: null,
    });
    setEthBalance('0');
    setTokenBalance('0');
    setContractsDeployed(false);
  }, []);

  // Update balances
  const updateBalances = useCallback(async () => {
    if (isConnected && provider && account) {
      try {
        // Get ETH balance
        const balance = await provider.getBalance(account);
        setEthBalance(ethers.formatEther(balance));

        // Get token balance only if contracts are deployed
        if (contractsDeployed && contracts.storageToken) {
          try {
            const tokenBalance = await contracts.storageToken.balanceOf(account);
            setTokenBalance(ethers.formatUnits(tokenBalance, 18));
          } catch (err) {
            console.warn('Could not get token balance:', err);
          }
        }
      } catch (error) {
        console.error('Error updating balances:', error);
      }
    }
  }, [isConnected, provider, account, contracts.storageToken, contractsDeployed]);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          disconnectWallet();
        } else if (accounts[0] !== account) {
          // User switched accounts
          setAccount(accounts[0]);
          // Reconnect with new account
          connectWallet();
        }
      };

      const handleChainChanged = () => {
        // Reload the page when the chain changes
        window.location.reload();
      };

      try {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);

        // Check if already connected
        window.ethereum.request({ method: 'eth_accounts' })
          .then((accounts) => {
            if (accounts.length > 0) {
              connectWallet();
            } else {
              setLoading(false);
            }
          })
          .catch((error) => {
            console.error('Error checking accounts:', error);
            setLoading(false);
          });
      } catch (error) {
        console.error('Error setting up ethereum event listeners:', error);
        setLoading(false);
      }

      return () => {
        try {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        } catch (error) {
          console.error('Error removing ethereum event listeners:', error);
        }
      };
    } else {
      setLoading(false);
    }
  }, [connectWallet, disconnectWallet, account]);

  // In the Web3Provider component, add this early in the initialization
  useEffect(() => {
    // Auto-connect a demo wallet when running on Vercel
    if (isVercelDeployment()) {
      console.log('Vercel deployment detected - connecting demo wallet');
      setDemoWallet();
      setIsConnected(true);
    }
  }, []);

  // Add a demo wallet function
  const setDemoWallet = () => {
    // Set a fake demo account
    setAccount('0xDemoUser1234567890123456789012345678901234');
    setTokenBalance('1000');
    setIsConnected(true);
    setNetwork({
      chainId: '0x539',
      name: 'Demo Network',
      testnet: true
    });
    setContractsDeployed(true);
  };

  // Provide values to components
  const value = {
    account,
    provider,
    signer,
    network,
    isConnected,
    contracts,
    loading,
    error,
    ethBalance,
    tokenBalance,
    connectWallet,
    disconnectWallet,
    updateBalances,
    contractsDeployed
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}; 