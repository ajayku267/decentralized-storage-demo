import { ethers } from 'ethers';
import { Governance } from '../contracts/Governance';

class GovernanceService {
    constructor(provider, signer) {
        this.provider = provider;
        this.signer = signer;
        this.contract = new ethers.Contract(
            process.env.REACT_APP_GOVERNANCE_ADDRESS,
            Governance.abi,
            signer
        );
    }

    async createProposal(description) {
        try {
            const tx = await this.contract.createProposal(description);
            await tx.wait();
            return tx;
        } catch (error) {
            console.error('Error creating proposal:', error);
            throw error;
        }
    }

    async castVote(proposalId, support) {
        try {
            const tx = await this.contract.castVote(proposalId, support);
            await tx.wait();
            return tx;
        } catch (error) {
            console.error('Error casting vote:', error);
            throw error;
        }
    }

    async getProposal(proposalId) {
        try {
            const proposal = await this.contract.getProposal(proposalId);
            return {
                id: proposal.id.toNumber(),
                proposer: proposal.proposer,
                description: proposal.description,
                startTime: proposal.startTime.toNumber(),
                endTime: proposal.endTime.toNumber(),
                forVotes: proposal.forVotes.toString(),
                againstVotes: proposal.againstVotes.toString(),
                executed: proposal.executed
            };
        } catch (error) {
            console.error('Error getting proposal:', error);
            throw error;
        }
    }

    async getProposalParameters() {
        try {
            const params = await this.contract.parameters();
            return {
                minVotingPower: params.minVotingPower.toString(),
                votingPeriod: params.votingPeriod.toNumber(),
                quorum: params.quorum.toString(),
                proposalThreshold: params.proposalThreshold.toString()
            };
        } catch (error) {
            console.error('Error getting proposal parameters:', error);
            throw error;
        }
    }

    async hasVoted(proposalId, voter) {
        try {
            return await this.contract.hasVoted(proposalId, voter);
        } catch (error) {
            console.error('Error checking if address has voted:', error);
            throw error;
        }
    }

    async getVote(proposalId, voter) {
        try {
            return await this.contract.getVote(proposalId, voter);
        } catch (error) {
            console.error('Error getting vote:', error);
            throw error;
        }
    }

    async getActiveProposals() {
        try {
            const events = await this.contract.queryFilter(
                this.contract.filters.ProposalCreated()
            );
            const proposals = await Promise.all(
                events.map(async (event) => {
                    const proposalId = event.args.proposalId;
                    return await this.getProposal(proposalId);
                })
            );
            return proposals.filter(proposal => !proposal.executed);
        } catch (error) {
            console.error('Error getting active proposals:', error);
            throw error;
        }
    }

    async getVotingPower(address) {
        try {
            const tokenContract = new ethers.Contract(
                process.env.REACT_APP_STORAGE_TOKEN_ADDRESS,
                ['function balanceOf(address) view returns (uint256)'],
                this.provider
            );
            return await tokenContract.balanceOf(address);
        } catch (error) {
            console.error('Error getting voting power:', error);
            throw error;
        }
    }
}

export default GovernanceService; 