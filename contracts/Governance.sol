// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./StorageToken.sol";

contract Governance is Ownable, ReentrancyGuard {
    StorageToken public storageToken;
    
    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        uint256 startTime;
        uint256 endTime;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
        mapping(address => bool) hasVoted;
        mapping(address => bool) hasVotedFor;
    }
    
    struct ProposalParameters {
        uint256 minVotingPower;
        uint256 votingPeriod;
        uint256 quorum;
        uint256 proposalThreshold;
    }
    
    ProposalParameters public parameters;
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;
    
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string description
    );
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 weight
    );
    event ProposalExecuted(uint256 indexed proposalId);
    event ParametersUpdated(
        uint256 minVotingPower,
        uint256 votingPeriod,
        uint256 quorum,
        uint256 proposalThreshold
    );
    
    constructor(address _storageToken) {
        storageToken = StorageToken(_storageToken);
        
        parameters = ProposalParameters({
            minVotingPower: 1000 * 10**18, // 1000 tokens
            votingPeriod: 3 days,
            quorum: 10000 * 10**18, // 10000 tokens
            proposalThreshold: 5000 * 10**18 // 5000 tokens
        });
    }
    
    function createProposal(string memory description) external nonReentrant returns (uint256) {
        require(
            storageToken.balanceOf(msg.sender) >= parameters.minVotingPower,
            "Insufficient voting power"
        );
        
        uint256 proposalId = proposalCount++;
        
        Proposal storage proposal = proposals[proposalId];
        proposal.id = proposalId;
        proposal.proposer = msg.sender;
        proposal.description = description;
        proposal.startTime = block.timestamp;
        proposal.endTime = block.timestamp + parameters.votingPeriod;
        
        emit ProposalCreated(proposalId, msg.sender, description);
        
        return proposalId;
    }
    
    function castVote(uint256 proposalId, bool support) external nonReentrant {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id == proposalId, "Proposal does not exist");
        require(block.timestamp <= proposal.endTime, "Voting period ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        
        uint256 weight = storageToken.balanceOf(msg.sender);
        require(weight > 0, "No voting power");
        
        proposal.hasVoted[msg.sender] = true;
        proposal.hasVotedFor[msg.sender] = support;
        
        if (support) {
            proposal.forVotes += weight;
        } else {
            proposal.againstVotes += weight;
        }
        
        emit VoteCast(proposalId, msg.sender, support, weight);
        
        if (block.timestamp >= proposal.endTime) {
            executeProposal(proposalId);
        }
    }
    
    function executeProposal(uint256 proposalId) public nonReentrant {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id == proposalId, "Proposal does not exist");
        require(block.timestamp >= proposal.endTime, "Voting period not ended");
        require(!proposal.executed, "Already executed");
        require(
            proposal.forVotes >= parameters.quorum,
            "Quorum not reached"
        );
        require(
            proposal.forVotes > proposal.againstVotes,
            "Proposal defeated"
        );
        
        proposal.executed = true;
        
        // Execute proposal actions here
        // This is where you would implement the actual governance actions
        
        emit ProposalExecuted(proposalId);
    }
    
    function updateParameters(
        uint256 minVotingPower,
        uint256 votingPeriod,
        uint256 quorum,
        uint256 proposalThreshold
    ) external onlyOwner {
        parameters = ProposalParameters({
            minVotingPower: minVotingPower,
            votingPeriod: votingPeriod,
            quorum: quorum,
            proposalThreshold: proposalThreshold
        });
        
        emit ParametersUpdated(
            minVotingPower,
            votingPeriod,
            quorum,
            proposalThreshold
        );
    }
    
    function getProposal(uint256 proposalId) external view returns (
        uint256 id,
        address proposer,
        string memory description,
        uint256 startTime,
        uint256 endTime,
        uint256 forVotes,
        uint256 againstVotes,
        bool executed
    ) {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.id,
            proposal.proposer,
            proposal.description,
            proposal.startTime,
            proposal.endTime,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.executed
        );
    }
    
    function hasVoted(uint256 proposalId, address voter) external view returns (bool) {
        return proposals[proposalId].hasVoted[voter];
    }
    
    function getVote(uint256 proposalId, address voter) external view returns (bool) {
        return proposals[proposalId].hasVotedFor[voter];
    }
} 