// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./StorageToken.sol";
import "./FileStorage.sol";

/**
 * @title StakingContract
 * @dev Manages the staking mechanism for storage providers
 */
contract StakingContract {
    // Token contract instance
    StorageToken private storageToken;
    
    // FileStorage contract instance
    FileStorage private fileStorage;
    
    // Minimum stake required to become a provider
    uint256 public minimumStake;
    
    // Storage provider structure
    struct Provider {
        uint256 stakedAmount;
        uint256 stakingTimestamp;
        uint256 totalBytes;
        uint256 availableBytes;
        bool isActive;
    }
    
    // Mapping of provider addresses to their details
    mapping(address => Provider) private providers;
    
    // Array of all provider addresses
    address[] private allProviders;
    
    // File storage structure
    struct StoredFile {
        bytes32 fileId;
        uint256 size;
        uint256 storageStartTime;
        bool isActive;
    }
    
    // Mapping of providers to their stored files
    mapping(address => mapping(bytes32 => StoredFile)) private providerFiles;
    
    // Events
    event ProviderRegistered(address indexed provider, uint256 stakedAmount, uint256 availableBytes);
    event ProviderUpdated(address indexed provider, uint256 stakedAmount, uint256 availableBytes, bool isActive);
    event FileStorageAssigned(address indexed provider, bytes32 indexed fileId, uint256 size);
    event FileStorageRevoked(address indexed provider, bytes32 indexed fileId);
    event RewardPaid(address indexed provider, uint256 amount);
    
    /**
     * @dev Constructor sets the token contract and minimum stake
     * @param _tokenAddress Address of the StorageToken contract
     * @param _fileStorageAddress Address of the FileStorage contract
     * @param _minimumStake Minimum amount to stake
     */
    constructor(address _tokenAddress, address _fileStorageAddress, uint256 _minimumStake) {
        storageToken = StorageToken(_tokenAddress);
        fileStorage = FileStorage(_fileStorageAddress);
        minimumStake = _minimumStake;
    }
    
    /**
     * @dev Registers a new storage provider
     * @param _availableBytes Available bytes for storage
     * @return success Whether the operation succeeded
     */
    function registerProvider(uint256 _availableBytes) public returns (bool success) {
        require(!providers[msg.sender].isActive, "Provider already registered");
        require(_availableBytes > 0, "Must provide storage space");
        
        // Determine staking amount based on available bytes
        uint256 requiredStake = (_availableBytes / 1 giga) * minimumStake;
        require(requiredStake >= minimumStake, "Stake amount too low");
        
        // Transfer tokens from provider to contract
        require(
            storageToken.transferFrom(msg.sender, address(this), requiredStake),
            "Staking transfer failed"
        );
        
        // Register provider
        Provider storage provider = providers[msg.sender];
        provider.stakedAmount = requiredStake;
        provider.stakingTimestamp = block.timestamp;
        provider.totalBytes = _availableBytes;
        provider.availableBytes = _availableBytes;
        provider.isActive = true;
        
        // Add provider to array
        allProviders.push(msg.sender);
        
        // Register with FileStorage contract
        fileStorage.registerProvider(_availableBytes);
        
        emit ProviderRegistered(msg.sender, requiredStake, _availableBytes);
        
        return true;
    }
    
    /**
     * @dev Updates a provider's available storage
     * @param _newAvailableBytes New available bytes for storage
     * @param _isActive Whether the provider is active
     * @return success Whether the operation succeeded
     */
    function updateProvider(uint256 _newAvailableBytes, bool _isActive) public returns (bool success) {
        require(providers[msg.sender].isActive, "Provider not registered");
        
        Provider storage provider = providers[msg.sender];
        
        // If increasing available storage, need more stake
        if (_newAvailableBytes > provider.totalBytes) {
            uint256 additionalBytes = _newAvailableBytes - provider.totalBytes;
            uint256 additionalStake = (additionalBytes / 1 giga) * minimumStake;
            
            // Transfer additional tokens
            require(
                storageToken.transferFrom(msg.sender, address(this), additionalStake),
                "Additional staking transfer failed"
            );
            
            provider.stakedAmount += additionalStake;
        }
        
        // Update provider details
        provider.totalBytes = _newAvailableBytes;
        provider.availableBytes = _newAvailableBytes - (provider.totalBytes - provider.availableBytes);
        provider.isActive = _isActive;
        
        // Update with FileStorage contract
        fileStorage.updateProvider(_newAvailableBytes, _isActive);
        
        emit ProviderUpdated(msg.sender, provider.stakedAmount, provider.availableBytes, _isActive);
        
        return true;
    }
    
    /**
     * @dev Assigns a file to a provider for storage
     * @param _provider Address of the provider
     * @param _fileId ID of the file
     * @param _size Size of the file
     * @return success Whether the operation succeeded
     */
    function assignFileStorage(address _provider, bytes32 _fileId, uint256 _size) public returns (bool success) {
        // In production, this would be restricted to the FileStorage contract
        require(providers[_provider].isActive, "Provider not active");
        require(providers[_provider].availableBytes >= _size, "Insufficient available storage");
        
        // Store file details
        StoredFile storage storedFile = providerFiles[_provider][_fileId];
        storedFile.fileId = _fileId;
        storedFile.size = _size;
        storedFile.storageStartTime = block.timestamp;
        storedFile.isActive = true;
        
        // Update provider's available bytes
        providers[_provider].availableBytes -= _size;
        
        emit FileStorageAssigned(_provider, _fileId, _size);
        
        return true;
    }
    
    /**
     * @dev Revokes a file storage assignment
     * @param _provider Address of the provider
     * @param _fileId ID of the file
     * @return success Whether the operation succeeded
     */
    function revokeFileStorage(address _provider, bytes32 _fileId) public returns (bool success) {
        // In production, this would be restricted to the FileStorage contract
        require(providerFiles[_provider][_fileId].isActive, "File not stored by provider");
        
        StoredFile storage storedFile = providerFiles[_provider][_fileId];
        
        // Update provider's available bytes
        providers[_provider].availableBytes += storedFile.size;
        
        // Deactivate file storage
        storedFile.isActive = false;
        
        emit FileStorageRevoked(_provider, _fileId);
        
        return true;
    }
    
    /**
     * @dev Claims rewards for storing files
     * @return reward The amount of rewards claimed
     */
    function claimRewards() public returns (uint256 reward) {
        require(providers[msg.sender].isActive, "Provider not active");
        
        // Calculate rewards based on stored files, time, and size
        reward = _calculateRewards(msg.sender);
        
        if (reward > 0) {
            // Transfer rewards from contract to provider
            storageToken.transfer(msg.sender, reward);
            
            emit RewardPaid(msg.sender, reward);
        }
        
        return reward;
    }
    
    /**
     * @dev Calculates rewards for a provider
     * @param _provider Address of the provider
     * @return reward The calculated reward
     */
    function _calculateRewards(address _provider) private view returns (uint256 reward) {
        Provider storage provider = providers[_provider];
        
        // Base reward calculation - can be modified based on specific metrics
        // In a real system, this would consider uptime, retrieval speed, etc.
        uint256 usedStorage = provider.totalBytes - provider.availableBytes;
        uint256 timeStaked = (block.timestamp - provider.stakingTimestamp) / 1 days;
        
        // Simple reward formula: stake * usedStorage * time * rate
        reward = (provider.stakedAmount * usedStorage * timeStaked * storageToken.rewardRate()) / 1e30;
        
        return reward;
    }
    
    /**
     * @dev Gets all active providers
     * @return List of active provider addresses
     */
    function getActiveProviders() public view returns (address[] memory) {
        uint256 activeCount = 0;
        
        // Count active providers
        for (uint256 i = 0; i < allProviders.length; i++) {
            if (providers[allProviders[i]].isActive) {
                activeCount++;
            }
        }
        
        // Create array of active providers
        address[] memory activeProviders = new address[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allProviders.length; i++) {
            if (providers[allProviders[i]].isActive) {
                activeProviders[index] = allProviders[i];
                index++;
            }
        }
        
        return activeProviders;
    }
    
    /**
     * @dev Gets provider details
     * @param _provider Address of the provider
     * @return stakedAmount Amount staked
     * @return totalBytes Total bytes offered
     * @return availableBytes Available bytes
     * @return isActive Whether the provider is active
     * @return pendingRewards Pending rewards
     */
    function getProviderDetails(address _provider)
        public
        view
        returns (
            uint256 stakedAmount,
            uint256 totalBytes,
            uint256 availableBytes,
            bool isActive,
            uint256 pendingRewards
        )
    {
        Provider storage provider = providers[_provider];
        
        return (
            provider.stakedAmount,
            provider.totalBytes,
            provider.availableBytes,
            provider.isActive,
            _calculateRewards(_provider)
        );
    }
    
    /**
     * @dev Sets the minimum stake
     * @param _newMinimumStake New minimum stake
     */
    function setMinimumStake(uint256 _newMinimumStake) public {
        // In production, this would have access control
        minimumStake = _newMinimumStake;
    }
} 