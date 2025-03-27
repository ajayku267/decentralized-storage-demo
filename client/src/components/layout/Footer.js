import React from 'react';
import { Box, Container, Typography, Link, Divider, IconButton, useTheme } from '@mui/material';
import { GitHub, Twitter, LinkedIn } from '@mui/icons-material';

const Footer = () => {
  const theme = useTheme();
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: theme.palette.mode === 'light' 
          ? theme.palette.grey[100] 
          : theme.palette.grey[900],
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', md: 'flex-start' },
            mb: 2,
          }}
        >
          <Box sx={{ mb: { xs: 2, md: 0 } }}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Decentralized Storage
            </Typography>
            <Typography variant="body2" color="text.secondary">
              A blockchain-based decentralized storage solution
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Resources
            </Typography>
            <Link href="/about" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
              About
            </Link>
            <Link href="/docs" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
              Documentation
            </Link>
            <Link href="/faq" color="text.secondary" display="block">
              FAQ
            </Link>
          </Box>

          <Box>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Community
            </Typography>
            <Link href="#" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
              Discord
            </Link>
            <Link href="#" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
              Twitter
            </Link>
            <Link href="#" color="text.secondary" display="block">
              GitHub
            </Link>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {year} Decentralized Storage. All rights reserved.
          </Typography>

          <Box sx={{ mt: { xs: 2, sm: 0 } }}>
            <IconButton aria-label="github" color="inherit" size="small">
              <GitHub fontSize="small" />
            </IconButton>
            <IconButton aria-label="twitter" color="inherit" size="small">
              <Twitter fontSize="small" />
            </IconButton>
            <IconButton aria-label="linkedin" color="inherit" size="small">
              <LinkedIn fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 