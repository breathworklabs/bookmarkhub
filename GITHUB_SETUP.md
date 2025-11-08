# GitHub Repository Setup for BookmarkX

## Project Information

- **Project Name:** bookmarkx
- **Production Domain:** bookmarkx.breathworklabs.com
- **Repository:** Can be under personal account or organization

## Option A: Personal Repository (Simpler)

### Step 1: Create Repository

1. Go to [github.com/new](https://github.com/new)

2. **Configure repository:**
   - Repository name: `bookmarkx`
   - Description: `Privacy-focused bookmark manager for X/Twitter`
   - Visibility: **Public** or **Private** (your choice)
   - **DO NOT** initialize with README (you already have files)
   - **DO NOT** add .gitignore (you already have one)

3. Click **"Create repository"**

### Step 2: Push Your Code

```bash
# Check current remote (if any)
git remote -v

# Remove existing remote if present
git remote remove origin

# Add new remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/bookmarkx.git

# Ensure you're on master/main branch
git branch -M master

# Push your code
git push -u origin master
```

---

## Option B: Organization Repository (If you want breathworklabs org)

### Step 1: Create Breathwork Labs Organization

1. Go to [github.com/organizations/new](https://github.com/organizations/new)

2. **Fill in organization details:**
   - Organization account name: `breathworklabs`
   - Contact email: `your-email@example.com`
   - This organization belongs to: **My personal account**
   - Plan: **Free** (unlimited private repos)

3. Click **"Next"** → Skip team invitation → **"Complete setup"**

### Step 2: Configure Organization Profile

1. Go to `github.com/breathworklabs`
2. Click **"Edit profile"**
3. Add:
   - Display name: **Breathwork Labs**
   - Description: *Building privacy-focused productivity tools*
   - Website: `https://bookmarkx.breathworklabs.com`
4. Upload a logo/avatar (optional)
5. Click **"Save"**

### Step 3: Create Repository

1. Go to `github.com/organizations/breathworklabs/repositories/new`

2. **Configure repository:**
   - Owner: **breathworklabs**
   - Repository name: `bookmarkx`
   - Description: `Privacy-focused bookmark manager for X/Twitter`
   - Visibility: **Public** or **Private** (your choice)
   - **DO NOT** initialize with README (you already have files)

3. Click **"Create repository"**

### Step 4: Push Your Code (for Option B)

```bash
# Check current remote (if any)
git remote -v

# Remove existing remote if present
git remote remove origin

# Add new remote to Breathwork Labs organization
git remote add origin https://github.com/breathworklabs/bookmarkx.git

# Ensure you're on master branch
git branch -M master

# Push your code
git push -u origin master
```

---

## Repository Configuration (Both Options)

### Configure Repository Settings

1. Go to your repository settings

2. **General Settings:**
   - Disable Wiki (unless you want it)
   - Disable Projects (unless you want it)
   - Enable Issues ✅
   - Enable Discussions (optional)

3. **Branches:**
   - Set `master` as default branch
   - Consider adding branch protection rules:
     - Go to Settings → Branches → Add rule
     - Branch name pattern: `master`
     - Enable "Require status checks to pass before merging"

4. **Secrets (for CI/CD later):**
   - Settings → Secrets and variables → Actions
   - Add secrets for environment variables (when needed)

### Connect to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select **GitHub**
4. Select your `bookmarkx` repository
5. Follow Vercel deployment steps from DEPLOYMENT.md
6. Configure custom domain: `bookmarkx.breathworklabs.com`

## Optional: Add Collaborators

If you want to add team members later:

1. Go to `github.com/orgs/breathworklabs/people`
2. Click **"Invite member"**
3. Enter their GitHub username or email
4. Set their role (Member, Billing manager, or Owner)

## Optional: GitHub Actions (CI/CD)

Create `.github/workflows/ci.yml` for automated testing:

```yaml
name: CI

on:
  push:
    branches: [ master ]
  pull_request:
    branches: [ master ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '20'
        cache: 'npm'
    - run: npm ci
    - run: npm run typecheck
    - run: npm run lint
    - run: npm run test -- --run
```

---

## Quick Command Reference

```bash
# Clone repo (after setup) - Personal
git clone https://github.com/YOUR_USERNAME/bookmarkx.git

# Clone repo (after setup) - Organization
git clone https://github.com/breathworklabs/bookmarkx.git

# Check remote
git remote -v

# Push changes
git add .
git commit -m "Your message"
git push origin master

# Create new branch
git checkout -b feature-name
git push -u origin feature-name
```

---

**Project Name:** bookmarkx
**Production Domain:** bookmarkx.breathworklabs.com
**Repository Name:** bookmarkx (not x-bookmark-manager)
