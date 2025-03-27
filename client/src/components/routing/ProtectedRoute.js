import React, { useContext } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Web3Context } from '../../context/Web3Context';
import { Box, Typography, Button, Paper, Container } from '@mui/material';
import { AccountBalanceWallet } from '@mui/icons-material';

const ProtectedRoute = () => {
  const { isConnected, connectWallet, loading } = useContext(Web3Context);
  const location = useLocation();
  const navigate = useNavigate();

  // If still loading, show loading state
  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
          }}
        >
          <Typography variant="h6" gutterBottom textAlign="center">
            Loading wallet status...
          </Typography>
        </Box>
      </Container>
    );
  }

  // If not connected, show connect wallet UI
  if (!isConnected) {
    return (
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '40vh',
            }}
          >
            <AccountBalanceWallet sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom textAlign="center">
              Wallet Connection Required
            </Typography>
            <Typography variant="body1" color="text.secondary" textAlign="center" paragraph>
              You need to connect your wallet to access this page. All your data is stored securely on the blockchain.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<AccountBalanceWallet />}
              onClick={connectWallet}
              sx={{ mt: 2 }}
            >
              Connect Wallet
            </Button>
            <Button
              variant="text"
              color="primary"
              onClick={() => navigate('/')}
              sx={{ mt: 2 }}
            >
              Return to Home
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  // If connected, render the protected route
  return <Outlet />;
};

export default ProtectedRoute; 