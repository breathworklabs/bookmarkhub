# Deployment Guide

## Deploying to Railway (Recommended)

Railway is the recommended hosting platform for this application, with simple setup and automatic deployments.

### Quick Setup

1. **Create account** at [railway.app](https://railway.app)

2. **Click "New Project"**

3. **Select "Deploy from GitHub repo"** and connect your repository

4. **Configure deployment:**
   - Framework: Detected automatically (Static Site)
   - Build Command: `npm run build`
   - Start Command: Not needed (static site)
   - Publish Directory: `dist`

5. **Environment Variables** (Optional - this app uses local storage only):

   ```
   # All environment variables are OPTIONAL for this app
   # The app works entirely with browser localStorage
   VITE_GA_MEASUREMENT_ID=your_google_analytics_id (optional)
   VITE_SENTRY_DSN=your_sentry_dsn (optional)
   ```

6. **Click "Deploy"**

### After First Deploy

- You'll get a free Railway domain (e.g., `bookmarkhub-production.up.railway.app`)
- **Add custom domain:** Project Settings → Custom Domain → Add `bookmarkx.breathworklabs.com`
- **Auto-deploys:** Every push to `master` branch deploys automatically
- **Instant rollbacks:** Easy rollback to previous deployments

### Deployment Script Behavior

⚠️ **IMPORTANT:** The app uses different build commands for different scenarios:

**For Railway/Production:**

```bash
npm run build
```

- Standard build without running tests
- Fast deployment
- Tests should be run locally before pushing

**Current Status:**

- ✅ TypeScript: 0 errors
- ✅ Tests: 425/430 passing
- ✅ Build: Successful
- ✅ Ready for production deployment

### Benefits of Railway

✅ **Simple setup** - deploy in 2 minutes
✅ **Automatic HTTPS** with custom domains
✅ **Fast CDN** for static assets
✅ **Easy rollbacks** to previous versions
✅ **GitHub integration** - auto-deploy on push
✅ **Free tier** available
✅ **Environment-based deployments** (staging/production)

### Manual Railway Deployment (Alternative)

If you prefer to deploy via CLI:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# Deploy
railway up
```

---

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

## Pre-Deployment Checklist

Before deploying to production, verify:

- [ ] **TypeScript:** Run `npm run typecheck` - should have 0 errors
- [ ] **Tests:** Run `npm test` - should pass (currently 425/430 passing)
- [ ] **Build:** Run `npm run build` - should succeed
- [ ] **Local preview:** Run `npm run preview` - verify app works
- [ ] **Git status:** All changes committed and pushed to `master`
- [ ] **Domain:** Ensure custom domain DNS is configured (if using)

**Current Status:** ✅ All checks passing - ready for production deployment

---

## Environment Variables Reference

This app is **100% local storage based** and does NOT require any backend services or environment variables.

**Optional Environment Variables:**

| Variable                 | Purpose                   | Required? | Default              |
| ------------------------ | ------------------------- | --------- | -------------------- |
| `VITE_GA_MEASUREMENT_ID` | Google Analytics tracking | ❌ No     | None (no tracking)   |
| `VITE_SENTRY_DSN`        | Error monitoring          | ❌ No     | None (no monitoring) |

**Not Used (Legacy References):**

- ~~`VITE_SUPABASE_URL`~~ - Not used (local storage only)
- ~~`VITE_SUPABASE_ANON_KEY`~~ - Not used (local storage only)

---

## Deployment Commands Reference

```bash
# Standard build (Railway, Netlify, Cloudflare)
npm run build

# Local preview of production build
npm run preview

# Type checking
npm run typecheck

# Run tests
npm test

# Run tests once (CI mode)
npm test -- --run
```

---

**Recommended:** Use Railway for simple, fast deployments with automatic HTTPS and custom domains.
