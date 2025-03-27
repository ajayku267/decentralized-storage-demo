# Deploying to Render

This guide will help you deploy both the client and server portions of the Decentralized Storage Platform to Render.

## Prerequisites

- A [Render](https://render.com) account
- Git repository with your project

## Deployment Options

You have two options for deploying to Render:

1. **Blueprint Deployment** (Recommended): Uses the `render.yaml` configuration file
2. **Manual Deployment**: Configure each service manually

## Option 1: Blueprint Deployment

### Steps

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Log in to your [Render Dashboard](https://dashboard.render.com/)

3. Click on "New" and select "Blueprint"

4. Connect your Git repository

5. Render will automatically detect the `render.yaml` file and configure the services

6. Review the configuration and click "Apply"

7. Set any required environment variables that are marked as `sync: false` in the YAML file:
   - `MONGODB_URI`: Your MongoDB connection string
   - `ADMIN_WALLET`: The wallet address for the admin
   - `ADMIN_PRIVATE_KEY`: The private key for the admin wallet

8. Click "Create Blueprint" to start the deployment

## Option 2: Manual Deployment

### Deploy the Backend (API)

1. Log in to your [Render Dashboard](https://dashboard.render.com/)

2. Click on "New" and select "Web Service"

3. Connect your Git repository

4. Configure the service:
   - **Name**: `decentralized-storage-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

5. Configure Environment Variables:
   - `PORT`: `10000`
   - `NODE_ENV`: `production`
   - `ENABLE_DEMO_MODE`: `true`
   - `JWT_SECRET`: Generate a random string
   - `MONGODB_URI`: Your MongoDB connection string
   - `ADMIN_WALLET`: Your admin wallet address
   - `ADMIN_PRIVATE_KEY`: Your admin wallet private key

6. Click "Create Web Service"

### Deploy the Frontend (Client)

1. After the API is deployed, copy its URL

2. In your Render Dashboard, click on "New" and select "Static Site"

3. Connect your Git repository

4. Configure the service:
   - **Name**: `decentralized-storage-client`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

5. Configure Environment Variables:
   - `REACT_APP_API_URL`: The URL of your deployed API service
   - `REACT_APP_ENABLE_DEMO_MODE`: `true`

6. Add a Redirect/Rewrite Rule:
   - Source: `/*`
   - Destination: `/index.html`
   - Status: `200`

7. Click "Create Static Site"

## After Deployment

1. Check that both services are deployed successfully

2. Visit your frontend URL to test the application

3. Check the logs for any errors or issues

## Important Notes

1. **Render Free Tier**: Services on the free tier will spin down after periods of inactivity. The first request after inactivity may take a few seconds to respond.

2. **Demo Mode**: By default, the deployment is configured to run in demo mode, which simulates functionality without requiring actual blockchain or IPFS integration.

3. **Database**: For production use, you should set up a MongoDB database (either using Render's managed database or an external provider like MongoDB Atlas).

4. **SSL/HTTPS**: Render automatically provides SSL certificates for all services.

5. **Environment Variables**: Sensitive information like private keys should be properly secured. Render encrypts environment variables at rest.

## Troubleshooting

If you encounter issues with your Render deployment:

1. Check the deployment logs in the Render dashboard
2. Verify environment variables are correctly set
3. Ensure the application is properly configured for demo mode
4. Check that your MongoDB connection string is correct (if using an external database)

## Scaling (For Production)

For production deployments, consider:

1. Upgrading to a paid plan for better performance and no spin-down
2. Setting up auto-scaling for the API service
3. Using a CDN for the static site
4. Implementing proper monitoring and alerting