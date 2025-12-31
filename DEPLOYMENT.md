# Deployment Guide

This guide covers deploying the Task Management application to CapRover and setting up Azure DevOps.

## Table of Contents

1. [CapRover Deployment](#caprover-deployment)
2. [Environment Variables](#environment-variables)
3. [Troubleshooting](#troubleshooting)

---

## CapRover Deployment

CapRover is a self-hosted PaaS that makes it easy to deploy applications using Docker.

### Prerequisites

- CapRover instance running and accessible
- Domain name configured with CapRover
- Git repository with your code (GitHub, GitLab, or Bitbucket)

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

   **For GitHub/Bitbucket/GitLab:**
   - Select "Method 2: Deploy from GitHub/Bitbucket/GitLab"
   - Click "Connect Repository"
   - Authenticate with your Git provider
   - Select your repository
   - Choose branch: `main` (or your default branch)
   - Click "Connect"
   
   **See [GITHUB_DEPLOYMENT.md](./GITHUB_DEPLOYMENT.md) for detailed GitHub setup guide.**

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
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Docker Documentation](https://docs.docker.com/)

---

## Support

For deployment issues, check:
1. Application logs in CapRover
2. Build logs in CapRover deployment tab
3. Container logs: `docker logs <container-id>`

If problems persist, review the application's local setup documentation and ensure all prerequisites are met.

