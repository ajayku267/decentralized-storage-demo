import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Typography, Button, Paper, useTheme } from '@mui/material';
import { SentimentDissatisfied, Home, ArrowBack } from '@mui/icons-material';

const NotFoundPage = () => {
  const theme = useTheme();

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          textAlign: 'center',
          borderRadius: 2,
          bgcolor: 'background.paper',
        }}
      >
        <SentimentDissatisfied sx={{ fontSize: 100, color: 'text.secondary', mb: 2 }} />

        <Typography variant="h2" gutterBottom>
          404
        </Typography>

        <Typography variant="h4" gutterBottom>
          Page Not Found
        </Typography>

        <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 500, mx: 'auto' }}>
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </Typography>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/"
            startIcon={<Home />}
          >
            Go to Home
          </Button>
          <Button
            variant="outlined"
            component={RouterLink}
            to={-1}
            startIcon={<ArrowBack />}
          >
            Go Back
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default NotFoundPage; 