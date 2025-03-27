import React, { useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Paper,
  Card,
  CardContent,
  CardActions,
  Divider,
  useTheme,
} from '@mui/material';
import {
  CloudUpload,
  Security,
  Storage,
  AccountBalanceWallet,
  Speed,
  Lock,
} from '@mui/icons-material';
import { Web3Context } from '../context/Web3Context';

const FeatureCard = ({ icon, title, description }) => (
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }} elevation={2}>
    <CardContent sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        {icon}
      </Box>
      <Typography variant="h5" component="h3" gutterBottom align="center">
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center">
        {description}
      </Typography>
    </CardContent>
  </Card>
);

const HomePage = () => {
  const theme = useTheme();
  const { isConnected, connectWallet } = useContext(Web3Context);

  const features = [
    {
      icon: <Security sx={{ fontSize: 50, color: theme.palette.primary.main }} />,
      title: 'Secure Storage',
      description:
        'Your files are encrypted and securely stored across a distributed network of storage providers.',
    },
    {
      icon: <Speed sx={{ fontSize: 50, color: theme.palette.primary.main }} />,
      title: 'Fast Retrieval',
      description:
        'Optimized protocols ensure your files are quickly accessible whenever you need them.',
    },
    {
      icon: <Lock sx={{ fontSize: 50, color: theme.palette.primary.main }} />,
      title: 'Access Control',
      description:
        'Maintain complete control over who can access your files using blockchain-based permissions.',
    },
    {
      icon: <Storage sx={{ fontSize: 50, color: theme.palette.primary.main }} />,
      title: 'Provider Network',
      description:
        'A growing network of storage providers ensures redundancy and availability of your data.',
    },
    {
      icon: <AccountBalanceWallet sx={{ fontSize: 50, color: theme.palette.primary.main }} />,
      title: 'Token Economy',
      description:
        'Incentivize storage providers with token rewards, creating a sustainable ecosystem.',
    },
    {
      icon: <CloudUpload sx={{ fontSize: 50, color: theme.palette.primary.main }} />,
      title: 'Simple Interface',
      description: 'User-friendly interface makes uploading, sharing, and managing files effortless.',
    },
  ];

  return (
    <Box>
      {/* Hero section */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          pt: 8,
          pb: 6,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)), url(/images/hero-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography
            component="h1"
            variant="h2"
            align="center"
            color="text.primary"
            gutterBottom
          >
            Decentralized Storage
          </Typography>
          <Typography variant="h5" align="center" color="text.secondary" paragraph>
            A blockchain-powered platform for secure, decentralized file storage.
            Store your files across a distributed network of providers with complete
            privacy and control over your data.
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            {isConnected ? (
              <Button
                variant="contained"
                color="primary"
                size="large"
                component={RouterLink}
                to="/upload"
                startIcon={<CloudUpload />}
              >
                Upload Files
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={connectWallet}
                startIcon={<AccountBalanceWallet />}
              >
                Connect Wallet
              </Button>
            )}
            <Button
              variant="outlined"
              color="primary"
              size="large"
              component={RouterLink}
              to="/about"
            >
              Learn More
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features section */}
      <Container sx={{ py: 8 }} maxWidth="lg">
        <Typography variant="h3" align="center" gutterBottom>
          Features
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
          Why choose our decentralized storage solution
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item key={index} xs={12} sm={6} md={4}>
              <FeatureCard {...feature} />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How it works section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="md">
          <Typography variant="h3" align="center" gutterBottom>
            How It Works
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
            Simple steps to get started with decentralized storage
          </Typography>

          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <AccountBalanceWallet sx={{ fontSize: 80, color: theme.palette.primary.main }} />
                <Typography variant="h5" component="h3" gutterBottom sx={{ mt: 2 }}>
                  1. Connect Wallet
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Connect your crypto wallet to access the platform and manage your storage.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <CloudUpload sx={{ fontSize: 80, color: theme.palette.primary.main }} />
                <Typography variant="h5" component="h3" gutterBottom sx={{ mt: 2 }}>
                  2. Upload Files
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Upload your files to the platform. They are encrypted and distributed across providers.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Lock sx={{ fontSize: 80, color: theme.palette.primary.main }} />
                <Typography variant="h5" component="h3" gutterBottom sx={{ mt: 2 }}>
                  3. Manage Access
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Control who can access your files. Share securely with specific wallet addresses.
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              component={RouterLink}
              to={isConnected ? '/dashboard' : '/'}
              onClick={!isConnected ? connectWallet : undefined}
            >
              {isConnected ? 'Go to Dashboard' : 'Get Started'}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Become a provider section */}
      <Container sx={{ py: 8 }} maxWidth="md">
        <Paper elevation={3} sx={{ p: { xs: 3, md: 6 }, borderRadius: 2 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant="h4" gutterBottom>
                Become a Storage Provider
              </Typography>
              <Typography variant="body1" paragraph color="text.secondary">
                Have unused storage space? Join our network of storage providers and earn tokens by
                contributing your storage capacity to the decentralized network.
              </Typography>
              <Typography variant="body1" paragraph color="text.secondary">
                The platform rewards reliable providers with tokens based on their storage
                contributions and performance metrics.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                component={RouterLink}
                to="/provider"
                sx={{ mt: 2 }}
              >
                Become a Provider
              </Button>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                }}
              >
                <Storage sx={{ fontSize: 180, color: theme.palette.primary.main, opacity: 0.7 }} />
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default HomePage; 