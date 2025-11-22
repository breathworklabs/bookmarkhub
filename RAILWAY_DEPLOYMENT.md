# Railway Deployment Guide for BookmarkHub

This guide provides step-by-step instructions for deploying BookmarkHub to Railway.

## Prerequisites

- A Railway account ([railway.app](https://railway.app))
- Railway CLI installed (optional but recommended)
- Git repository connected to your Railway project

## Quick Deploy

### Option 1: Deploy via GitHub

1. **Connect GitHub Repository**
   - Go to Railway dashboard
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `bookmarksx` repository

2. **Configure Environment Variables**
   - Go to your Railway project
   - Click on the service
   - Go to "Variables" tab
   - Add the following required variables:

   ```bash
   NODE_ENV=production
   PORT=${{PORT}}  # Railway provides this automatically
   VITE_APP_URL=https://your-app.railway.app
   ```

3. **Deploy**
   - Railway will automatically deploy when you push to your connected branch
   - Monitor the deployment in the Railway dashboard

### Option 2: Deploy via Railway CLI

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Initialize Project**
   ```bash
   railway init
   ```

4. **Link to Existing Project (if applicable)**
   ```bash
   railway link [project-id]
   ```

5. **Deploy**
   ```bash
   railway up
   ```

## Environment Variables

Copy the variables from `.env.production.example` to Railway's environment variables:

### Required Variables
- `NODE_ENV=production`
- `PORT` (automatically set by Railway)

### Optional Variables
- `VITE_SENTRY_DSN` - For error tracking
- `ENABLE_API_PROXY` - Set to `true` if you need the Twitter API proxy
- `TWITTER_BEARER_TOKEN` - Required if `ENABLE_API_PROXY=true`

## Build Configuration

Railway uses the `railway.json` file for build configuration:

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm ci && npm run build"
  },
  "deploy": {
    "startCommand": "npm run start:prod",
    "healthcheckPath": "/health"
  }
}
```

## Custom Domain Setup

1. **Add Custom Domain**
   - Go to your service settings
   - Click on "Settings" tab
   - Scroll to "Domains"
   - Add your custom domain

2. **Configure DNS**
   - Add a CNAME record pointing to your Railway app URL
   - Or use Railway's provided DNS settings

## Monitoring

### Health Check
The application provides a health check endpoint at `/health` which returns:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345,
  "environment": "production"
}
```

### Logs
View logs in Railway dashboard or via CLI:
```bash
railway logs
```

## Performance Optimization

1. **Enable Caching**
   - Static assets are cached for 1 year
   - HTML files are not cached

2. **Compression**
   - Gzip compression is enabled by default
   - Reduces bandwidth usage

3. **Security Headers**
   - Helmet.js provides security headers
   - CSP configured for Twitter/X embeds

## Troubleshooting

### Build Fails
- Check Node version (should be 18+)
- Ensure all dependencies are installed
- Check build logs for TypeScript errors

### App Not Loading
- Verify environment variables are set correctly
- Check if port binding is correct
- Review server logs for errors

### Twitter/X Features Not Working
- Ensure `ENABLE_API_PROXY=true`
- Verify `TWITTER_BEARER_TOKEN` is set
- Check CORS settings

## Rollback

To rollback to a previous deployment:

1. **Via Dashboard**
   - Go to deployments tab
   - Click on a previous successful deployment
   - Click "Rollback to this deployment"

2. **Via CLI**
   ```bash
   railway rollback
   ```

## Scaling

Railway automatically handles scaling based on your plan. For manual scaling:

1. Go to service settings
2. Adjust the number of instances
3. Configure memory and CPU limits

## Support

- Railway Documentation: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- BookmarkHub Issues: https://github.com/breathworklabs/bookmarksx/issues