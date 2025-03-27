// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./StorageToken.sol";

/**
 * @title FileStorage
 * @dev Manages file metadata, access control, and ownership for the decentralized storage system
 */
contract FileStorage {
    // Storage token contract instance
    StorageToken private storageToken;
    
    // Structure to store file metadata
    struct File {
        string cid;           // IPFS Content Identifier
        address owner;        // Owner of the file
        uint256 size;         // Size of the file in bytes
        uint256 timestamp;    // Upload timestamp
        bool isPrivate;       // Whether the file is private or public
        string name;          // Name of the file
        string fileType;      // Type of file
        mapping(address => bool) authorizedUsers; // Users authorized to access private files
    }
    
    // Storage provider structure
    struct StorageProvider {
        address providerAddress;  // Address of the storage provider
        uint256 totalSpace;       // Total space offered by the provider (in bytes)
        uint256 usedSpace;        // Space currently used (in bytes)
        uint256 reputationScore;  // Reputation score (0-100)
        bool isActive;            // Whether the provider is currently active
    }
    
    // Mapping from file IDs to file metadata
    mapping(bytes32 => File) private files;
    
    // Mapping of user addresses to their file IDs
    mapping(address => bytes32[]) private userFiles;
    
    // Mapping of storage provider addresses
    mapping(address => StorageProvider) private storageProviders;
    
    // Array of all storage providers
    address[] private allProviders;
    
    // File upload cost in tokens per byte
    uint256 public uploadCostPerByte;
    
    // Events
    event FileUploaded(bytes32 indexed fileId, address indexed owner, string cid, uint256 size);
    event FileAccessed(bytes32 indexed fileId, address indexed user);
    event AccessGranted(bytes32 indexed fileId, address indexed grantee, address indexed grantor);
    event AccessRevoked(bytes32 indexed fileId, address indexed revokee, address indexed revoker);
    event ProviderRegistered(address indexed provider, uint256 totalSpace);
    event ProviderUpdated(address indexed provider, uint256 totalSpace, bool isActive);
    
    /**
     * @dev Constructor sets the token contract and initial upload cost
     * @param _tokenAddress Address of the storage token contract
     * @param _uploadCostPerByte Initial cost per byte in tokens
     */
    constructor(address _tokenAddress, uint256 _uploadCostPerByte) {
        storageToken = StorageToken(_tokenAddress);
        uploadCostPerByte = _uploadCostPerByte;
    }
    
    /**
     * @dev Modifier to check if caller is the file owner
     */
    modifier onlyFileOwner(bytes32 _fileId) {
        require(files[_fileId].owner == msg.sender, "Caller is not the file owner");
        _;
    }
    
    /**
     * @dev Modifier to check if caller has access to the file
     */
    modifier hasAccess(bytes32 _fileId) {
        if (files[_fileId].isPrivate) {
            require(
                files[_fileId].owner == msg.sender || files[_fileId].authorizedUsers[msg.sender],
                "You don't have permission to access this file"
            );
        }
        _;
    }
    
    /**
     * @dev Register as a storage provider
     * @param _totalSpace Total space offered in bytes
     * @return success Whether the operation succeeded
     */
    function registerProvider(uint256 _totalSpace) public returns (bool success) {
        require(_totalSpace > 0, "Space offered must be greater than 0");
        require(!storageProviders[msg.sender].isActive, "Provider already registered");
        
        // Create new provider
        StorageProvider storage newProvider = storageProviders[msg.sender];
        newProvider.providerAddress = msg.sender;
        newProvider.totalSpace = _totalSpace;
        newProvider.usedSpace = 0;
        newProvider.reputationScore = 50; // Starting with a neutral score
        newProvider.isActive = true;
        
        allProviders.push(msg.sender);
        
        emit ProviderRegistered(msg.sender, _totalSpace);
        
        return true;
    }
    
    /**
     * @dev Update storage provider details
     * @param _totalSpace New total space offered in bytes
     * @param _isActive Whether the provider is active
     * @return success Whether the operation succeeded
     */
    function updateProvider(uint256 _totalSpace, bool _isActive) public returns (bool success) {
        require(storageProviders[msg.sender].isActive, "Provider not registered");
        
        StorageProvider storage provider = storageProviders[msg.sender];
        provider.totalSpace = _totalSpace;
        provider.isActive = _isActive;
        
        emit ProviderUpdated(msg.sender, _totalSpace, _isActive);
        
        return true;
    }
    
    /**
     * @dev Upload a file to the storage system
     * @param _cid IPFS content identifier
     * @param _size File size in bytes
     * @param _name File name
     * @param _fileType File type
     * @param _isPrivate Whether the file is private
     * @return fileId The ID of the uploaded file
     */
    function uploadFile(
        string memory _cid,
        uint256 _size,
        string memory _name,
        string memory _fileType,
        bool _isPrivate
    ) public returns (bytes32 fileId) {
        require(bytes(_cid).length > 0, "CID cannot be empty");
        require(_size > 0, "File size must be greater than 0");
        
        // Calculate storage cost
        uint256 storageCost = _size * uploadCostPerByte;
        
        // Transfer tokens from user to contract
        require(
            storageToken.transferFrom(msg.sender, address(this), storageCost),
            "Token transfer failed"
        );
        
        // Generate unique file ID
        fileId = keccak256(abi.encodePacked(_cid, msg.sender, block.timestamp));
        
        // Create file metadata
        File storage newFile = files[fileId];
        newFile.cid = _cid;
        newFile.owner = msg.sender;
        newFile.size = _size;
        newFile.timestamp = block.timestamp;
        newFile.isPrivate = _isPrivate;
        newFile.name = _name;
        newFile.fileType = _fileType;
        
        // Add file to user's files
        userFiles[msg.sender].push(fileId);
        
        // Emit file upload event
        emit FileUploaded(fileId, msg.sender, _cid, _size);
        
        return fileId;
    }
    
    /**
     * @dev Get file details
     * @param _fileId ID of the file
     * @return cid Content identifier
     * @return owner File owner
     * @return size File size
     * @return timestamp Upload timestamp
     * @return isPrivate Whether the file is private
     * @return name File name
     * @return fileType File type
     */
    function getFileDetails(bytes32 _fileId)
        public
        view
        hasAccess(_fileId)
        returns (
            string memory cid,
            address owner,
            uint256 size,
            uint256 timestamp,
            bool isPrivate,
            string memory name,
            string memory fileType
        )
    {
        File storage file = files[_fileId];
        
        return (
            file.cid,
            file.owner,
            file.size,
            file.timestamp,
            file.isPrivate,
            file.name,
            file.fileType
        );
    }
    
    /**
     * @dev Access a file
     * @param _fileId ID of the file to access
     * @return cid Content identifier of the file
     */
    function accessFile(bytes32 _fileId)
        public
        hasAccess(_fileId)
        returns (string memory cid)
    {
        emit FileAccessed(_fileId, msg.sender);
        return files[_fileId].cid;
    }
    
    /**
     * @dev Grant access to a file
     * @param _fileId ID of the file
     * @param _user Address of the user to grant access
     * @return success Whether the operation succeeded
     */
    function grantAccess(bytes32 _fileId, address _user)
        public
        onlyFileOwner(_fileId)
        returns (bool success)
    {
        require(_user != address(0), "Invalid user address");
        require(files[_fileId].isPrivate, "File is not private");
        
        files[_fileId].authorizedUsers[_user] = true;
        
        emit AccessGranted(_fileId, _user, msg.sender);
        
        return true;
    }
    
    /**
     * @dev Revoke access to a file
     * @param _fileId ID of the file
     * @param _user Address of the user to revoke access from
     * @return success Whether the operation succeeded
     */
    function revokeAccess(bytes32 _fileId, address _user)
        public
        onlyFileOwner(_fileId)
        returns (bool success)
    {
        require(_user != address(0), "Invalid user address");
        
        files[_fileId].authorizedUsers[_user] = false;
        
        emit AccessRevoked(_fileId, _user, msg.sender);
        
        return true;
    }
    
    /**
     * @dev Check if user has access to a file
     * @param _fileId ID of the file
     * @param _user Address of the user
     * @return hasAccess Whether the user has access
     */
    function checkAccess(bytes32 _fileId, address _user)
        public
        view
        returns (bool)
    {
        if (!files[_fileId].isPrivate) {
            return true;
        }
        
        return (files[_fileId].owner == _user || files[_fileId].authorizedUsers[_user]);
    }
    
    /**
     * @dev Get all files owned by the caller
     * @return fileIds Array of file IDs owned by the caller
     */
    function getMyFiles() public view returns (bytes32[] memory) {
        return userFiles[msg.sender];
    }
    
    /**
     * @dev Set the upload cost per byte
     * @param _newCost New cost per byte
     */
    function setUploadCostPerByte(uint256 _newCost) public {
        // In a production environment, this would have access control
        uploadCostPerByte = _newCost;
    }
    
    /**
     * @dev Get all active storage providers
     * @return providers Array of provider addresses
     */
    function getActiveProviders() public view returns (address[] memory) {
        uint256 activeCount = 0;
        
        // Count active providers
        for (uint256 i = 0; i < allProviders.length; i++) {
            if (storageProviders[allProviders[i]].isActive) {
                activeCount++;
            }
        }
        
        // Create array of active providers
        address[] memory activeProviders = new address[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allProviders.length; i++) {
            if (storageProviders[allProviders[i]].isActive) {
                activeProviders[index] = allProviders[i];
                index++;
            }
        }
        
        return activeProviders;
    }
    
    /**
     * @dev Get provider details
     * @param _provider Address of the provider
     * @return totalSpace Total space offered
     * @return usedSpace Used space
     * @return reputationScore Reputation score
     * @return isActive Whether the provider is active
     */
    function getProviderDetails(address _provider)
        public
        view
        returns (
            uint256 totalSpace,
            uint256 usedSpace,
            uint256 reputationScore,
            bool isActive
        )
    {
        StorageProvider storage provider = storageProviders[_provider];
        
        return (
            provider.totalSpace,
            provider.usedSpace,
            provider.reputationScore,
            provider.isActive
        );
    }
} 