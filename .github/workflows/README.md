# GitHub Actions Workflows

This directory contains automated CI/CD workflows for BookmarkHub.

## Workflows

### 🧪 Test Workflow (`test.yml`)
**Triggers:** Push/PR to master, main, or develop branches

**What it does:**
- Runs ESLint for code quality checks
- Executes all 752 test suites
- Builds the production bundle
- Uploads build artifacts for review

**Status:** ✅ Fully automated, no configuration needed

---

### 🚀 Deploy Workflow (`deploy.yml`)
**Triggers:** Push to master/main, or manual trigger

**What it does:**
- Runs all tests before deployment
- Builds production bundle with environment variables
- Prepares deployment artifacts
- Ready for Vercel/Netlify integration

**Configuration Required:**
1. Choose deployment platform (Vercel or Netlify)
2. Add secrets to GitHub repository settings:
   - For Vercel: `VERCEL_TOKEN`
   - For Netlify: `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`
3. Uncomment deployment steps in `deploy.yml`
4. (Optional) Add production secrets:
   - `VITE_SENTRY_DSN` - Error tracking (optional)

**Quick Setup:**
- **Vercel**: Connect GitHub repo at [vercel.com](https://vercel.com)
- **Netlify**: Connect GitHub repo at [netlify.com](https://netlify.com)

---

### 🔒 Security Audit Workflow (`security.yml`)
**Triggers:**
- Weekly schedule (Mondays at 9 AM UTC)
- When package.json/package-lock.json changes
- Manual trigger

**What it does:**
- Runs `npm audit` to check for vulnerabilities
- Reports outdated dependencies
- Alerts about security issues

**Status:** ✅ Fully automated, runs weekly

---

## Local Testing

Test workflows locally before pushing:

```bash
# Run tests
npm test

# Run linter
npm run lint

# Build production
npm run build

# Security audit
npm audit
```

## Monitoring

View workflow runs at:
`https://github.com/YOUR_USERNAME/bookmarksx/actions`

All workflow runs are logged and can be inspected for debugging.
