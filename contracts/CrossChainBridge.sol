// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./StorageToken.sol";

contract CrossChainBridge is Ownable, ReentrancyGuard {
    using ECDSA for bytes32;
    
    StorageToken public storageToken;
    
    struct ChainInfo {
        bool isActive;
        uint256 chainId;
        address bridgeContract;
        uint256 minConfirmations;
        address[] validators;
    }
    
    struct TransferRequest {
        address from;
        address to;
        uint256 amount;
        uint256 sourceChainId;
        uint256 targetChainId;
        uint256 timestamp;
        bool executed;
        bytes32 transferId;
    }
    
    mapping(uint256 => ChainInfo) public supportedChains;
    mapping(bytes32 => TransferRequest) public transferRequests;
    mapping(uint256 => uint256) public nonce;
    mapping(address => bool) public validators;
    
    event ChainAdded(uint256 indexed chainId, address bridgeContract);
    event ChainRemoved(uint256 indexed chainId);
    event TransferInitiated(
        bytes32 indexed transferId,
        address indexed from,
        address indexed to,
        uint256 amount,
        uint256 sourceChainId,
        uint256 targetChainId
    );
    event TransferExecuted(
        bytes32 indexed transferId,
        address indexed from,
        address indexed to,
        uint256 amount
    );
    event ValidatorAdded(address indexed validator);
    event ValidatorRemoved(address indexed validator);
    
    constructor(address _storageToken) {
        storageToken = StorageToken(_storageToken);
    }
    
    function addChain(
        uint256 chainId,
        address bridgeContract,
        uint256 minConfirmations,
        address[] memory _validators
    ) external onlyOwner {
        require(!supportedChains[chainId].isActive, "Chain already supported");
        
        supportedChains[chainId] = ChainInfo({
            isActive: true,
            chainId: chainId,
            bridgeContract: bridgeContract,
            minConfirmations: minConfirmations,
            validators: _validators
        });
        
        emit ChainAdded(chainId, bridgeContract);
    }
    
    function removeChain(uint256 chainId) external onlyOwner {
        require(supportedChains[chainId].isActive, "Chain not supported");
        
        delete supportedChains[chainId];
        emit ChainRemoved(chainId);
    }
    
    function addValidator(address validator) external onlyOwner {
        require(!validators[validator], "Validator already exists");
        validators[validator] = true;
        emit ValidatorAdded(validator);
    }
    
    function removeValidator(address validator) external onlyOwner {
        require(validators[validator], "Validator does not exist");
        validators[validator] = false;
        emit ValidatorRemoved(validator);
    }
    
    function initiateTransfer(
        address to,
        uint256 amount,
        uint256 targetChainId
    ) external nonReentrant {
        require(supportedChains[targetChainId].isActive, "Target chain not supported");
        require(amount > 0, "Amount must be greater than 0");
        require(
            storageToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        
        bytes32 transferId = keccak256(
            abi.encodePacked(
                msg.sender,
                to,
                amount,
                block.chainid,
                targetChainId,
                nonce[block.chainid]++
            )
        );
        
        transferRequests[transferId] = TransferRequest({
            from: msg.sender,
            to: to,
            amount: amount,
            sourceChainId: block.chainid,
            targetChainId: targetChainId,
            timestamp: block.timestamp,
            executed: false,
            transferId: transferId
        });
        
        emit TransferInitiated(
            transferId,
            msg.sender,
            to,
            amount,
            block.chainid,
            targetChainId
        );
    }
    
    function executeTransfer(
        bytes32 transferId,
        address from,
        address to,
        uint256 amount,
        uint256 sourceChainId,
        uint256 targetChainId,
        bytes[] memory signatures
    ) external nonReentrant {
        require(block.chainid == targetChainId, "Wrong chain");
        require(supportedChains[sourceChainId].isActive, "Source chain not supported");
        require(!transferRequests[transferId].executed, "Transfer already executed");
        
        // Verify signatures
        require(
            verifySignatures(transferId, signatures),
            "Invalid signatures"
        );
        
        transferRequests[transferId].executed = true;
        
        require(
            storageToken.transfer(to, amount),
            "Transfer failed"
        );
        
        emit TransferExecuted(transferId, from, to, amount);
    }
    
    function verifySignatures(bytes32 transferId, bytes[] memory signatures) internal view returns (bool) {
        require(signatures.length >= supportedChains[transferRequests[transferId].sourceChainId].minConfirmations, "Insufficient signatures");
        
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                "\x19Ethereum Signed Message:\n32",
                transferId
            )
        );
        
        address[] memory signers = new address[](signatures.length);
        for (uint256 i = 0; i < signatures.length; i++) {
            signers[i] = messageHash.recover(signatures[i]);
        }
        
        // Check if all signers are validators
        for (uint256 i = 0; i < signers.length; i++) {
            if (!validators[signers[i]]) {
                return false;
            }
        }
        
        return true;
    }
    
    function getTransferStatus(bytes32 transferId) external view returns (
        address from,
        address to,
        uint256 amount,
        uint256 sourceChainId,
        uint256 targetChainId,
        uint256 timestamp,
        bool executed
    ) {
        TransferRequest storage transfer = transferRequests[transferId];
        return (
            transfer.from,
            transfer.to,
            transfer.amount,
            transfer.sourceChainId,
            transfer.targetChainId,
            transfer.timestamp,
            transfer.executed
        );
    }
    
    function getChainValidators(uint256 chainId) external view returns (address[] memory) {
        return supportedChains[chainId].validators;
    }
} 