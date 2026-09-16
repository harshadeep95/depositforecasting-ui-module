# Deployment Guide - Deposit Insight Engine Free

This guide covers deploying your application to production using various platforms.

## Quick Start (Recommended)

**Deploy to Vercel in 5 minutes** with zero configuration required.

---

## Option 1: Deploy to Vercel (Easiest & Recommended)

Vercel is the optimal choice for Vite + React applications. It provides automatic deployments, edge functions, and is free for open-source projects.

### Step 1: Push to GitHub

First, initialize a Git repository and push to GitHub:

```bash
cd "Deposit-Insight-Engine-Free"
git init
git add .
git commit -m "Initial commit: Deposit Insight Engine Free"
git remote add origin https://github.com/YOUR_USERNAME/deposit-insight-engine-free.git
git branch -M main
git push -u origin main
```

### Step 2: Create Vercel Account

1. Go to https://vercel.com
2. Click "Sign Up" (or use GitHub login)
3. Choose "Hobby" plan (free tier)

### Step 3: Deploy Your Repository

1. On Vercel dashboard, click **"Add New"** → **"Project"**
2. Select **"Import Git Repository"**
3. Enter your GitHub repository URL:
   ```
   https://github.com/YOUR_USERNAME/deposit-insight-engine-free
   ```
4. Click **"Import"**

### Step 4: Configure Build Settings

Vercel will auto-detect your Vite setup. Confirm:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` (auto-detected) |

Everything should be pre-filled. Just click **"Deploy"**.

### Step 5: Wait for Deployment ✅

Vercel will:
1. Clone your repository
2. Install dependencies
3. Build your project
4. Deploy to a live URL

This takes about 2-3 minutes. You'll see:
```
✓ Build completed
✓ Deployment live at: https://your-project.vercel.app
```

### Step 6: Configure Environment Variables (Optional - For AI Features)

If you want to enable AI analysis with OpenAI:

1. Go to **Project Settings** → **Environment Variables**
2. Add:
   - **Name:** `VITE_OPENAI_API_KEY`
   - **Value:** Your OpenAI API key (from https://platform.openai.com/api-keys)
   - **Environments:** Production
3. Click **"Save"**
4. Vercel will auto-redeploy with the new variable

### Step 7: Enable Auto-Deployments (Optional)

Vercel automatically deploys when you push to GitHub:

```bash
# Make a change to your code
# Push to GitHub
git add .
git commit -m "Update feature"
git push

# Your Vercel deployment will update automatically!
```

### Troubleshooting Vercel Deployment

| Issue | Solution |
|-------|----------|
| **Build fails** | Check build logs: Project → Deployments → click latest → "Build Logs" tab |
| **Build succeeds but app crashes** | Check "Runtime Logs" in deployment details; may need env variables |
| **Node version errors** | Vercel uses Node 20 LTS by default (compatible with this project) |
| **404 errors for routes** | Add `vercel.json` (see section below) |

#### Optional: Create `vercel.json` for Route Handling

If you encounter 404 errors for non-root routes, create this file:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_OPENAI_API_KEY": "@openai_api_key"
  },
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

Save as: `vercel.json` in project root, then commit and push.

---

## Option 2: Deploy to Netlify

Similar to Vercel, with slightly different UI.

### Step 1-2: Same as Vercel (Push to GitHub)

### Step 3: Connect to Netlify

1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose GitHub and authorize
4. Select your repository

### Step 4: Build Configuration

Netlify should auto-detect settings:
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** 20 (or latest)

### Step 5: Deploy

Click **"Deploy"** and wait for the build.

### Step 6: Set Environment Variables (Optional)

**Build & deploy** → **Environment** → **Environment variables**

Add:
- `VITE_OPENAI_API_KEY` = your key

### Step 7: Set Up Redirects (If Needed)

Create `netlify.toml` in project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[env]
  [env.production.environment]
    VITE_OPENAI_API_KEY = ""
```

---

## Option 3: Deploy to GitHub Pages (Free)

Best if you want a project site at `username.github.io/deposit-insight-engine-free`.

### Step 1: Update `vite.config.ts`

Add the base path:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  base: '/deposit-insight-engine-free/',  // Add this line
  plugins: [react(), tsconfigPaths()],
})
```

### Step 2: Enable GitHub Pages

1. Go to your repository → **Settings** → **Pages**
2. Under "Build and deployment":
   - **Source:** Deploy from a branch
   - **Branch:** `main` / `root`
3. Click **"Save"**

### Step 3: Create GitHub Actions Workflow

Create file: `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v3
        with:
          folder: dist
```

### Step 4: Push Changes

```bash
git add .
git commit -m "Configure GitHub Pages deployment"
git push
```

GitHub Actions will automatically build and deploy to `https://username.github.io/deposit-insight-engine-free`

---

## Option 4: Deploy to AWS S3 + CloudFront

For production-grade deployments with custom domains.

### Prerequisites
- AWS account (free tier eligible)
- AWS CLI configured locally

### Step 1: Create S3 Bucket

```bash
# Create bucket (use unique name)
aws s3 mb s3://deposit-insight-engine-prod

# Enable static website hosting
aws s3 website s3://deposit-insight-engine-prod \
  --index-document index.html \
  --error-document index.html
```

### Step 2: Build Locally

```bash
npm install
npm run build
```

### Step 3: Upload to S3

```bash
# Upload dist folder contents
aws s3 sync dist/ s3://deposit-insight-engine-prod \
  --delete \
  --cache-control max-age=31536000
```

