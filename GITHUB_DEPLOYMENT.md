# Deploy to CapRover via GitHub (Simplest Solution)

Using GitHub is the **easiest** way to deploy to CapRover because CapRover has native GitHub support!

## Option 1: Use GitHub as Your Primary Repository

If you want to switch from Azure DevOps to GitHub:

### Step 1: Create GitHub Repository

1. Go to https://github.com
2. Click "New repository"
3. Name: `task-management-system`
4. Set visibility (Public/Private)
5. **Don't** initialize with README (since you already have code)
6. Click "Create repository"

### Step 2: Push Code to GitHub

```bash
# Add GitHub remote
git remote add github https://github.com/your-username/task-management-system.git

# Push to GitHub
git push -u github main

# Or if you want GitHub as your primary:
git remote set-url origin https://github.com/your-username/task-management-system.git
git push -u origin main
```

### Step 3: Connect GitHub to CapRover

1. **In CapRover Dashboard:**
   - Go to your app
   - Click **"Deployment"** tab
   - Select **"Method 2: Deploy from GitHub/Bitbucket/GitLab"**
   - Click **"Connect Repository"**

2. **Authenticate with GitHub:**
   - Click **"Connect to GitHub"**
   - Authorize CapRover to access your repositories
   - Select your repository: `your-username/task-management-system`
   - Select branch: `main`
   - Click **"Connect"**

3. **That's it!** CapRover will automatically deploy from GitHub.

---

## Option 2: Mirror Azure DevOps to GitHub

Keep using Azure DevOps but automatically sync to GitHub for CapRover deployment.

### Step 1: Create GitHub Repository

Same as Option 1, Step 1.

### Step 2: Set Up GitHub Actions to Sync

Create `.github/workflows/sync-from-azure.yml`:

```yaml
name: Sync from Azure DevOps

on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes
  workflow_dispatch:  # Manual trigger
  push:
    branches:
      - main

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout GitHub
        uses: actions/checkout@v3
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Configure Git
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
      
      - name: Sync from Azure DevOps
        env:
          AZURE_DEVOPS_PAT: ${{ secrets.AZURE_DEVOPS_PAT }}
        run: |
          git remote add azure https://$AZURE_DEVOPS_PAT@dev.azure.com/TechMorpho/Task-Managemnet-System/_git/Task-Managemnet-System || true
          git fetch azure
          git merge azure/main --allow-unrelated-histories || true
          git push origin main
```

### Step 3: Add Secrets to GitHub

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Add secret: `AZURE_DEVOPS_PAT` with your Azure DevOps PAT

### Step 4: Connect GitHub to CapRover

Same as Option 1, Step 3.

**Benefits:**
- ✅ Keep using Azure DevOps for CI/CD
- ✅ GitHub automatically syncs
- ✅ CapRover deploys from GitHub
- ✅ Best of both worlds!

---

## Option 3: Push to Both Repositories

Manually push to both Azure DevOps and GitHub:

```bash
# Add both remotes
git remote add github https://github.com/your-username/task-management-system.git
git remote add azure https://dev.azure.com/TechMorpho/Task-Managemnet-System/_git/Task-Managemnet-System

# Push to both
git push github main
git push azure main
```

Or create an alias:

```bash
# Add alias
git config alias.pushall '!git push github main && git push azure main'

# Use it
git pushall
```

---

## Comparison: GitHub vs Docker Registry Method

| Feature | GitHub (Method 2) | Docker Registry (Method 3) |
|---------|-------------------|---------------------------|
| **Setup Complexity** | ⭐ Easy | ⭐⭐ Medium |
| **Native Support** | ✅ Yes | ✅ Yes |
| **Automatic Deploy** | ✅ Yes | ✅ Yes |
| **Build in CapRover** | ✅ Yes | ❌ No (built in pipeline) |
| **Requires Docker Hub** | ❌ No | ✅ Yes |
| **Best For** | Direct git deployment | Pre-built images |

**Recommendation:** Use GitHub (Method 2) - it's simpler!

---

## Quick Start: GitHub Method

1. **Create GitHub repo**
2. **Push code:** `git push github main`
3. **In CapRover:** Method 2 → Connect GitHub → Select repo → Connect
4. **Done!** Automatic deployments on every push

---

## Troubleshooting

**GitHub connection fails:**
- Verify repository is accessible
- Check GitHub authentication in CapRover
- Ensure repository is not archived

**Sync not working:**
- Check GitHub Actions logs
- Verify Azure DevOps PAT is correct
- Check cron schedule is running

