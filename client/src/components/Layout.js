import React, { useContext } from 'react';
import { Box, AppBar, Toolbar, Typography, Button, Container, Avatar, IconButton, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Outlet, Link as RouterLink } from 'react-router-dom';
import { Web3Context } from '../context/Web3Context';
import { StorageContext } from '../context/StorageContext';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

const Layout = () => {
  const theme = useTheme();
  const { isConnected, account, connectWallet, disconnectWallet, ethBalance, contractsDeployed } = useContext(Web3Context);
  const { demoMode } = useContext(StorageContext);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <RouterLink to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              Decentralized Storage
            </RouterLink>
          </Typography>
          <Button color="inherit" component={RouterLink} to="/" sx={{ mr: 1 }}>
            Home
          </Button>
          <Button color="inherit" component={RouterLink} to="/about" sx={{ mr: 1 }}>
            About
          </Button>
          {isConnected && (
            <>
              <Button color="inherit" component={RouterLink} to="/dashboard" sx={{ mr: 1 }}>
                Dashboard
              </Button>
              <Button color="inherit" component={RouterLink} to="/upload" sx={{ mr: 1 }}>
                Upload
              </Button>
            </>
          )}
          {isConnected ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ mr: 1 }}>
                {ethBalance.substring(0, 6)} ETH
              </Typography>
              <Button
                variant="outlined"
                color="inherit"
                onClick={disconnectWallet}
                sx={{ borderColor: 'white' }}
              >
                {`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}
              </Button>
            </Box>
          ) : (
            <Button
              variant="outlined"
              color="inherit"
              onClick={connectWallet}
              sx={{ borderColor: 'white' }}
            >
              Connect Wallet
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {demoMode && (
        <Alert severity="info" sx={{ width: '100%' }}>
          Running in demo mode. Backend API is unavailable. Using sample data.
        </Alert>
      )}

      {isConnected && !contractsDeployed && (
        <Alert severity="warning" sx={{ width: '100%' }}>
          Smart contracts not detected on this network. Some features may be unavailable.
        </Alert>
      )}

      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Outlet />
      </Container>

      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: theme.palette.primary.main,
          color: 'white',
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="body1" align="center">
            © 2023 Decentralized Storage Platform
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout; 