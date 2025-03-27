import React, { useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  TextField,
  FormControlLabel,
  Switch,
  Grid,
  LinearProgress,
  Alert,
  Card,
  CardContent,
  IconButton,
  Divider,
  Chip,
  useTheme,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Lock,
  LockOpen,
  Check,
  FilePresent,
  InsertDriveFile,
} from '@mui/icons-material';
import { StorageContext } from '../context/StorageContext';
import { Web3Context } from '../context/Web3Context';

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper to get file icon based on type
const getFileIcon = (fileType) => {
  if (fileType.startsWith('image/')) {
    return <InsertDriveFile color="primary" />;
  } else if (fileType.startsWith('video/')) {
    return <InsertDriveFile color="secondary" />;
  } else if (fileType.startsWith('audio/')) {
    return <InsertDriveFile color="warning" />;
  } else if (fileType.startsWith('application/pdf')) {
    return <InsertDriveFile color="error" />;
  } else {
    return <InsertDriveFile />;
  }
};

const UploadFilePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const { uploadFile, loading, error } = useContext(StorageContext);
  const { isConnected, account } = useContext(Web3Context);

  // State for file selection
  const [selectedFile, setSelectedFile] = useState(null);
  const [isPrivate, setIsPrivate] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadSuccess(false);
      setUploadedFile(null);
    }
  };

  // Trigger file input click
  const handleSelectFile = () => {
    if (fileInputRef && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Remove selected file
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadSuccess(false);
    setUploadedFile(null);
    setUploadProgress(0);
    // Reset file input safely with null check
    if (fileInputRef && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle privacy toggle
  const handlePrivacyChange = (event) => {
    setIsPrivate(event.target.checked);
  };

  // Simulate upload progress
  const simulateProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress > 100) {
        progress = 100;
        clearInterval(interval);
      }
      setUploadProgress(progress);
    }, 300);
    return interval;
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile || !isConnected) return;

    // Reset state
    setUploadProgress(0);
    setUploadSuccess(false);
    setUploadedFile(null);

    // Simulate progress
    const progressInterval = simulateProgress();

    try {
      // Upload the file
      const result = await uploadFile(selectedFile, isPrivate);

      // Clear progress interval
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result) {
        setUploadSuccess(true);
        setUploadedFile(result);

        // Reset the form after 5 seconds with a safe implementation
        const timerId = setTimeout(() => {
          // Only call handleRemoveFile if component is still mounted
          if (fileInputRef && fileInputRef.current) {
            handleRemoveFile();
          }
        }, 5000);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      clearInterval(progressInterval);
      setUploadProgress(0);
    }
  };

  // Navigate to file details
  const viewFile = () => {
    if (uploadedFile && uploadedFile.id) {
      navigate(`/files/${uploadedFile.id}`);
    }
  };

  // Go to dashboard
  const goToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Upload File to Decentralized Storage
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph align="center">
          Your files will be encrypted and stored across multiple storage providers in our decentralized network.
        </Typography>

        <Divider sx={{ my: 3 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {uploadSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            File uploaded successfully! You can view it in your dashboard.
          </Alert>
        )}

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mt: 2,
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          {!selectedFile ? (
            <Box
              sx={{
                border: `2px dashed ${theme.palette.divider}`,
                borderRadius: 1,
                p: 6,
                mb: 3,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: theme.palette.action.hover,
                },
              }}
              onClick={handleSelectFile}
            >
              <CloudUpload sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Select File to Upload
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Click to browse or drag and drop your file here
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<CloudUpload />}
                sx={{ mt: 2 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectFile();
                }}
              >
                Browse Files
              </Button>
            </Box>
          ) : (
            <Card variant="outlined" sx={{ width: '100%', mb: 3 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={1}>
                    {getFileIcon(selectedFile.type)}
                  </Grid>
                  <Grid item xs={12} sm={7}>
                    <Typography variant="subtitle1" noWrap>
                      {selectedFile.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Unknown type'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <Chip
                      icon={isPrivate ? <Lock /> : <LockOpen />}
                      label={isPrivate ? 'Private' : 'Public'}
                      color={isPrivate ? 'primary' : 'default'}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6} sm={2} sx={{ textAlign: 'right' }}>
                    <IconButton color="error" onClick={handleRemoveFile}>
                      <Delete />
                    </IconButton>
                  </Grid>
                </Grid>

                {uploadProgress > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={uploadProgress}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mt: 1,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {uploadProgress < 100
                          ? 'Uploading...'
                          : uploadSuccess
                          ? 'Upload Complete'
                          : 'Processing...'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {Math.round(uploadProgress)}%
                      </Typography>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isPrivate}
                    onChange={handlePrivacyChange}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ ml: 1 }}>
                    <Typography variant="body1">Private File</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {isPrivate
                        ? 'Only you will have access to this file'
                        : 'Anyone with the link can access this file'}
                    </Typography>
                  </Box>
                }
                sx={{ m: 0 }}
              />
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={goToDashboard}
                sx={{ mr: 2 }}
              >
                Go to Dashboard
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<CloudUpload />}
                onClick={handleUpload}
                disabled={!selectedFile || loading || uploadSuccess}
              >
                Upload File
              </Button>
            </Grid>
          </Grid>
        </Box>

        {uploadedFile && (
          <Box sx={{ mt: 4 }}>
            <Paper sx={{ p: 3, bgcolor: theme.palette.success.light, color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Check sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">File Uploaded Successfully</Typography>
                  <Typography variant="body2">
                    Your file has been encrypted and distributed across the network
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  mt: 2,
                }}
              >
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={viewFile}
                  sx={{ color: 'white', borderColor: 'white' }}
                >
                  View File Details
                </Button>
              </Box>
            </Paper>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default UploadFilePage;