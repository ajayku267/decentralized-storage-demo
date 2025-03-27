# Deploying to Vercel

This guide will help you deploy the client portion of the Decentralized Storage Platform to Vercel for a live demo.

## Prerequisites

- A [Vercel](https://vercel.com) account
- Git repository with your project (GitHub, GitLab, or Bitbucket)

## Deployment Steps

### 1. Prepare Your Repository

Make sure your repository has the following files in the client directory:
- `vercel.json` (configuration file for Vercel)
- Updated `package.json` with the `vercel-build` script

### 2. Deploy to Vercel

#### Using the Vercel Dashboard

1. Log in to your [Vercel dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Configure the project:
   - Set the **Framework Preset** to "Create React App"
   - Set the **Root Directory** to `client`
   - Set the **Build Command** to `npm run vercel-build`
   - Set the **Output Directory** to `build`
5. Configure environment variables:
   - `REACT_APP_ENABLE_DEMO_MODE`: Set to `true`
   - `REACT_APP_API_URL`: If you have a backend deployed elsewhere, set it here
6. Click "Deploy"

#### Using the Vercel CLI

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Navigate to the client directory:
   ```bash
   cd client
   ```

3. Deploy with Vercel:
   ```bash
   vercel
   ```

4. Follow the CLI prompts to configure your project

### 3. Verify Your Deployment

After deployment completes:

1. Visit your deployed URL (e.g., `https://your-project.vercel.app`)
2. Verify that the demo mode is working correctly
3. Test uploading files and other functionality

## Important Notes for Vercel Deployment

1. **Backend API**: Vercel is primarily for frontend applications. You need to deploy your backend/API separately.

2. **Demo Mode**: For the live demo, the application is configured to automatically enter demo mode when deployed on Vercel.

3. **Environment Variables**: If you need to update environment variables after deployment, you can do so from the Vercel dashboard.

4. **Preview Deployments**: Vercel automatically creates preview deployments for pull requests.

## Deploying the Backend API (if needed)

If you want a fully functional application (beyond demo mode), you need to deploy the backend API separately using:

- [Render](https://render.com/) (recommended)
- [Heroku](https://heroku.com/)
- [DigitalOcean App Platform](https://www.digitalocean.com/products/app-platform/)

After deploying the backend, update the `REACT_APP_API_URL` environment variable in your Vercel project to point to your backend URL.

## Troubleshooting

If you encounter issues with your Vercel deployment:

1. Check the deployment logs in the Vercel dashboard
2. Verify environment variables are correctly set
3. Ensure the application is properly configured for demo mode
4. Check the browser console for any frontend errors 