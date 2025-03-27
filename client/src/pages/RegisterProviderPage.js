import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  FormControlLabel,
  Switch,
  Alert,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  InputAdornment,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Storage,
  Save,
  ArrowBack,
  ArrowForward,
  Check,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { StorageContext } from '../context/StorageContext';
import { Web3Context } from '../context/Web3Context';

const RegisterProviderPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { registerAsProvider, loading, error } = useContext(StorageContext);
  const { account, isConnected } = useContext(Web3Context);

  // State
  const [activeStep, setActiveStep] = useState(0);
  const [totalSpace, setTotalSpace] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [nodeInfo, setNodeInfo] = useState({
    name: '',
    location: '',
    ipAddress: '',
    port: '',
    description: '',
  });
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Steps
  const steps = ['Basic Information', 'Node Configuration', 'Security Verification'];

  // Validate first step
  const validateStep1 = () => {
    const errors = {};
    
    if (!totalSpace || isNaN(Number(totalSpace)) || Number(totalSpace) <= 0) {
      errors.totalSpace = 'Please enter a valid amount of storage space';
    }
    
    if (!nodeInfo.name) {
      errors.name = 'Node name is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate second step
  const validateStep2 = () => {
    const errors = {};
    
    if (nodeInfo.ipAddress && !/^(\d{1,3}\.){3}\d{1,3}$/.test(nodeInfo.ipAddress)) {
      errors.ipAddress = 'Please enter a valid IP address';
    }
    
    if (nodeInfo.port && (isNaN(Number(nodeInfo.port)) || Number(nodeInfo.port) < 0 || Number(nodeInfo.port) > 65535)) {
      errors.port = 'Please enter a valid port number (0-65535)';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate third step
  const validateStep3 = () => {
    const errors = {};
    
    if (!privateKey) {
      errors.privateKey = 'Private key is required for registration verification';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    let isValid = false;
    
    switch (activeStep) {
      case 0:
        isValid = validateStep1();
        break;
      case 1:
        isValid = validateStep2();
        break;
      case 2:
        isValid = validateStep3();
        if (isValid) {
          handleRegister();
          return;
        }
        break;
      default:
        isValid = true;
    }
    
    if (isValid) {
      setActiveStep((prev) => prev + 1);
    }
  };

  // Handle back
  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'totalSpace') {
      setTotalSpace(value);
    } else if (name === 'privateKey') {
      setPrivateKey(value);
    } else {
      setNodeInfo((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Toggle private key visibility
  const togglePrivateKeyVisibility = () => {
    setShowPrivateKey(!showPrivateKey);
  };

  // Handle provider registration
  const handleRegister = async () => {
    try {
      const success = await registerAsProvider(totalSpace, nodeInfo, privateKey);
      
      if (success) {
        setRegistrationSuccess(true);
        // Navigate to provider dashboard after 2 seconds
        setTimeout(() => {
          navigate('/provider');
        }, 2000);
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  // Render step content
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Provide details about your storage provider node.
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Node Name"
                  name="name"
                  value={nodeInfo.name}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  required
                  error={!!validationErrors.name}
                  helperText={validationErrors.name}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Total Storage Space (GB)"
                  name="totalSpace"
                  type="number"
                  value={totalSpace}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  required
                  InputProps={{
                    endAdornment: <InputAdornment position="end">GB</InputAdornment>,
                  }}
                  error={!!validationErrors.totalSpace}
                  helperText={validationErrors.totalSpace}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Location (Optional)"
                  name="location"
                  value={nodeInfo.location}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  placeholder="e.g., US-East, Europe, Asia"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description (Optional)"
                  name="description"
                  value={nodeInfo.description}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  multiline
                  rows={3}
                  placeholder="Describe your provider node, hardware specifications, connection quality, etc."
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Activate node immediately after registration"
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Node Configuration
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Configure network settings for your node. These are optional but recommended
              for better connectivity.
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="IP Address (Optional)"
                  name="ipAddress"
                  value={nodeInfo.ipAddress}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  placeholder="e.g., 192.168.1.1"
                  error={!!validationErrors.ipAddress}
                  helperText={validationErrors.ipAddress}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Port (Optional)"
                  name="port"
                  type="number"
                  value={nodeInfo.port}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  placeholder="e.g., 8080"
                  error={!!validationErrors.port}
                  helperText={validationErrors.port}
                />
              </Grid>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mt: 2 }}>
                  Advanced configuration options will be available in your provider dashboard after registration.
                </Alert>
              </Grid>
            </Grid>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Security Verification
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              To complete the registration process, we need to verify your ownership of the wallet.
              Your private key is only used to sign the registration transaction and is never stored.
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Your Private Key"
                  name="privateKey"
                  type={showPrivateKey ? 'text' : 'password'}
                  value={privateKey}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  required
                  error={!!validationErrors.privateKey}
                  helperText={validationErrors.privateKey}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button onClick={togglePrivateKeyVisibility}>
                          {showPrivateKey ? <VisibilityOff /> : <Visibility />}
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Your private key is only used to sign the registration transaction and is never stored or transmitted.
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Alert severity="warning">
                  By registering as a provider, you agree to provide the specified storage space to the network
                  and maintain your node's availability. Your reputation score will be affected by your node's performance.
                </Alert>
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  // If not connected
  if (!isConnected) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Connect your wallet to register as a storage provider.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
          <Storage sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
          <Typography variant="h4" component="h1">
            Register as Storage Provider
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {registrationSuccess ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Check sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Registration Successful!
            </Typography>
            <Typography variant="body1" paragraph>
              You have been registered as a storage provider. Redirecting to your provider dashboard...
            </Typography>
            <CircularProgress size={24} sx={{ mt: 2 }} />
          </Box>
        ) : (
          <>
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box sx={{ mt: 4, mb: 4 }}>{getStepContent(activeStep)}</Box>

            <Divider sx={{ mb: 3 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                startIcon={<ArrowBack />}
              >
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                endIcon={activeStep === steps.length - 1 ? <Save /> : <ArrowForward />}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} />
                ) : activeStep === steps.length - 1 ? (
                  'Register'
                ) : (
                  'Next'
                )}
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default RegisterProviderPage; 