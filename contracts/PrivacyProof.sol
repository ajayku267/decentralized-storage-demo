// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IVerifier.sol";

contract PrivacyProof is Ownable, ReentrancyGuard {
    IVerifier public verifier;
    
    struct Proof {
        bytes32 fileHash;
        bytes32 commitment;
        uint256 timestamp;
        bool isValid;
    }
    
    mapping(bytes32 => Proof) public proofs;
    mapping(address => bytes32[]) public userProofs;
    
    event ProofSubmitted(address indexed user, bytes32 indexed fileHash, bytes32 commitment);
    event ProofVerified(address indexed user, bytes32 indexed fileHash, bool isValid);
    
    constructor(address _verifier) {
        verifier = IVerifier(_verifier);
    }
    
    function submitProof(
        bytes32 fileHash,
        bytes32 commitment,
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[1] memory input
    ) external nonReentrant {
        require(proofs[fileHash].timestamp == 0, "Proof already exists");
        
        bool isValid = verifier.verifyProof(a, b, c, input);
        
        proofs[fileHash] = Proof({
            fileHash: fileHash,
            commitment: commitment,
            timestamp: block.timestamp,
            isValid: isValid
        });
        
        userProofs[msg.sender].push(fileHash);
        
        emit ProofSubmitted(msg.sender, fileHash, commitment);
        emit ProofVerified(msg.sender, fileHash, isValid);
    }
    
    function verifyProof(bytes32 fileHash) external view returns (bool) {
        return proofs[fileHash].isValid;
    }
    
    function getUserProofs(address user) external view returns (bytes32[] memory) {
        return userProofs[user];
    }
} 