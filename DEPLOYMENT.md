# Decentralized Storage Application Deployment Guide

This document provides instructions for deploying the Decentralized Storage application to various environments.

## Prerequisites

- Node.js v16+ and npm
- MongoDB instance (optional but recommended for production)
- IPFS node (optional, can use public gateways)
- Ethereum node (or Infura/Alchemy account for mainnet/testnet)
- Deployed smart contracts (or use demo mode)

## Environment Configuration

Before deployment, you need to set up the appropriate environment variables. Copy the example files and modify them for your environment:

```bash
# For the server
cp server/.env.example server/.env

# For the client
cp client/.env.example client/.env
```

### Server Environment Variables

Key environment variables for the server:

- `NODE_ENV`: Set to `production` for production deployments
- `PORT`: The port to run the server on (default: 5001)
- `MONGODB_URI`: Your MongoDB connection string
- `PRIVATE_KEY`: Ethereum private key for server operations (Keep secure!)
- Network and contract addresses (see .env.example)

### Client Environment Variables

Key environment variables for the client:

- `REACT_APP_API_URL`: URL to the backend API
- Contract addresses for blockchain interaction
- `REACT_APP_ENABLE_DEMO_MODE`: Enable/disable demo mode

## Deployment Options

### 1. Traditional Server Deployment

For deploying to a traditional server or VPS:

```bash
# Clone the repository
git clone https://github.com/your-username/decentralized-storage.git
cd decentralized-storage

# Install dependencies and build
npm run build:all

# Start the production server
npm run prod
```

### 2. Docker Deployment

For deploying using Docker:

```bash
# Build the Docker image
docker build -t decentralized-storage:latest .

# Run the container
docker run -p 5001:5001 --env-file .env -d decentralized-storage:latest
```

### 3. Docker Compose

For deploying with Docker Compose (including MongoDB):

1. Create a `docker-compose.yml` file:

```yaml
version: '3'

services:
  app:
    build: .
    ports:
      - "5001:5001"
    env_file:
      - .env
    depends_on:
      - mongodb
    restart: unless-stopped

  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped

volumes:
  mongodb_data:
```

2. Run with:

```bash
docker-compose up -d
```

### 4. Cloud Deployment

#### Heroku

1. Install the Heroku CLI and log in
2. Set up the appropriate environment variables in Heroku dashboard
3. Deploy with:

```bash
git push heroku main
```

#### AWS Elastic Beanstalk

1. Install the EB CLI and initialize your application
2. Set environment variables in the EB Console
3. Deploy with:

```bash
eb deploy
```

## Monitoring and Maintenance

### Health Checks

The application provides several health check endpoints:

- `/api/health`: Basic health check
- `/api/health/detailed`: Detailed system health information
- `/api/health/readiness`: Kubernetes-style readiness probe
- `/api/health/liveness`: Kubernetes-style liveness probe

### Logs

Logs are stored in the `server/logs` directory:

- `combined.log`: All logs
- `error.log`: Error logs only

## Scaling Considerations

For high-traffic deployments:

1. Use a load balancer to distribute traffic across multiple instances
2. Scale the MongoDB database using replica sets
3. Use a dedicated IPFS node or service
4. Consider using a CDN for serving static assets

## Backup Strategy

1. Database: Set up regular MongoDB backups
2. IPFS: Ensure files are pinned on multiple nodes
3. Environment variables: Keep secure backups of all configuration

## Troubleshooting

If you encounter issues:

1. Check the logs in `server/logs`
2. Verify all environment variables are set correctly
3. Ensure the MongoDB connection is working
4. Test the health check endpoints for service status

## Security Considerations

1. **NEVER** expose your private keys or API keys
2. Set up proper authentication for all endpoints
3. Use HTTPS for all production deployments
4. Regularly update dependencies with `npm audit fix`
5. Implement rate limiting for public endpoints

## Contact

For additional help, please contact the development team. 