# Deployment Guide

## Deploying to Vercel

Vercel is the recommended hosting platform for this application, optimized for React/Vite apps.

### Quick Setup

1. **Create account** at [vercel.com](https://vercel.com)

2. **Click "Add New Project"**

3. **Import your Git repository** (connect GitHub/GitLab/Bitbucket)

4. **Configure project settings:**
   - Framework Preset: **Vite** (auto-detected)
   - Build Command: `npm run vercel-build` (runs tests + build)
   - Output Directory: `dist`
   - Install Command: `npm install`

5. **Add Environment Variables** in project settings:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GA_MEASUREMENT_ID=your_google_analytics_id
   VITE_SENTRY_DSN=your_sentry_dsn
   ```

6. **Click "Deploy"**

### After First Deploy

- You'll get a free `.vercel.app` subdomain
- **Add custom domain:** Project Settings → Domains → Add `breathworklabs.com`
- **Auto-deploys:** Every push to main branch deploys automatically
- **Preview URLs:** Every PR gets its own preview URL

### Running Tests Before Deploy

The project is configured to automatically run tests before deployment:

- **Build command**: `npm run vercel-build` runs tests first, then builds
- **Tests must pass** for deployment to succeed
- **Failed tests** will abort the deployment

To skip tests (not recommended):
- Change build command to: `npm run build`

### Benefits

✅ **Lightning fast** global CDN
✅ **Automatic HTTPS**
✅ **Zero config** - just works
✅ **Preview deployments** for testing
✅ **Analytics** built-in (free tier)
✅ **Tests run before deploy** (quality control)
✅ **Edge functions** if needed later

### Manual Deployment (Alternative)

If you prefer to deploy manually:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

## Other Deployment Options

### Render

1. Create account at [render.com](https://render.com)
2. Click "New Static Site"
3. Connect your repository
4. Configure:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
5. Add environment variables
6. Click "Create Static Site"

### Netlify

1. Create account at [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your repository
4. Configure:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
5. Add environment variables
6. Click "Deploy site"

### Cloudflare Pages

1. Create account at [cloudflare.com](https://cloudflare.com)
2. Go to Pages → "Create a project"
3. Connect your repository
4. Configure:
   - Framework preset: **Vite**
   - Build Command: `npm run build`
   - Build output directory: `dist`
5. Add environment variables
6. Click "Save and Deploy"

---

**Recommended:** Use Vercel for optimal performance with React/Vite applications.