### Step 4: Create CloudFront Distribution (Optional - For HTTPS/CDN)

Use AWS Console or:

```bash
aws cloudfront create-distribution \
  --origin-domain-name deposit-insight-engine-prod.s3.amazonaws.com \
  --default-root-object index.html
```

---

## Option 5: Deploy to Firebase Hosting

Another excellent free option for static sites.

### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### Step 2: Initialize Firebase Project

```bash
firebase init hosting
# Choose: 
# - Create new project: "deposit-insight-engine-prod"
# - Public directory: dist
# - Single-page app: Yes (overwrite rules)
# - GitHub Actions: Yes (for auto-deploy)
```

### Step 3: Build and Deploy

```bash
npm run build
firebase deploy
```

Your app will be live at `https://deposit-insight-engine-prod.web.app`

---

## Monitoring & Analytics

### Add Google Analytics (Optional)

1. Create Google Analytics account at https://analytics.google.com
2. Get your Measurement ID
3. Install package:
   ```bash
   npm install react-ga4
   ```
4. In `src/start.ts`:
   ```typescript
   import ReactGA from "react-ga4";
   ReactGA.initialize("G-YOUR_MEASUREMENT_ID");
   ```

### Add Error Tracking

The app includes error reporting. To integrate with a service:

#### Option A: Sentry

```bash
npm install @sentry/react
```

Then update `src/lib/error-reporting.ts`:

```typescript
import * as Sentry from "@sentry/react";

export function reportError(error: unknown, context = {}) {
  Sentry.captureException(error, { tags: context });
}
```

#### Option B: LogRocket

```bash
npm install logrocket
```

Similar integration in error-reporting.ts.

---

## CI/CD Best Practices

### Automated Linting Before Deployment

The included GitHub Actions workflow (`.github/workflows/deploy.yml`) runs:
- `npm run lint` - Check code quality
- `npm run build` - Verify build succeeds
- `npm run test` (if added) - Run tests

Deployment only proceeds if all checks pass.

### Environment-Specific Configs

For different environments, use:

```
.env.development (local)
.env.production (production deployment)
```

Example `.env.production`:
```
VITE_OPENAI_API_KEY=sk-prod-key...
VITE_API_URL=https://api.production.com
```

---

## Domain Configuration

### Using a Custom Domain on Vercel

1. **Add domain:** Project Settings → Domains → Add
2. **Configure DNS** to point to Vercel
3. **Enable HTTPS:** Automatic (provided by Vercel)

### Using a Custom Domain on GitHub Pages

1. Add `CNAME` file in `public/` folder:
   ```
   yourdomain.com
   ```
2. Configure DNS A records to GitHub's IP addresses
3. Push to trigger deployment

---

## Rollback & History

### Vercel
- Deployments tab shows all history
- Click any deployment to view or rollback instantly

### Netlify
- Deployments tab with full history
- One-click rollback to any previous version

### GitHub Pages
- Revert commits in Git history
- Push revert to trigger new deployment

---

## Performance Optimization

### Enable Compression

All major platforms (Vercel, Netlify) auto-enable Gzip/Brotli compression.

### Use CDN

- Vercel: Included (global edge network)
- Netlify: Included (CDN through Fastly)
- AWS: Use CloudFront
- Firebase: Included (global CDN)

### Measure Performance

Add Web Vitals:

```bash
npm install web-vitals
```

In `src/start.ts`:

```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

---

## Troubleshooting

### Build fails with "Cannot find module"

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
npm run build
```

### Routes return 404

Ensure SPA redirect is configured:
- Vercel: Auto-configured ✓
- Netlify: Add `_redirects` file (see section above)
- GitHub Pages: Need `vercel.json`

### Slow deployment builds

- Check node_modules size: `du -sh node_modules`
- Remove unused dependencies: `npm prune`
- Consider using `npm ci` instead of `npm install` in CI

### Environment variables not loading

- Ensure variable starts with `VITE_` prefix
- Restart build after adding new variables
- Check `.env.local` is in `.gitignore` (never commit secrets)

---

## Summary

| Platform | Ease | Cost | Speed | Best For |
|----------|------|------|-------|----------|
| **Vercel** | ⭐⭐⭐⭐⭐ | Free | Fastest | Quick production deployment |
| **Netlify** | ⭐⭐⭐⭐⭐ | Free | Very Fast | Similar to Vercel, good alternative |
| **GitHub Pages** | ⭐⭐⭐ | Free | Fast | Project portfolio/docs |
| **Firebase** | ⭐⭐⭐⭐ | Free tier | Very Fast | Google ecosystem integration |
| **AWS S3** | ⭐⭐ | ~$1/month | Very Fast | Custom domains, high control |

**Recommendation:** Start with **Vercel** for easiest deployment. Upgrade to AWS/CloudFront only if you need extreme scale or custom performance tuning.

---

## Next Steps

1. ✅ Choose a platform (Vercel recommended)
2. ✅ Follow deployment steps above
3. ✅ Test your live deployment
4. ✅ Configure custom domain (optional)
5. ✅ Set up monitoring/analytics (optional)
6. ✅ Enable auto-deployments from GitHub

**Need help?** Check platform-specific docs:
- Vercel: https://vercel.com/docs
- Netlify: https://docs.netlify.com
- GitHub Pages: https://pages.github.com
- Firebase: https://firebase.google.com/docs/hosting
