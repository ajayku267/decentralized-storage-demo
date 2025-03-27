import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '../components/Timeline';
import {
  Storage,
  Security,
  Speed,
  CloudUpload,
  Devices,
  AccountBalance,
  Code,
  PersonAdd,
  FileUpload,
  VerifiedUser,
  Share,
} from '@mui/icons-material';

const AboutPage = () => {
  const theme = useTheme();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Hero Section */}
      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, md: 6 },
          mb: 6,
          borderRadius: 2,
          backgroundImage: 'linear-gradient(to right, #4568dc, #b06ab3)',
          color: 'white',
        }}
      >
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={7}>
            <Typography variant="h3" component="h1" gutterBottom>
              About Our Decentralized Storage Platform
            </Typography>
            <Typography variant="h6" paragraph>
              A secure, blockchain-powered storage solution that gives you full control over your data.
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              component={RouterLink}
              to="/dashboard"
              sx={{ mt: 2 }}
            >
              Get Started
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
              <Storage sx={{ fontSize: 180, opacity: 0.8 }} />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Our Mission */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Our Mission
        </Typography>
        <Typography variant="body1" paragraph align="center" sx={{ maxWidth: 800, mx: 'auto' }}>
          We're building a decentralized future where data storage is secure, accessible, and controlled
          by users, not corporations. Our platform leverages blockchain technology and a distributed
          network of storage providers to create a resilient and censorship-resistant storage ecosystem.
        </Typography>
      </Box>

      {/* How It Works */}
      <Paper elevation={2} sx={{ p: 4, mb: 8, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom align="center">
          How It Works
        </Typography>
        <Divider sx={{ mb: 4 }} />

        <Timeline position="alternate">
          <TimelineItem className="MuiTimelineItem-root">
            <TimelineSeparator className="MuiTimelineSeparator-root">
              <TimelineDot color="primary">
                <PersonAdd />
              </TimelineDot>
              <TimelineConnector className="MuiTimelineConnector-root" />
            </TimelineSeparator>
            <TimelineContent className="MuiTimelineContent-root">
              <Typography variant="h6" component="span">
                Connect Your Wallet
              </Typography>
              <Typography>
                Connect your Ethereum wallet to access the platform and securely manage your files.
              </Typography>
            </TimelineContent>
          </TimelineItem>

          <TimelineItem className="MuiTimelineItem-root">
            <TimelineSeparator className="MuiTimelineSeparator-root">
              <TimelineDot color="primary">
                <FileUpload />
              </TimelineDot>
              <TimelineConnector className="MuiTimelineConnector-root" />
            </TimelineSeparator>
            <TimelineContent className="MuiTimelineContent-root">
              <Typography variant="h6" component="span">
                Upload Files
              </Typography>
              <Typography>
                Files are encrypted and split into pieces before being distributed across the network.
              </Typography>
            </TimelineContent>
          </TimelineItem>

          <TimelineItem className="MuiTimelineItem-root">
            <TimelineSeparator className="MuiTimelineSeparator-root">
              <TimelineDot color="primary">
                <Storage />
              </TimelineDot>
              <TimelineConnector className="MuiTimelineConnector-root" />
            </TimelineSeparator>
            <TimelineContent className="MuiTimelineContent-root">
              <Typography variant="h6" component="span">
                Distributed Storage
              </Typography>
              <Typography>
                Your files are stored across multiple providers, ensuring redundancy and availability.
              </Typography>
            </TimelineContent>
          </TimelineItem>

          <TimelineItem className="MuiTimelineItem-root">
            <TimelineSeparator className="MuiTimelineSeparator-root">
              <TimelineDot color="primary">
                <VerifiedUser />
              </TimelineDot>
              <TimelineConnector className="MuiTimelineConnector-root" />
            </TimelineSeparator>
            <TimelineContent className="MuiTimelineContent-root">
              <Typography variant="h6" component="span">
                Smart Contract Verification
              </Typography>
              <Typography>
                Blockchain smart contracts verify storage proofs and manage access controls.
              </Typography>
            </TimelineContent>
          </TimelineItem>

          <TimelineItem className="MuiTimelineItem-root">
            <TimelineSeparator className="MuiTimelineSeparator-root">
              <TimelineDot color="primary">
                <Share />
              </TimelineDot>
            </TimelineSeparator>
            <TimelineContent className="MuiTimelineContent-root">
              <Typography variant="h6" component="span">
                Secure Sharing
              </Typography>
              <Typography>
                Grant and revoke access to your files using cryptographic permissions.
              </Typography>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      </Paper>

      {/* Key Features */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Key Features
        </Typography>
        <Divider sx={{ mb: 4 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Security sx={{ color: 'primary.main', mr: 2, fontSize: 40 }} />
                  <Typography variant="h5" component="h2">
                    End-to-End Encryption
                  </Typography>
                </Box>
                <Typography variant="body1">
                  All files are encrypted before they leave your device, ensuring that only you
                  and those you authorize can access your data.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Devices sx={{ color: 'primary.main', mr: 2, fontSize: 40 }} />
                  <Typography variant="h5" component="h2">
                    Multi-Device Access
                  </Typography>
                </Box>
                <Typography variant="body1">
                  Access your files from any device using your wallet. Your data follows you
                  wherever you go, securely and conveniently.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Speed sx={{ color: 'primary.main', mr: 2, fontSize: 40 }} />
                  <Typography variant="h5" component="h2">
                    High Performance
                  </Typography>
                </Box>
                <Typography variant="body1">
                  Our network's optimized retrieval protocols ensure fast access to your files,
                  rivaling traditional centralized storage solutions.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Technology Stack */}
      <Paper elevation={2} sx={{ p: 4, mb: 8, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom align="center">
          Technology Stack
        </Typography>
        <Divider sx={{ mb: 4 }} />

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Code color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Ethereum Blockchain"
                  secondary="Smart contracts provide the foundation for our decentralized storage marketplace."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Storage color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="IPFS Protocol"
                  secondary="The InterPlanetary File System provides a distributed architecture for file storage."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Security color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Advanced Encryption"
                  secondary="AES-256 encryption ensures your files remain private and secure."
                />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <List>
              <ListItem>
                <ListItemIcon>
                  <AccountBalance color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="ERC-20 Tokenomics"
                  secondary="Our native token incentivizes storage providers and enables the platform economy."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CloudUpload color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Distributed Storage Network"
                  secondary="A network of independent storage providers ensures redundancy and high availability."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Speed color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="React & Web3"
                  secondary="Modern web technologies provide a seamless and responsive user experience."
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Paper>

      {/* Become a Provider Section */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mb: 8,
          borderRadius: 2,
          backgroundImage: 'linear-gradient(to right, #134e5e, #71b280)',
          color: 'white',
        }}
      >
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h4" gutterBottom>
              Become a Storage Provider
            </Typography>
            <Typography variant="body1" paragraph>
              Have unused storage capacity? Join our network of storage providers and earn tokens
              by contributing your storage resources to the decentralized ecosystem.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="secondary"
                component={RouterLink}
                to="/provider/register"
                size="large"
                sx={{ mr: 2 }}
              >
                Register as Provider
              </Button>
              <Button
                variant="outlined"
                component={RouterLink}
                to="/provider"
                size="large"
                sx={{ color: 'white', borderColor: 'white' }}
              >
                Learn More
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Storage sx={{ fontSize: 150, opacity: 0.8 }} />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* FAQ Section Teaser */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Have Questions?
        </Typography>
        <Typography variant="body1" paragraph>
          Check out our comprehensive FAQ section or reach out to our community for support.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to="/faq"
          size="large"
        >
          View FAQ
        </Button>
      </Box>
    </Container>
  );
};

export default AboutPage; 