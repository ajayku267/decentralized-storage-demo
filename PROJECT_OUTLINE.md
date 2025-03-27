# Decentralized Cloud Storage System

## Project Overview
A decentralized cloud storage system built on Ethereum blockchain and IPFS that allows users to store, retrieve, and share files securely. The system includes a token incentive mechanism for storage providers, similar to Filecoin.

## Technology Stack
- **Smart Contracts**: Solidity, Hardhat
- **Blockchain**: Ethereum (Polygon for lower fees)
- **Storage**: IPFS/Filecoin
- **Frontend**: React.js
- **Backend**: Node.js, Express
- **Database**: MongoDB (for metadata)
- **Authentication**: MetaMask wallet integration

## Core Components

### 1. Smart Contracts
- `FileStorage.sol`: Manages file metadata, access control, and ownership
- `StorageToken.sol`: ERC-20 token for the storage incentive system
- `StakingContract.sol`: For storage providers to stake tokens

### 2. IPFS Integration
- File encryption before storage
- Pinning service integration (Pinata)
- Content addressing for retrieval

### 3. Frontend Application
- User authentication with MetaMask
- File upload and retrieval interface
- Access control management
- Storage provider dashboard

### 4. Backend Services
- API for IPFS interaction
- Metadata management
- Token transaction processing

## Key Features

### Secure File Upload & Storage
- Client-side encryption
- IPFS storage with CID on blockchain
- Access control via smart contracts

### Decentralized File Retrieval
- CID-based file access
- Permission verification
- Encrypted transmission

### Access Control System
- Ownership records on blockchain
- Permission granting/revocation
- Multi-user access management

### Token Incentive Mechanism
- ERC-20 token implementation
- Payment for storage services
- Rewards for storage providers

### User Authentication
- MetaMask wallet integration
- Address-based authentication
- Transaction signing for security

### Admin Dashboard
- Storage usage monitoring
- Transaction history
- Performance analytics

## System Workflow

### File Upload Process
1. User authenticates with MetaMask
2. User uploads file through frontend
3. File is encrypted client-side
4. Encrypted file is stored on IPFS
5. IPFS CID is recorded on blockchain
6. Storage tokens are transferred as payment

### File Retrieval Process
1. User authenticates with MetaMask
2. User requests file by ID
3. Smart contract verifies access permissions
4. If authorized, file is retrieved from IPFS
5. File is decrypted client-side

### Storage Provider Process
1. Provider stakes tokens in smart contract
2. Provider offers storage space to network
3. Provider stores files and maintains availability
4. Provider earns tokens based on storage time and retrieval efficiency

## Project Structure
```
/
├── client/                # Frontend React application
│   ├── public/
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Application pages
│   │   ├── context/       # React context providers
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── ...
├── contracts/             # Solidity smart contracts
│   ├── FileStorage.sol
│   ├── StorageToken.sol
│   └── StakingContract.sol
├── scripts/               # Deployment scripts
├── server/                # Node.js backend
│   ├── controllers/       # API controllers
│   ├── models/            # Data models
│   ├── routes/            # API routes
│   └── services/          # Backend services
├── test/                  # Test files
└── ...
```

## Development Roadmap

### Phase 1: Smart Contract Development (Week 1-2)
- Design and implement the FileStorage contract
- Develop the StorageToken contract
- Create the StakingContract
- Deploy and test on Ethereum testnet

### Phase 2: IPFS Integration (Week 3-4)
- Set up IPFS node or Pinata connection
- Implement file encryption
- Create IPFS upload/download services

### Phase 3: Frontend Development (Week 5-6)
- Build React.js UI components
- Implement MetaMask integration
- Develop file upload/retrieval interface

### Phase 4: Token System (Week 7-8)
- Implement token functionality in frontend
- Develop staking mechanism
- Create reward distribution system

### Phase 5: Testing & Deployment (Week 9-10)
- Comprehensive testing
- Security audit
- Mainnet deployment

## Advanced Features (Future Enhancements)
- Zero-Knowledge Proofs for privacy
- AI-powered storage optimization
- Cross-chain compatibility
- Mobile application
- Decentralized governance 