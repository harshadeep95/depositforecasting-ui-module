# GitHub Repository Setup Guide

Complete instructions for setting up your GitHub repository for the Deposit Insight Engine Free project.

## Prerequisites

- GitHub account (free at https://github.com/join)
- Git installed locally
- Project folder: `Deposit-Insight-Engine-Free`

## Step 1: Create GitHub Repository

### Option A: Using GitHub Web Interface (Easiest)

1. Go to https://github.com/new
2. Fill in the form:
   - **Repository name:** `deposit-insight-engine-free`
   - **Description:** `Interactive retail deposit forecasting application - Free, open-source version`
   - **Visibility:** Public (recommended for open-source)
   - **Initialize repository:** Leave unchecked (you have files already)
3. Click **"Create repository"**

### Option B: Using GitHub CLI

```bash
# Install GitHub CLI if needed: https://cli.github.com
gh repo create deposit-insight-engine-free \
  --public \
  --description "Interactive retail deposit forecasting application - Free, open-source version" \
  --remote=origin \
  --source=. \
  --remote-name=origin
```

---

## Step 2: Initialize Local Git Repository

Open PowerShell in your project folder:

```bash
cd "c:\Users\hnimmagadda\Downloads\UI-Module\Deposit-Insight-Engine-Free"

# Initialize Git
git init

# Verify .gitignore exists (already in place)
cat .gitignore
```

---

## Step 3: Configure Git

First time only, configure your Git identity:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Verify configuration
git config --global user.name
git config --global user.email
```

---

## Step 4: Add Remote Repository

Replace `YOUR_USERNAME` with your actual GitHub username:

```bash
git remote add origin https://github.com/YOUR_USERNAME/deposit-insight-engine-free.git

# Verify remote is set
git remote -v
# Should output:
# origin  https://github.com/YOUR_USERNAME/deposit-insight-engine-free.git (fetch)
# origin  https://github.com/YOUR_USERNAME/deposit-insight-engine-free.git (push)
```

---

## Step 5: Create Initial Commit

```bash
# Stage all files
git add .

# Verify what will be committed
git status

# Create initial commit
git commit -m "Initial commit: Deposit Insight Engine Free - Open source deposit forecasting tool"
```

---

## Step 6: Rename Branch to Main (if needed)

GitHub uses `main` as default, but older Git might use `master`:

```bash
# Check current branch
git branch

# Rename to main if needed
git branch -M main
```

---

## Step 7: Push to GitHub

First push (sets up tracking):

```bash
git push -u origin main
```

Verify in browser: https://github.com/YOUR_USERNAME/deposit-insight-engine-free

---

## Step 8: Add GitHub Topics (Optional but Recommended)

On your repository page:
1. Click **"Add topics"** on the right sidebar
2. Add relevant tags:
   - `deposit-forecasting`
   - `finance`
   - `react`
   - `typescript`
   - `open-source`
   - `finance-app`

This helps users discover your project.

---

## Step 9: Create README Badges (Optional)

Add to top of your README.md to show project status:

```markdown
# Deposit Insight Engine - Free Edition

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)
[![Build Status](https://img.shields.io/github/actions/workflow/status/YOUR_USERNAME/deposit-insight-engine-free/deploy.yml?branch=main)](https://github.com/YOUR_USERNAME/deposit-insight-engine-free/actions)
[![React Version](https://img.shields.io/badge/react-19.2-61dafb)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6)](https://www.typescriptlang.org)
```

---

## Step 10: Set Up GitHub Actions Workflows

GitHub Actions provides free CI/CD. Workflows are included in `.github/workflows/`.

### Check Existing Workflows

```bash
ls .github/workflows/
# Should show:
# - deploy.yml
# - lint.yml (optional)
```

### Enable GitHub Actions

1. Go to your repository → **Actions** tab
2. Click **"I understand my workflows, go ahead and enable them"**
3. Next push will trigger workflows automatically

---

## Step 11: Protect Main Branch (Recommended)

Prevent accidental commits to main:

1. Go to repository → **Settings**
2. Navigate to **Branches** (left sidebar)
3. Click **"Add rule"** under "Branch protection rules"
4. Fill in:
   - **Branch name pattern:** `main`
   - ✅ **Require pull request reviews before merging** (set to 1)
   - ✅ **Require status checks to pass before merging**
   - ✅ **Require branches to be up to date before merging**
5. Click **"Create"**

Now all changes go through Pull Requests → Reviews → Auto-merge.

---

## Step 12: Enable Discussions (Optional)

1. Go to **Settings** → **General**
2. Under "Features", check ✅ **Discussions**
3. This allows users to ask questions and share ideas

---

## Step 13: Create Issue Templates (Optional)

Create `.github/ISSUE_TEMPLATE/` folder with templates:

### `.github/ISSUE_TEMPLATE/bug_report.md`

```markdown
---
name: Bug report
about: Report a problem with the application
labels: bug
---

## Description
Brief description of the bug.

## Steps to Reproduce
1. Step 1
2. Step 2
3. ...

## Expected Behavior
What should happen?

## Actual Behavior
What actually happens?

## Environment
- OS: (Windows/Mac/Linux)
- Browser: (Chrome/Firefox/Safari)
- Node version: (run `node --version`)

## Screenshots
If applicable, add screenshots.
```

### `.github/ISSUE_TEMPLATE/feature_request.md`

```markdown
---
name: Feature request
about: Suggest a new feature
labels: enhancement
---

## Description
What feature would you like?

## Problem It Solves
What problem does this solve?

## Proposed Solution
How could it work?

## Alternatives
Other approaches you've considered.
```

---

## Step 14: Create Pull Request Template (Optional)

Create `.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix (fixes #ISSUE_NUMBER)
- [ ] New feature (relates to #ISSUE_NUMBER)
- [ ] Breaking change
- [ ] Documentation update

## Testing
How did you test this?

## Checklist
- [ ] Code follows project style
- [ ] Self-review completed
- [ ] Linter passes: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] Changes documented

## Screenshots
If applicable, add screenshots.
```

---

## Step 15: Create LICENSE File (Recommended)

MIT License is included with open-source projects. Create `LICENSE`:

```
MIT License

Copyright (c) 2026 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

Add to repository:

```bash
# Already in project, but commit if not
git add LICENSE
git commit -m "Add MIT License"
git push
```

---

## Step 16: Create CONTRIBUTING.md (Optional)

Guide for contributors:

```markdown
# Contributing to Deposit Insight Engine Free

We love your input! Here's how to contribute:

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/deposit-insight-engine-free.git`
3. Create a branch: `git checkout -b feature/amazing-feature`

## Development

```bash
npm install
npm run dev
# Make your changes
npm run lint
npm run build
```

## Submitting Changes

1. Commit: `git commit -m "Add amazing feature"`
2. Push: `git push origin feature/amazing-feature`
3. Open Pull Request on GitHub

## Code Style

- Use TypeScript
- Follow ESLint rules: `npm run lint`
- Format with Prettier: `npm run format`

## Questions?

Open an issue or discussion!
```

---

## Step 17: Set Up GitHub Pages Deployment (Optional)

If using GitHub Pages for deployment:

1. Go to repository → **Settings** → **Pages**
2. Under "Build and deployment":
   - **Source:** GitHub Actions
   - Leave as-is (workflow handles it)

---

## Daily Workflow: Pushing Changes

After making changes locally:

```bash
# Check status
git status

# Stage changes
git add .
git add -A  # Stage all including deletions

# Commit with message
git commit -m "Description of changes"

# Push to GitHub
git push origin main
```

---

## Common Git Commands

| Command | Purpose |
|---------|---------|
| `git status` | See which files changed |
| `git add .` | Stage all changes |
| `git commit -m "msg"` | Create commit with message |
| `git push` | Upload to GitHub |
| `git pull` | Download latest from GitHub |
| `git log` | View commit history |
| `git diff` | See line-by-line changes |
| `git branch -a` | List all branches |
| `git checkout -b feature/name` | Create new branch |
| `git merge feature/name` | Merge branch into main |

---

## Branching Strategy

### Feature Branches

For new features:

```bash
# Create feature branch
git checkout -b feature/new-forecasting-model

# Make changes
git add .
git commit -m "Add machine learning forecasting model"

# Push to GitHub
git push origin feature/new-forecasting-model

# On GitHub: Create Pull Request
```

### Bug Fix Branches

```bash
git checkout -b bugfix/fix-quarterly-calculations

# Fix the bug
git add .
git commit -m "Fix quarterly panel calculation error"

git push origin bugfix/fix-quarterly-calculations
```

### Hotfix Branches

For urgent production fixes:

```bash
git checkout -b hotfix/critical-data-loss

# Fix immediately
git add .
git commit -m "Critical: Prevent data loss on scenario delete"

git push origin hotfix/critical-data-loss
```

---

## Secrets & Environment Variables

**NEVER commit secrets!** Ensure `.env.local` and `.env*.local` are in `.gitignore`:

```bash
# .gitignore (already configured, verify it includes:)
cat .gitignore | grep env
# Should show:
# .env
# .env.local
# .env.*.local
```

For deployment secrets:
- GitHub Actions: Use **Settings** → **Secrets and variables** → **Actions**
- Vercel: Use **Project Settings** → **Environment Variables**
- Netlify: Use **Site settings** → **Build & deploy** → **Environment**

---

## Viewing Your Repository

After pushing, visit:

```
https://github.com/YOUR_USERNAME/deposit-insight-engine-free
```

You'll see:
- ✅ All your files
- ✅ Commit history
- ✅ Active workflows (if configured)
- ✅ Issues and Pull Requests tabs
- ✅ Releases and tags

---

## Automated Workflows

Once set up, your repository includes:

### 1. Deploy Workflow (`.github/workflows/deploy.yml`)
Triggered on push to `main`:
- ✅ Installs dependencies
- ✅ Runs linter
- ✅ Builds project
- ✅ Deploys to Vercel/Netlify (if configured)

### 2. Lint Workflow (Optional)
Runs ESLint on every PR to enforce code quality.

### 3. Build Workflow (Optional)
Verifies builds succeed before merging PRs.

---

## Troubleshooting

### "Repository not found"

```bash
# Verify correct GitHub username
git remote -v

# Update if wrong
git remote set-url origin https://github.com/CORRECT_USERNAME/deposit-insight-engine-free.git
```

### "Permission denied (publickey)"

You need to set up SSH keys:

```bash
# Generate SSH key (press Enter for prompts)
ssh-keygen -t ed25519 -C "your.email@example.com"

# Add to GitHub: https://github.com/settings/keys
# Copy key:
cat ~/.ssh/id_ed25519.pub

# Change remote to SSH
git remote set-url origin git@github.com:YOUR_USERNAME/deposit-insight-engine-free.git
```

### "Failed to push some refs"

Your local branch is behind remote:

```bash
# Pull latest changes first
git pull origin main

# Resolve any conflicts manually

# Then push
git push origin main
```

### "Refusing to merge unrelated histories"

When setting up existing project:

```bash
git pull origin main --allow-unrelated-histories

# Or during initial push if different histories:
git push -u origin main --force-with-lease
```

---

## Next Steps

After setting up GitHub:

1. ✅ **Verify repository is public** (Settings → General → Visibility)
2. ✅ **Test your GitHub Actions workflows** (Actions tab)
3. ✅ **Set up branch protection** (Settings → Branches)
4. ✅ **Deploy to Vercel/Netlify** (see DEPLOYMENT.md)
5. ✅ **Add project to your portfolio** (link GitHub repo)

---

## Summary

Your repository now has:
- ✅ Version control with Git
- ✅ Cloud backup on GitHub
- ✅ Automated testing via GitHub Actions
- ✅ Proper `.gitignore` to protect secrets
- ✅ README and documentation
- ✅ Ready for collaboration
- ✅ Ready for automated deployment

**You're all set!** 🚀
