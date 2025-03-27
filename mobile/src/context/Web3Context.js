import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Alert } from 'react-native';

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          setProvider(provider);
          setSigner(provider.getSigner());
        }
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        Alert.alert('Error', 'Please install MetaMask or another Web3 wallet');
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const accounts = await provider.listAccounts();
      
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        setProvider(provider);
        setSigner(provider.getSigner());
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      Alert.alert('Error', 'Failed to connect wallet');
    }
  };

  const disconnectWallet = async () => {
    try {
      setAccount(null);
      setIsConnected(false);
      setProvider(null);
      setSigner(null);
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      Alert.alert('Error', 'Failed to disconnect wallet');
    }
  };

  const value = {
    account,
    isConnected,
    provider,
    signer,
    connectWallet,
    disconnectWallet,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

export default Web3Context; 