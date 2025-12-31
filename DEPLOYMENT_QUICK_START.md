# Quick Deployment Guide

## CapRover Deployment (5 Minutes)

### Step 1: Prepare Repository
- ✅ Ensure `Dockerfile` and `captain-definition` are in repository root
- ✅ Commit and push all changes

### Step 2: Deploy in CapRover
1. Login to CapRover dashboard
2. Create new app (e.g., `task-management`)
3. Go to **Deployment** tab → **Method 1: Deploy from a GitHub/Bitbucket/GitLab repository or a self-hosted git server**
4. For Azure DevOps, enter repository URL with PAT:
   ```
   https://[PAT]@dev.azure.com/TechMorpho/Task-Managemnet-System/_git/Task-Managemnet-System
   ```
   (Replace `[PAT]` with your Personal Access Token)
5. Select branch (usually `main`)
6. Click **Connect**

**To create a PAT:** Azure DevOps → Profile → Personal access tokens → New Token (scope: Code Read)

### Step 3: Set Environment Variables
Go to **App Configs** tab → **Environment Variables**:

**Option A: SQLite (Simple, for testing)**
```env
NODE_ENV=production
PORT=80
DATABASE_URL=file:./data/production.db
JWT_SECRET=<generate-secure-32-char-secret>
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://task-management.captain.yourdomain.com
```

**Option B: PostgreSQL (Recommended for production)**
1. First install PostgreSQL: CapRover → One-Click Apps → PostgreSQL
2. Then set:
```env
NODE_ENV=production
PORT=80
DATABASE_URL=postgresql://postgres:PASSWORD@srv-captain--postgres:5432/postgres
JWT_SECRET=<generate-secure-32-char-secret>
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://task-management.captain.yourdomain.com
```

**Example with your actual PostgreSQL URL:**
```env
DATABASE_URL=postgresql://postgres:f0b3b4d8d29e8666@srv-captain--postgres:5432/postgres
```

See [POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md) for detailed PostgreSQL setup.

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Enable HTTPS
- Go to **HTTP Settings** tab
- Enable **HTTPS** and **Force HTTPS by Redirect**

### Step 5: Initialize Database
After first deployment, use CapRover Terminal or SSH:

**For SQLite:**
```bash
npx prisma migrate deploy
npm run seed
```

**For PostgreSQL:**
```bash
npx prisma generate
npx prisma migrate deploy
npm run seed
```

**Note:** If using PostgreSQL, make sure to update `server/prisma/schema.prisma` to use `provider = "postgresql"` first. See [POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md) for details.

### Step 6: Access Your App
Visit: `https://task-management.captain.yourdomain.com`

---

## Azure DevOps Setup (10 Minutes)

### Step 1: Create Project
1. Go to https://dev.azure.com
2. Create new organization (if needed)
3. Create new project: `Task-Management`

### Step 2: Push Code
```bash
# If not a git repo
git init
git remote add origin <azure-devops-repo-url>
git add .
git commit -m "Initial commit"
git push -u origin main

# If already a git repo
git remote set-url origin <azure-devops-repo-url>
git push -u origin main
```

### Step 3: Create Pipeline
1. Go to **Pipelines** → **Pipelines**
2. Click **Create Pipeline**
3. Select **Azure Repos Git**
4. Select your repository
5. Choose **Existing Azure Pipelines YAML file**
6. Path: `/azure-pipelines.yml`
7. Click **Run**

### Step 4: (Optional) Configure Docker Registry
1. Go to **Project Settings** → **Service connections**
2. Create Docker Hub or Azure Container Registry connection
3. Update `azure-pipelines.yml`:
   - Set `containerRegistry` name
   - Set `repository` name
   - Change Docker stage `condition: true`

---

## Quick Troubleshooting

**Build fails in CapRover:**
- Check build logs
- Verify Dockerfile exists
- Ensure all files are committed

**App won't start:**
- Check app logs in CapRover
- Verify environment variables
- Check port is set to `80`

**Database errors:**
- Run migrations: `npx prisma migrate deploy`
- Check DATABASE_URL format
- Verify database is accessible

**CORS errors:**
- Verify FRONTEND_URL matches app URL exactly (no trailing slash)

---

For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)


