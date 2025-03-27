import React, { useEffect, useContext, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  LinearProgress,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  CloudUpload,
  CloudDownload,
  Delete,
  Share,
  Info,
  Lock,
  LockOpen,
  FilePresent,
  Storage,
  PieChart,
  CloudQueue,
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
  });
};

// Helper to get file icon based on type
const getFileIcon = (fileType) => {
  if (fileType?.startsWith('image/')) {
    return <InsertDriveFile color="primary" />;
  } else if (fileType?.startsWith('video/')) {
    return <InsertDriveFile color="secondary" />;
  } else if (fileType?.startsWith('audio/')) {
    return <InsertDriveFile color="warning" />;
  } else if (fileType?.startsWith('application/pdf')) {
    return <InsertDriveFile color="error" />;
  } else {
    return <InsertDriveFile />;
  }
};

const StatCard = ({ title, value, icon, description, color }) => {
  const theme = useTheme();
  
  return (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              mr: 2,
              p: 1.5,
              borderRadius: '50%',
              bgcolor: `${color}.light`,
              color: `${color}.main`,
              display: 'flex',
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" sx={{ mb: 1 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

const DashboardPage = () => {
  const theme = useTheme();
  const { userFiles, getUserFiles, downloadFile, loading, error, demoMode } = useContext(StorageContext);
  const { account, tokenBalance } = useContext(Web3Context);

  // State for storage stats
  const [storageStats, setStorageStats] = useState({
    totalSize: 0,
    privateFiles: 0,
    publicFiles: 0,
  });

  // Load user files on component mount
  useEffect(() => {
    getUserFiles();
    // Log for debugging
    console.log("Dashboard: Loading user files");
  }, [getUserFiles]);

  // Calculate storage statistics
  useEffect(() => {
    if (userFiles && userFiles.length > 0) {
      console.log("Dashboard: User files updated:", userFiles);
      const totalSize = userFiles.reduce((sum, file) => sum + Number(file.size || 0), 0);
      const privateFiles = userFiles.filter((file) => file.isPrivate).length;
      const publicFiles = userFiles.length - privateFiles;

      setStorageStats({
        totalSize,
        privateFiles,
        publicFiles,
      });
    } else {
      console.log("Dashboard: No user files found or empty array");
    }
  }, [userFiles]);

  // Handle file download
  const handleDownload = async (fileId) => {
    await downloadFile(fileId);
  };

  // Handle manual refresh
  const handleRefresh = () => {
    console.log("Dashboard: Manual refresh requested");
    getUserFiles();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Your Storage Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Manage your files and monitor your storage usage.
            {demoMode && (
              <Chip 
                label="Demo Mode" 
                color="warning" 
                size="small" 
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          onClick={handleRefresh} 
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <CloudQueue />}
        >
          Refresh
        </Button>
      </Box>

      {/* Storage Statistics */}
      <Grid container spacing={3} sx={{ mt: 2, mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Files"
            value={userFiles?.length || 0}
            icon={<FilePresent />}
            description="Files stored in your account"
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Size"
            value={formatFileSize(storageStats.totalSize)}
            icon={<Storage />}
            description="Total storage used"
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Private Files"
            value={storageStats.privateFiles}
            icon={<Lock />}
            description="Files with restricted access"
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Public Files"
            value={storageStats.publicFiles}
            icon={<LockOpen />}
            description="Files accessible with link"
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Action buttons */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<CloudUpload />}
          component={RouterLink}
          to="/upload"
        >
          Upload New File
        </Button>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<Storage />}
          component={RouterLink}
          to="/provider"
        >
          Storage Provider Dashboard
        </Button>
      </Box>

      {/* Files Table */}
      <Paper elevation={2} sx={{ overflow: 'hidden' }}>
        <Box sx={{ p: 3, bgcolor: 'background.paper' }}>
          <Typography variant="h6" gutterBottom>
            Your Files
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ p: 2 }}>
              <Typography color="error">{error}</Typography>
            </Box>
          ) : userFiles && userFiles.length > 0 ? (
            <TableContainer>
              <Table aria-label="files table">
                <TableHead>
                  <TableRow>
                    <TableCell>File</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Date Uploaded</TableCell>
                    <TableCell>Access</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userFiles.map((file) => (
                    <TableRow key={file.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getFileIcon(file.fileType)}
                          <Box sx={{ ml: 2 }}>
                            <Typography variant="body1">{file.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {file.fileType || 'Unknown type'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{formatFileSize(file.size || 0)}</TableCell>
                      <TableCell>
                        {formatDate(file.timestamp || new Date().toISOString())}
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={file.isPrivate ? <Lock /> : <LockOpen />}
                          label={file.isPrivate ? 'Private' : 'Public'}
                          color={file.isPrivate ? 'primary' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex' }}>
                          <IconButton
                            color="primary"
                            onClick={() => handleDownload(file.id)}
                            size="small"
                            title="Download"
                          >
                            <CloudDownload fontSize="small" />
                          </IconButton>
                          <IconButton
                            color="info"
                            component={RouterLink}
                            to={`/files/${file.id}`}
                            size="small"
                            title="File Details"
                          >
                            <Info fontSize="small" />
                          </IconButton>
                          <IconButton
                            color="success"
                            component={RouterLink}
                            to={`/files/${file.id}/share`}
                            size="small"
                            title="Share"
                          >
                            <Share fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 6,
              }}
            >
              <CloudQueue sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No Files Found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                You haven't uploaded any files yet. Start by uploading your first file.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<CloudUpload />}
                component={RouterLink}
                to="/upload"
              >
                Upload First File
              </Button>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Token balance card */}
      <Paper sx={{ mt: 4, p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PieChart sx={{ fontSize: 36, color: 'primary.main', mr: 2 }} />
            <Box>
              <Typography variant="h6">Token Balance</Typography>
              <Typography variant="body2" color="text.secondary">
                You can use tokens to pay for storage or earn by providing storage
              </Typography>
            </Box>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h4">{tokenBalance}</Typography>
            <Typography variant="body2" color="text.secondary">
              Storage Tokens
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default DashboardPage; 