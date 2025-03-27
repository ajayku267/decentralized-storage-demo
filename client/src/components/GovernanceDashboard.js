import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useWeb3 } from '../context/Web3Context';
import GovernanceService from '../services/governanceService';

const GovernanceDashboard = () => {
  const { account, provider, signer } = useWeb3();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newProposal, setNewProposal] = useState('');
  const [votingPower, setVotingPower] = useState('0');
  const [parameters, setParameters] = useState(null);

  const governanceService = new GovernanceService(provider, signer);

  useEffect(() => {
    loadData();
  }, [account]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [activeProposals, power, params] = await Promise.all([
        governanceService.getActiveProposals(),
        governanceService.getVotingPower(account),
        governanceService.getProposalParameters(),
      ]);
      setProposals(activeProposals);
      setVotingPower(power.toString());
      setParameters(params);
    } catch (error) {
      setError('Failed to load governance data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProposal = async () => {
    try {
      await governanceService.createProposal(newProposal);
      setOpenDialog(false);
      setNewProposal('');
      loadData();
    } catch (error) {
      setError('Failed to create proposal');
      console.error(error);
    }
  };

  const handleVote = async (proposalId, support) => {
    try {
      await governanceService.castVote(proposalId, support);
      loadData();
    } catch (error) {
      setError('Failed to cast vote');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Your Voting Power
              </Typography>
              <Typography variant="h4">
                {ethers.utils.formatEther(votingPower)} STOR
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Governance Parameters
              </Typography>
              {parameters && (
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography>Min Voting Power:</Typography>
                    <Typography>{ethers.utils.formatEther(parameters.minVotingPower)} STOR</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>Voting Period:</Typography>
                    <Typography>{parameters.votingPeriod / 86400} days</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>Quorum:</Typography>
                    <Typography>{ethers.utils.formatEther(parameters.quorum)} STOR</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>Proposal Threshold:</Typography>
                    <Typography>{ethers.utils.formatEther(parameters.proposalThreshold)} STOR</Typography>
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5">Active Proposals</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpenDialog(true)}
              disabled={Number(votingPower) < Number(parameters?.minVotingPower)}
            >
              Create Proposal
            </Button>
          </Box>

          {proposals.map((proposal) => (
            <Card key={proposal.id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Proposal #{proposal.id}
                </Typography>
                <Typography variant="body1" paragraph>
                  {proposal.description}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography>For Votes:</Typography>
                    <Typography>{ethers.utils.formatEther(proposal.forVotes)} STOR</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>Against Votes:</Typography>
                    <Typography>{ethers.utils.formatEther(proposal.againstVotes)} STOR</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" gap={2}>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleVote(proposal.id, true)}
                      >
                        Vote For
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleVote(proposal.id, false)}
                      >
                        Vote Against
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Create New Proposal</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Proposal Description"
            fullWidth
            multiline
            rows={4}
            value={newProposal}
            onChange={(e) => setNewProposal(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateProposal} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GovernanceDashboard; 