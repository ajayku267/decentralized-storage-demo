# Decentralized Storage Application

A modern, secure, and efficient decentralized storage solution built with Ethereum, IPFS, and React Native.

## Features

### Core Features
- Decentralized file storage using IPFS
- Smart contract-based storage management
- User authentication and authorization
- File encryption and secure sharing
- Real-time file synchronization
- Cross-platform support (Web and Mobile)

### Advanced Features
- AI-powered storage optimization
- Zero-knowledge proofs for privacy
- Automated storage provider selection
- File versioning and history
- Collaborative file sharing
- Offline access support

## Project Structure

```
├── client/                 # Web application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── screens/       # Page components
│   │   ├── context/       # React context providers
│   │   ├── services/      # API and blockchain services
│   │   ├── utils/         # Utility functions
│   │   └── config/        # Configuration files
│   └── public/            # Static assets
│
├── mobile/                # React Native mobile app
│   ├── src/
│   │   ├── components/    # Mobile UI components
│   │   ├── screens/       # Mobile screens
│   │   ├── navigation/    # Navigation configuration
│   │   ├── services/      # Mobile-specific services
│   │   └── utils/         # Utility functions
│   └── assets/           # Mobile assets
│
├── server/               # Backend server
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── models/       # Database models
│   │   ├── services/     # Business logic
│   │   ├── routes/       # API routes
│   │   └── utils/        # Utility functions
│   └── config/          # Server configuration
│
└── contracts/           # Smart contracts
    ├── contracts/      # Solidity contracts
    ├── interfaces/     # Contract interfaces
    ├── libraries/      # Contract libraries
    └── scripts/        # Deployment scripts
```

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Ethereum wallet (MetaMask recommended)
- IPFS node (optional, can use public gateway)
- MongoDB (v6 or higher)
- Redis (v7 or higher)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/decentralized-storage.git
cd decentralized-storage
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development environment:
```bash
npm run start
```

## Development

### Web Application
```bash
npm run start:client
```

### Mobile Application
```bash
npm run start:mobile
```

### Backend Server
```bash
npm run start:server
```

### Smart Contracts
```bash
npm run compile --workspace=contracts
npm run test --workspace=contracts
```

## Deployment

### Smart Contracts
```bash
npm run deploy:contracts -- --network <network>
```

### Web Application
```bash
npm run build --workspace=client
```

### Mobile Application
```bash
# iOS
cd mobile/ios && pod install && cd ../..
npm run ios --workspace=mobile

# Android
npm run android --workspace=mobile
```

### Server
```bash
npm run build --workspace=server
npm run start --workspace=server
```

## Testing

```bash
# Run all tests
npm test

# Run specific workspace tests
npm run test --workspace=<workspace>
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Ethereum](https://ethereum.org/)
- [IPFS](https://ipfs.io/)
- [React Native](https://reactnative.dev/)
- [OpenZeppelin](https://openzeppelin.com/) 