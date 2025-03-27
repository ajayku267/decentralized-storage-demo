import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useWeb3 } from '../context/Web3Context';
import CrossChainService from '../services/crossChainService';

const CrossChainTransfer = () => {
  const { account, provider, signer } = useWeb3();
  const [chains, setChains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [targetChain, setTargetChain] = useState('');
  const [pendingTransfers, setPendingTransfers] = useState([]);

  const crossChainService = new CrossChainService(provider, signer);

  useEffect(() => {
    loadData();
  }, [account]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [supportedChains, transfers] = await Promise.all([
        crossChainService.getSupportedChains(),
        crossChainService.getPendingTransfers(),
      ]);
      setChains(supportedChains);
      setPendingTransfers(transfers);
    } catch (error) {
      setError('Failed to load cross-chain data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    try {
      await crossChainService.initiateTransfer(
        recipient,
        ethers.utils.parseEther(amount),
        targetChain
      );
      setRecipient('');
      setAmount('');
      setTargetChain('');
      loadData();
    } catch (error) {
      setError('Failed to initiate transfer');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Cross-Chain Transfer
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Recipient Address"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    error={!ethers.utils.isAddress(recipient) && recipient !== ''}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Amount (STOR)"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    error={Number(amount) <= 0 && amount !== ''}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Target Chain</InputLabel>
                    <Select
                      value={targetChain}
                      onChange={(e) => setTargetChain(e.target.value)}
                      label="Target Chain"
                    >
                      {chains.map((chain) => (
                        <MenuItem key={chain.chainId} value={chain.chainId}>
                          Chain ID: {chain.chainId}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={handleTransfer}
                    disabled={
                      !ethers.utils.isAddress(recipient) ||
                      Number(amount) <= 0 ||
                      !targetChain
                    }
                  >
                    Initiate Transfer
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pending Transfers
              </Typography>
              {pendingTransfers.map((transfer) => (
                <Box key={transfer.transferId} sx={{ mb: 2, p: 2, bgcolor: 'grey.100' }}>
                  <Typography variant="subtitle1">
                    Transfer ID: {transfer.transferId.slice(0, 8)}...
                  </Typography>
                  <Typography>From: {transfer.from.slice(0, 6)}...{transfer.from.slice(-4)}</Typography>
                  <Typography>To: {transfer.to.slice(0, 6)}...{transfer.to.slice(-4)}</Typography>
                  <Typography>
                    Amount: {ethers.utils.formatEther(transfer.amount)} STOR
                  </Typography>
                  <Typography>
                    From Chain: {transfer.sourceChainId}
                  </Typography>
                  <Typography>
                    To Chain: {transfer.targetChainId}
                  </Typography>
                  <Typography>
                    Status: {transfer.executed ? 'Executed' : 'Pending'}
                  </Typography>
                </Box>
              ))}
              {pendingTransfers.length === 0 && (
                <Typography color="textSecondary">
                  No pending transfers
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CrossChainTransfer; 