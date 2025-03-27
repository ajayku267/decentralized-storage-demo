import React, { useContext, useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Chip,
  TextField,
  LinearProgress,
  useTheme,
} from '@mui/material';
import {
  Storage,
  CloudUpload,
  Person,
  Monitor,
  Speed,
  CheckCircle,
  Error,
  ArrowUpward,
  AccountBalance,
  CreditCard,
  ArrowForward,
} from '@mui/icons-material';
import { StorageContext } from '../context/StorageContext';
import { Web3Context } from '../context/Web3Context';

const ProviderDashboardPage = () => {
  const theme = useTheme();
  const { getStorageProviders, providers, loading, error } = useContext(StorageContext);
  const { account, isConnected, tokenBalance } = useContext(Web3Context);
  const [currentProvider, setCurrentProvider] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);

  // Fetch provider data on component mount
  useEffect(() => {
    getStorageProviders();
  }, [getStorageProviders]);

  // Check if user is registered as a provider
  useEffect(() => {
    if (isConnected && account && providers?.length > 0) {
      const provider = providers.find(
        (p) => p.address.toLowerCase() === account.toLowerCase()
      );
      if (provider) {
        setCurrentProvider(provider);
        setIsRegistered(true);
      } else {
        setIsRegistered(false);
      }
    }
  }, [isConnected, account, providers]);

  // Provider stats (sample data - would be real data in a full implementation)
  const providerStats = {
    totalSpace: currentProvider?.totalSpace || '10 TB',
    usedSpace: '2.3 TB',
    availableSpace: '7.7 TB',
    filesStored: 142,
    uptime: '99.8%',
    responseTime: '120 ms',
    successRate: '99.5%',
    reputation: currentProvider?.reputation || 95,
    totalEarned: '1,245.50',
    stakedAmount: '5,000',
    lastPayout: '2023-05-15',
    nextEstimatedPayout: '2023-06-15',
  };

  // Format percentage for progress bar
  const usedSpacePercentage = 23; // Would calculate from real data

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Storage Provider Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        {isRegistered
          ? 'Monitor your storage node performance and earnings.'
          : 'Register as a storage provider to earn tokens by contributing storage space.'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!isConnected ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Connect your wallet to manage your storage provider node.
          </Typography>
        </Paper>
      ) : !isRegistered ? (
        <Box>
          <Paper sx={{ p: 4, mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Become a Storage Provider
            </Typography>
            <Typography variant="body1" paragraph>
              Contribute your unused storage space to our decentralized network and earn tokens.
              Storage providers receive rewards based on the amount of space provided and their
              performance metrics.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              component={RouterLink}
              to="/provider/register"
              startIcon={<CloudUpload />}
              size="large"
            >
              Register as Provider
            </Button>
          </Paper>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Storage sx={{ color: 'primary.main', mr: 1 }} />
                    <Typography variant="h6">Provide Storage</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Allocate unused disk space on your server or high-uptime machine to the network.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CreditCard sx={{ color: 'primary.main', mr: 1 }} />
                    <Typography variant="h6">Stake Tokens</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Stake tokens as collateral to ensure reliable service and maximize your earnings.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccountBalance sx={{ color: 'primary.main', mr: 1 }} />
                    <Typography variant="h6">Earn Rewards</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Receive token rewards for storing files and maintaining high availability and performance.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      ) : (
        <Box>
          {/* Provider Overview */}
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Person sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h5">Provider Details</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {account}
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Storage Capacity
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ flexGrow: 1, mr: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={usedSpacePercentage}
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                    </Box>
                    <Typography variant="body2">
                      {usedSpacePercentage}% Used
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Used: {providerStats.usedSpace}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Available: {providerStats.availableSpace}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total: {providerStats.totalSpace}
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Files Stored
                      </Typography>
                      <Typography variant="h6">{providerStats.filesStored}</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Uptime
                      </Typography>
                      <Typography variant="h6">{providerStats.uptime}</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Response Time
                      </Typography>
                      <Typography variant="h6">{providerStats.responseTime}</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Success Rate
                      </Typography>
                      <Typography variant="h6">{providerStats.successRate}</Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper elevation={1} sx={{ p: 2, height: '100%', bgcolor: 'primary.light' }}>
                  <Typography variant="h6" gutterBottom>
                    Provider Status
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
                    <Typography variant="body1">Active and Online</Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" gutterBottom>
                    Reputation Score
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={providerStats.reputation}
                        color="success"
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                    <Typography variant="body2">{providerStats.reputation}%</Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    component={RouterLink}
                    to="/provider/settings"
                    endIcon={<ArrowForward />}
                  >
                    Manage Provider
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          </Paper>

          {/* Earnings and Rewards */}
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Earnings & Rewards
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="subtitle1">Current Balance</Typography>
                  <Typography variant="h4" color="primary.main" sx={{ my: 1 }}>
                    {tokenBalance} Tokens
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Available for withdrawal or staking
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="subtitle1">Total Earned</Typography>
                  <Typography variant="h4" sx={{ my: 1 }}>
                    {providerStats.totalEarned} Tokens
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Lifetime earnings
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="subtitle1">Staked Amount</Typography>
                  <Typography variant="h4" sx={{ my: 1 }}>
                    {providerStats.stakedAmount} Tokens
                  </Typography>
                  <Box sx={{ display: 'flex', mt: 1 }}>
                    <Button variant="outlined" size="small" sx={{ mr: 1 }}>
                      Stake More
                    </Button>
                    <Button variant="outlined" size="small" color="secondary">
                      Unstake
                    </Button>
                  </Box>
                </Box>
              </Grid>
            </Grid>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle1">Next Payout Estimate</Typography>
                <Typography variant="body1">
                  {providerStats.nextEstimatedPayout} (in ~15 days)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last payout: {providerStats.lastPayout}
                </Typography>
              </Box>
              <Button variant="contained" color="primary">
                Claim Rewards
              </Button>
            </Box>
          </Paper>

          {/* Performance Metrics */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Performance Metrics
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Your node's performance affects your reputation score and reward rates.
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={6} lg={3}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Monitor sx={{ color: 'success.main', mr: 1 }} />
                      <Typography variant="h6">Uptime</Typography>
                    </Box>
                    <Typography variant="h4" gutterBottom>
                      {providerStats.uptime}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ArrowUpward fontSize="small" sx={{ color: 'success.main', mr: 0.5 }} />
                      <Typography variant="body2" color="success.main">
                        0.2% from last week
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Speed sx={{ color: 'info.main', mr: 1 }} />
                      <Typography variant="h6">Response Time</Typography>
                    </Box>
                    <Typography variant="h4" gutterBottom>
                      {providerStats.responseTime}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ArrowUpward fontSize="small" sx={{ color: 'success.main', mr: 0.5 }} />
                      <Typography variant="body2" color="success.main">
                        10ms faster than average
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
                      <Typography variant="h6">Success Rate</Typography>
                    </Box>
                    <Typography variant="h4" gutterBottom>
                      {providerStats.successRate}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ArrowUpward fontSize="small" sx={{ color: 'success.main', mr: 0.5 }} />
                      <Typography variant="body2" color="success.main">
                        0.5% from last month
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Error sx={{ color: 'warning.main', mr: 1 }} />
                      <Typography variant="h6">Failed Retrievals</Typography>
                    </Box>
                    <Typography variant="h4" gutterBottom>
                      0.5%
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ArrowUpward fontSize="small" sx={{ color: 'success.main', mr: 0.5 }} />
                      <Typography variant="body2" color="success.main">
                        0.2% better than threshold
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      )}
    </Container>
  );
};

export default ProviderDashboardPage;