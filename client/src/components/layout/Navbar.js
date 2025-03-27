import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Chip,
  Box,
  Divider,
  ListItemIcon,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountBalanceWallet,
  CloudUpload,
  Dashboard,
  Storage,
  Info,
  Home,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { Web3Context } from '../../context/Web3Context';

// Helper to truncate address
const truncateAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { pathname } = useLocation();
  
  const {
    account,
    isConnected,
    connectWallet,
    disconnectWallet,
    ethBalance,
    tokenBalance,
    network,
  } = useContext(Web3Context);
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountMenuAnchor, setAccountMenuAnchor] = useState(null);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleAccountMenuOpen = (event) => {
    setAccountMenuAnchor(event.currentTarget);
  };

  const handleAccountMenuClose = () => {
    setAccountMenuAnchor(null);
  };

  const handleDisconnect = () => {
    disconnectWallet();
    handleAccountMenuClose();
  };

  const navItems = [
    { text: 'Home', path: '/', icon: <Home /> },
    { text: 'Dashboard', path: '/dashboard', icon: <Dashboard /> },
    { text: 'Upload', path: '/upload', icon: <CloudUpload /> },
    { text: 'Storage Provider', path: '/provider', icon: <Storage /> },
    { text: 'About', path: '/about', icon: <Info /> },
  ];

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation" onClick={handleDrawerToggle}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" component="div">
          Decentralized Storage
        </Typography>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem
            button
            component={Link}
            to={item.path}
            key={item.text}
            selected={pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        {isConnected ? (
          <>
            <Typography variant="subtitle2" gutterBottom>
              Connected Account
            </Typography>
            <Chip
              icon={<AccountBalanceWallet />}
              label={truncateAddress(account)}
              color="primary"
              variant="outlined"
              sx={{ mb: 1, width: '100%' }}
            />
            <Typography variant="caption" display="block" gutterBottom>
              ETH Balance: {parseFloat(ethBalance).toFixed(4)}
            </Typography>
            <Typography variant="caption" display="block" gutterBottom>
              Token Balance: {parseFloat(tokenBalance).toFixed(2)}
            </Typography>
            <Typography variant="caption" display="block" gutterBottom>
              Network: {network?.name || 'Unknown'}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              color="secondary"
              onClick={disconnectWallet}
              sx={{ mt: 1 }}
            >
              Disconnect
            </Button>
          </>
        ) : (
          <Button
            size="small"
            variant="contained"
            color="primary"
            onClick={connectWallet}
            startIcon={<AccountBalanceWallet />}
            fullWidth
          >
            Connect Wallet
          </Button>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Storage sx={{ mr: 1 }} /> Decentralized Storage
          </Typography>

          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {navItems.map((item) => (
                <Button
                  key={item.text}
                  component={Link}
                  to={item.path}
                  color="inherit"
                  sx={{ mx: 1 }}
                  startIcon={item.icon}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}

          {isConnected ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {!isMobile && (
                <Chip
                  label={`${parseFloat(ethBalance).toFixed(4)} ETH`}
                  size="small"
                  sx={{ mr: 1 }}
                />
              )}
              <Button
                color="inherit"
                onClick={handleAccountMenuOpen}
                endIcon={Boolean(accountMenuAnchor) ? <ExpandLess /> : <ExpandMore />}
                sx={{ 
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 4,
                  px: 2,
                }}
              >
                <Avatar
                  sx={{
                    width: 24,
                    height: 24,
                    mr: 1,
                    bgcolor: theme.palette.primary.main,
                  }}
                >
                  {account ? account.slice(2, 4) : ''}
                </Avatar>
                {truncateAddress(account)}
              </Button>

              <Menu
                anchorEl={accountMenuAnchor}
                open={Boolean(accountMenuAnchor)}
                onClose={handleAccountMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem sx={{ display: 'block', minWidth: '200px' }}>
                  <Typography variant="caption">Account</Typography>
                  <Typography variant="body2">{account}</Typography>
                </MenuItem>
                <MenuItem sx={{ display: 'block' }}>
                  <Typography variant="caption">ETH Balance</Typography>
                  <Typography variant="body2">{ethBalance} ETH</Typography>
                </MenuItem>
                <MenuItem sx={{ display: 'block' }}>
                  <Typography variant="caption">Token Balance</Typography>
                  <Typography variant="body2">{tokenBalance} Tokens</Typography>
                </MenuItem>
                <MenuItem sx={{ display: 'block' }}>
                  <Typography variant="caption">Network</Typography>
                  <Typography variant="body2">{network?.name || 'Unknown'}</Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleDisconnect}>Disconnect</MenuItem>
              </Menu>
            </Box>
          ) : (
            <Button
              color="primary"
              variant="contained"
              onClick={connectWallet}
              startIcon={<AccountBalanceWallet />}
              size="small"
            >
              Connect Wallet
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar; 