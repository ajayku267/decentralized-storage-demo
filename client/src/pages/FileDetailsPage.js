import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Chip,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  useTheme,
} from '@mui/material';
import {
  CloudDownload,
  Share,
  Delete,
  Lock,
  LockOpen,
  Person,
  Info,
  ArrowBack,
  Visibility,
  VisibilityOff,
  ContentCopy,
  Check,
  Storage,
  History,
  CalendarToday,
  InsertDriveFile,
} from '@mui/icons-material';
import { StorageContext } from '../context/StorageContext';
import { Web3Context } from '../context/Web3Context';

// Helper to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Helper to truncate text
const truncateText = (text, maxLength = 20) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

const FileDetailsPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { fileId } = useParams();
  
  const { getFileById, downloadFile, grantAccess, revokeAccess, loading, error, currentFile } = useContext(StorageContext);
  const { account, isConnected } = useContext(Web3Context);

  // State management
  const [tabValue, setTabValue] = useState(0);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accessAddress, setAccessAddress] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sharingError, setSharingError] = useState('');
  const [shareSuccess, setShareSuccess] = useState(false);

  // Load file details on mount
  useEffect(() => {
    if (fileId && isConnected) {
      getFileById(fileId);
    }
  }, [fileId, isConnected, getFileById]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle download
  const handleDownload = () => {
    downloadFile(fileId);
  };

  // Open share dialog
  const handleOpenShareDialog = () => {
    setShareDialogOpen(true);
    setShareSuccess(false);
    setSharingError('');
  };

  // Close share dialog
  const handleCloseShareDialog = () => {
    setShareDialogOpen(false);
    setAccessAddress('');
    setPrivateKey('');
  };

  // Handle granting access
  const handleGrantAccess = async () => {
    if (!accessAddress || !privateKey) {
      setSharingError('Please provide both the recipient address and your private key');
      return;
    }

    try {
      setSharingError('');
      const success = await grantAccess(fileId, accessAddress, privateKey);
      
      if (success) {
        setShareSuccess(true);
        setTimeout(() => {
          handleCloseShareDialog();
        }, 2000);
      } else {
        setSharingError('Failed to grant access. Please check the address and try again.');
      }
    } catch (error) {
      setSharingError(error.message || 'An error occurred while granting access');
    }
  };

  // Toggle private key visibility
  const togglePrivateKeyVisibility = () => {
    setShowPrivateKey(!showPrivateKey);
  };

  // Copy file link to clipboard
  const copyFileLink = () => {
    const fileLink = `${window.location.origin}/files/${fileId}`;
    navigator.clipboard.writeText(fileLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Open delete dialog
  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  // Handle delete file
  const handleDeleteFile = () => {
    // Delete file logic would be implemented here
    handleCloseDeleteDialog();
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          component={RouterLink}
          to="/dashboard"
          startIcon={<ArrowBack />}
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  if (!currentFile) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Alert severity="warning">File not found or you don't have access to it.</Alert>
        <Button
          component={RouterLink}
          to="/dashboard"
          startIcon={<ArrowBack />}
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          component={RouterLink}
          to="/dashboard"
          startIcon={<ArrowBack />}
          sx={{ mb: 2 }}
        >
          Back to Dashboard
        </Button>
        <Typography variant="h4" component="h1" gutterBottom>
          File Details
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* File Preview Section */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
              }}
            >
              {currentFile.fileType?.startsWith('image/') ? (
                <Box
                  component="img"
                  src={`/api/files/${fileId}/preview?user=${account}`}
                  alt={currentFile.name}
                  sx={{
                    width: '100%',
                    maxHeight: 200,
                    objectFit: 'contain',
                    borderRadius: 1,
                    mb: 2,
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/file-placeholder.png';
                  }}
                />
              ) : (
                <InsertDriveFile
                  sx={{ fontSize: 100, color: 'primary.main', opacity: 0.8, mb: 2 }}
                />
              )}
              <Typography variant="h6" align="center" gutterBottom noWrap>
                {currentFile.name}
              </Typography>
              <Chip
                icon={currentFile.isPrivate ? <Lock /> : <LockOpen />}
                label={currentFile.isPrivate ? 'Private' : 'Public'}
                color={currentFile.isPrivate ? 'primary' : 'default'}
                size="small"
                sx={{ mb: 1 }}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<CloudDownload />}
                onClick={handleDownload}
              >
                Download
              </Button>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<Share />}
                onClick={handleOpenShareDialog}
              >
                Share
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<Delete />}
                onClick={handleOpenDeleteDialog}
              >
                Delete
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* File Information Section */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              sx={{ mb: 3 }}
            >
              <Tab label="Details" icon={<Info />} iconPosition="start" />
              <Tab label="Sharing" icon={<Share />} iconPosition="start" />
              <Tab label="Storage" icon={<Storage />} iconPosition="start" />
            </Tabs>

            {/* Details Tab */}
            {tabValue === 0 && (
              <Box>
                <List>
                  <ListItem divider>
                    <ListItemIcon>
                      <InsertDriveFile />
                    </ListItemIcon>
                    <ListItemText
                      primary="File Name"
                      secondary={currentFile.name}
                    />
                  </ListItem>
                  <ListItem divider>
                    <ListItemIcon>
                      <Info />
                    </ListItemIcon>
                    <ListItemText
                      primary="File Type"
                      secondary={currentFile.fileType || 'Unknown'}
                    />
                  </ListItem>
                  <ListItem divider>
                    <ListItemIcon>
                      <Storage />
                    </ListItemIcon>
                    <ListItemText
                      primary="Size"
                      secondary={formatFileSize(currentFile.size || 0)}
                    />
                  </ListItem>
                  <ListItem divider>
                    <ListItemIcon>
                      <CalendarToday />
                    </ListItemIcon>
                    <ListItemText
                      primary="Upload Date"
                      secondary={formatDate(currentFile.timestamp || new Date().toISOString())}
                    />
                  </ListItem>
                  <ListItem divider>
                    <ListItemIcon>
                      <Person />
                    </ListItemIcon>
                    <ListItemText
                      primary="Owner"
                      secondary={
                        <Typography
                          component="span"
                          variant="body2"
                          sx={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {currentFile.owner}
                        </Typography>
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      {currentFile.isPrivate ? <Lock /> : <LockOpen />}
                    </ListItemIcon>
                    <ListItemText
                      primary="Access Control"
                      secondary={
                        currentFile.isPrivate
                          ? 'Private - Only you and authorized users can access'
                          : 'Public - Anyone with the link can access'
                      }
                    />
                  </ListItem>
                </List>
              </Box>
            )}

            {/* Sharing Tab */}
            {tabValue === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Sharing Options
                </Typography>
                
                <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                  <Typography variant="body1" gutterBottom>
                    File Link
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TextField
                      value={`${window.location.origin}/files/${fileId}`}
                      variant="outlined"
                      size="small"
                      fullWidth
                      InputProps={{
                        readOnly: true,
                      }}
                      sx={{ mr: 1 }}
                    />
                    <IconButton color="primary" onClick={copyFileLink}>
                      {copied ? <Check /> : <ContentCopy />}
                    </IconButton>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {currentFile.isPrivate
                      ? 'Note: This link will only work for authorized users'
                      : 'Anyone with this link can access this file'}
                  </Typography>
                </Paper>

                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Share />}
                  onClick={handleOpenShareDialog}
                  sx={{ mb: 3 }}
                >
                  Grant Access to Another User
                </Button>

                <Typography variant="h6" gutterBottom>
                  Users with Access
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {currentFile.isPrivate
                    ? 'Only you and users you have shared this file with can access it.'
                    : 'This file is publicly accessible to anyone with the link.'}
                </Typography>

                <List>
                  <ListItem divider>
                    <ListItemIcon>
                      <Person />
                    </ListItemIcon>
                    <ListItemText
                      primary={truncateText(currentFile.owner, 20)}
                      secondary="Owner (You)"
                    />
                  </ListItem>
                  {/* This would map through shared users if we had that data */}
                  {/* Sample shared user 
                  <ListItem>
                    <ListItemIcon>
                      <Person />
                    </ListItemIcon>
                    <ListItemText
                      primary="0x1234...5678"
                      secondary="Shared on May 15, 2023"
                    />
                    <IconButton color="error" size="small" title="Revoke Access">
                      <Delete fontSize="small" />
                    </IconButton>
                  </ListItem>
                  */}
                </List>
              </Box>
            )}

            {/* Storage Tab */}
            {tabValue === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Storage Information
                </Typography>

                <List>
                  <ListItem divider>
                    <ListItemIcon>
                      <Storage />
                    </ListItemIcon>
                    <ListItemText
                      primary="Storage Type"
                      secondary="Decentralized (IPFS)"
                    />
                  </ListItem>
                  <ListItem divider>
                    <ListItemIcon>
                      <Info />
                    </ListItemIcon>
                    <ListItemText
                      primary="Content ID (CID)"
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography
                            component="span"
                            variant="body2"
                            sx={{
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {currentFile.cid || 'Not available'}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => navigator.clipboard.writeText(currentFile.cid)}
                            sx={{ ml: 1 }}
                          >
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Box>
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <History />
                    </ListItemIcon>
                    <ListItemText
                      primary="Storage Status"
                      secondary="Active and Healthy"
                    />
                  </ListItem>
                </List>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Storage Providers
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Your file is securely distributed across these storage providers:
                  </Typography>

                  <Grid container spacing={2}>
                    {/* Sample provider chips */}
                    <Grid item>
                      <Chip label="Provider 1" size="small" />
                    </Grid>
                    <Grid item>
                      <Chip label="Provider 2" size="small" />
                    </Grid>
                    <Grid item>
                      <Chip label="Provider 3" size="small" />
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onClose={handleCloseShareDialog}>
        <DialogTitle>Share File Access</DialogTitle>
        <DialogContent>
          <DialogContentText gutterBottom>
            Grant access to another user by entering their wallet address.
            You'll need to use your private key to authorize this action.
          </DialogContentText>

          {sharingError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {sharingError}
            </Alert>
          )}

          {shareSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Access successfully granted!
            </Alert>
          )}

          <TextField
            autoFocus
            margin="dense"
            label="Recipient Address"
            fullWidth
            variant="outlined"
            value={accessAddress}
            onChange={(e) => setAccessAddress(e.target.value)}
            placeholder="0x..."
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="Your Private Key"
            type={showPrivateKey ? 'text' : 'password'}
            fullWidth
            variant="outlined"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            InputProps={{
              endAdornment: (
                <IconButton onClick={togglePrivateKeyVisibility} edge="end">
                  {showPrivateKey ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              ),
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Your private key is only used to sign this transaction and is never stored.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseShareDialog}>Cancel</Button>
          <Button
            onClick={handleGrantAccess}
            variant="contained"
            color="primary"
            disabled={!accessAddress || !privateKey || shareSuccess}
          >
            Grant Access
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete File</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{currentFile.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteFile} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FileDetailsPage; 