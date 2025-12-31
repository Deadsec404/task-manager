# Deployment Guide

This guide covers deploying the Task Management application to CapRover and setting up Azure DevOps.

## Table of Contents

1. [CapRover Deployment](#caprover-deployment)
2. [Azure DevOps Setup](#azure-devops-setup)
3. [Environment Variables](#environment-variables)
4. [Troubleshooting](#troubleshooting)

---

## CapRover Deployment

CapRover is a self-hosted PaaS that makes it easy to deploy applications using Docker.

### Prerequisites

- CapRover instance running and accessible
- Domain name configured with CapRover
- Git repository with your code (GitHub, GitLab, Bitbucket, or Azure DevOps)

### Step 1: Prepare Your Repository

Make sure your repository contains:
- ✅ `Dockerfile` (already created)
- ✅ `captain-definition` (already created)
- ✅ All source code

### Step 2: Connect Repository to CapRover

1. **Login to CapRover Dashboard**
   - Navigate to your CapRover instance (e.g., `https://captain.yourdomain.com`)
   - Login with your credentials

2. **Create a New App**
   - Click on "Apps" in the left sidebar
   - Click "One-Click Apps/Databases" or "New App"
   - Enter app name: `task-management` (or your preferred name)
   - Click "Create New App"

3. **Connect Your Repository**

   **⚠️ IMPORTANT: Azure DevOps Limitation**
   
   CapRover's Method 1 doesn't support Azure DevOps directly (it will show error: "Missing required Github/BitBucket/Gitlab field"). 
   
   **Recommended Solution: Use Docker Registry (Method 3)**
   
   1. **Build and push Docker image from Azure DevOps:**
      - Update your `azure-pipelines.yml` to build and push Docker image
      - Push to Azure Container Registry (ACR) or Docker Hub
      - See [CAPROVER_AZURE_DEVOPS_SOLUTION.md](./CAPROVER_AZURE_DEVOPS_SOLUTION.md) for detailed setup
   
   2. **In CapRover, use Method 3:**
      - Go to "Deployment" tab
      - Select "Method 3: Deploy using a Docker image from a registry"
      - Enter your Docker image URL (e.g., `youracr.azurecr.io/task-management:latest`)
      - Add registry credentials
      - Click "Save & Update"
   
   **Alternative Solutions:**
   - Use CapRover CLI for manual deployments
   - Set up GitHub mirror and use Method 2
   - See [CAPROVER_AZURE_DEVOPS_SOLUTION.md](./CAPROVER_AZURE_DEVOPS_SOLUTION.md) for all options
   
   **For GitHub/Bitbucket/GitLab (Alternative):**
   - Select "Method 2: Deploy from GitHub/Bitbucket/GitLab"
   - Click "Connect Repository"
   - Authenticate with your Git provider
   - Select your repository
   - Choose branch: `main` (or your default branch)
   - Click "Connect"

### Step 3: Configure Environment Variables

1. In your CapRover app settings, go to "App Configs" tab
2. Scroll down to "Environment Variables (Optional)"
3. Add the following environment variables:

```env
NODE_ENV=production
PORT=80
DATABASE_URL=file:./data/production.db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars-long
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-app-name.captain.yourdomain.com
```

**Important Notes:**
- Replace `JWT_SECRET` with a strong, random secret (at least 32 characters)
- Replace `FRONTEND_URL` with your actual CapRover app URL
- For PostgreSQL instead of SQLite, use: `DATABASE_URL=postgresql://user:password@host:5432/dbname`

### Step 4: Enable SSL (Recommended)

1. In your app settings, go to "HTTP Settings" tab
2. Enable "HTTPS" and "Force HTTPS by Redirect"
3. CapRover will automatically provision SSL certificates via Let's Encrypt

### Step 5: Deploy

1. After connecting the repository, CapRover will automatically build and deploy
2. You can trigger a new deployment by:
   - Pushing to your connected branch
   - Clicking "Trigger Build" in the CapRover dashboard
3. Monitor the build logs in the "Deployment" tab

### Step 6: Initialize Database (First Deployment Only)

After the first successful deployment, you need to initialize the database:

1. Go to your app in CapRover dashboard
2. Click "One-Click Apps/Databases" or find "Terminal" option
3. Run the following commands:

```bash
# Generate Prisma client (if needed)
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed the database (optional - creates admin user)
npm run seed
```

**Alternative: Using CapRover Terminal**

1. In CapRover app, click on "Terminal" or "HTTP Settings" > "Enable Terminal"
2. Connect to the container terminal
3. Run the commands above

### Step 7: Access Your Application

Once deployed, access your application at:
- `https://your-app-name.captain.yourdomain.com`

---

## Azure DevOps Setup

Azure DevOps provides CI/CD pipelines, source control, and project management.

### Step 1: Create Azure DevOps Project

1. **Go to Azure DevOps**
   - Navigate to [https://dev.azure.com](https://dev.azure.com)
   - Login with your Microsoft account

2. **Create Organization (if needed)**
   - If you don't have an organization, create one
   - Choose a name and region

3. **Create New Project**
   - Click "New Project"
   - Enter project name: `Task-Management`
   - Choose visibility (Private or Public)
   - Select Version control: Git
   - Select Work item process: Basic (or your preference)
   - Click "Create"

### Step 2: Push Your Code to Azure DevOps

#### Option A: Import Existing Repository

1. In your Azure DevOps project, go to "Repos" > "Files"
2. Click "Import"
3. Enter your repository URL (GitHub, GitLab, etc.)
4. Click "Import"

#### Option B: Push Using Git (Recommended)

1. **Get Repository URL**
   - In Azure DevOps project, go to "Repos" > "Files"
   - Click "Clone" and copy the repository URL

2. **Initialize Git and Push (if not already a git repo)**
   ```bash
   git init
   git remote add origin <your-azure-devops-repo-url>
   git add .
   git commit -m "Initial commit"
   git push -u origin main
   ```

3. **Or if already a git repo**
   ```bash
   git remote set-url origin <your-azure-devops-repo-url>
   git push -u origin main
   ```

### Step 3: Create Pipeline

1. **Navigate to Pipelines**
   - In your Azure DevOps project, click "Pipelines" > "Pipelines"

2. **Create New Pipeline**
   - Click "Create Pipeline"
   - Select "Azure Repos Git" (or your source)
   - Select your repository
   - Choose "Existing Azure Pipelines YAML file"
   - Select branch: `main`
   - Select path: `/azure-pipelines.yml`
   - Click "Continue" and then "Run"

3. **Configure Pipeline Variables (Optional)**
   - In Pipeline settings, go to "Variables"
   - Add any sensitive variables (e.g., `JWT_SECRET`)
   - Mark them as "Secret" if sensitive

### Step 4: Customize Pipeline

The `azure-pipelines.yml` file is already configured for:
- ✅ Building frontend
- ✅ Building backend
- ✅ Running lint checks
- ✅ Building Docker image (commented out - enable after configuring Docker registry)

**To Enable Docker Build:**
1. Create a Docker registry service connection:
   - Go to "Project Settings" > "Service connections"
   - Create new connection for Docker Hub or Azure Container Registry
2. Update `azure-pipelines.yml`:
   - Change `containerRegistry` to your service connection name
   - Change `repository` to your Docker repository name
   - Set `condition: true` for the Docker stage

### Step 5: Configure Branch Policies (Optional)

1. Go to "Repos" > "Branches"
2. Click on `main` branch > "Branch policies"
3. Enable "Require a minimum number of reviewers"
4. Enable "Build validation" and select your pipeline

---

## Environment Variables

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `80` (CapRover) or `3001` (local) |
| `DATABASE_URL` | Database connection string | `file:./data/production.db` (SQLite) or `postgresql://...` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-secret-key-min-32-chars` |
| `JWT_EXPIRES_IN` | JWT token expiration | `7d` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://your-app.captain.yourdomain.com` |

### Generating a Secure JWT Secret

Use one of these methods to generate a secure JWT secret:

**Using Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Using OpenSSL:**
```bash
openssl rand -hex 32
```

**Online Generator:**
- Visit: https://generate-secret.vercel.app/32

---

## Database Setup

### Using SQLite (Default)

The Dockerfile is configured to use SQLite by default. The database file will be stored in `/app/data/production.db` inside the container.

**Note:** SQLite data will be lost if the container is recreated unless you use a persistent volume.

### Using PostgreSQL (Recommended for Production)

PostgreSQL is recommended for production deployments as it provides better performance, reliability, and data persistence.

**📘 For detailed PostgreSQL setup instructions, see [POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md)**

**Quick Steps:**

1. **Install PostgreSQL in CapRover:**
   - Go to CapRover dashboard → "One-Click Apps/Databases"
   - Search and install "PostgreSQL"
   - Set a strong password (save it securely!)
   - Note the app name (usually `postgres`)

2. **Update Prisma Schema:**
   - Option A: Use the PostgreSQL schema file:
     ```bash
     cp server/prisma/schema.postgresql.prisma server/prisma/schema.prisma
     ```
   - Option B: Manually change `provider = "sqlite"` to `provider = "postgresql"` in `server/prisma/schema.prisma`

3. **Update Environment Variables in your app:**
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@postgres.captain.yourdomain.com:5432/postgres
   ```
   For internal CapRover networking (recommended when both apps are on CapRover), use:
   ```env
   DATABASE_URL=postgresql://postgres:PASSWORD@srv-captain--postgres:5432/postgres
   ```
   
   **Example with actual PostgreSQL URL:**
   ```env
   DATABASE_URL=postgresql://postgres:f0b3b4d8d29e8666@srv-captain--postgres:5432/postgres
   ```

4. **Deploy and Initialize:**
   - Commit schema changes and push to repository
   - CapRover will rebuild automatically
   - After deployment, run in container terminal:
     ```bash
     npx prisma generate
     npx prisma migrate deploy
     npm run seed
     ```

**See [POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md) for complete step-by-step guide with troubleshooting.**

---

## Troubleshooting

### CapRover Issues

**Build Fails:**
- Check build logs in CapRover dashboard
- Verify all files are committed to repository
- Ensure Dockerfile syntax is correct

**App Not Starting:**
- Check app logs: CapRover dashboard > Your App > App Logs
- Verify environment variables are set correctly
- Check if port is correctly set to `80`

**Database Connection Errors:**
- Verify `DATABASE_URL` is correct
- For SQLite: Check if `/app/data` directory has write permissions
- For PostgreSQL: Verify database is accessible from app container

**CORS Errors:**
- Verify `FRONTEND_URL` matches your actual app URL
- Check that URL doesn't have trailing slash

### Azure DevOps Issues

**Pipeline Fails:**
- Check pipeline logs for specific error
- Verify `azure-pipelines.yml` syntax
- Ensure Node.js version is available

**Build Artifacts Not Found:**
- Verify build steps completed successfully
- Check artifact publish paths

**Docker Build Fails:**
- Verify Docker registry service connection
- Check Dockerfile path is correct
- Ensure repository name is correct

### General Issues

**Cannot Access Application:**
- Verify app is running (check logs)
- Check firewall/network settings
- Verify domain DNS is configured correctly

**Database Migrations Fail:**
- Ensure database is accessible
- Check `DATABASE_URL` format
- Verify Prisma schema is correct

**Environment Variables Not Working:**
- Restart the app after changing environment variables
- Verify variable names match exactly (case-sensitive)
- Check for typos in variable values

---

## Additional Resources

- [CapRover Documentation](https://caprover.com/docs/)
- [Azure DevOps Documentation](https://docs.microsoft.com/en-us/azure/devops/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Docker Documentation](https://docs.docker.com/)

---

## Support

For deployment issues, check:
1. Application logs in CapRover
2. Build logs in Azure DevOps
3. Container logs: `docker logs <container-id>`

If problems persist, review the application's local setup documentation and ensure all prerequisites are met.

