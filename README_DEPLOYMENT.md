# Deployment Instructions

This project can be deployed to **CapRover** and integrated with **Azure DevOps** for CI/CD.

## 📋 Quick Links

- **Detailed Guide:** [DEPLOYMENT.md](./DEPLOYMENT.md) - Complete step-by-step instructions
- **Quick Start:** [DEPLOYMENT_QUICK_START.md](./DEPLOYMENT_QUICK_START.md) - 5-minute deployment guide
- **PostgreSQL Setup:** [POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md) - Complete PostgreSQL setup guide for CapRover

## 🚀 CapRover Deployment

CapRover is a self-hosted PaaS platform that makes deployment easy.

### Files Required (Already Created ✅)
- `Dockerfile` - Multi-stage build configuration
- `captain-definition` - CapRover deployment configuration
- `.dockerignore` - Files to exclude from Docker build

### Quick Steps:
1. Push code to Git repository (GitHub/GitLab/Bitbucket)
2. In CapRover dashboard, create new app
3. Connect repository via "Deployment" tab
4. Set environment variables (see DEPLOYMENT.md)
5. Enable HTTPS
6. Initialize database after first deployment

**Full instructions:** See [DEPLOYMENT.md](./DEPLOYMENT.md#caprover-deployment)

## 🔄 Azure DevOps Integration

Azure DevOps provides CI/CD pipelines and source control.

### Files Required (Already Created ✅)
- `azure-pipelines.yml` - CI/CD pipeline configuration

### Quick Steps:
1. Create Azure DevOps project
2. Push code to Azure DevOps repository
3. Create pipeline using `azure-pipelines.yml`
4. (Optional) Configure Docker registry for container builds

**Full instructions:** See [DEPLOYMENT.md](./DEPLOYMENT.md#azure-devops-setup)

## 📝 Key Configuration

### Environment Variables for CapRover:

```env
NODE_ENV=production
PORT=80
DATABASE_URL=file:./data/production.db
JWT_SECRET=<generate-secure-secret>
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-app.captain.yourdomain.com
```

### Generate JWT Secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🗄️ Database Options

- **SQLite (Default):** Simple, file-based database - good for testing
- **PostgreSQL (Recommended for Production):** Production-grade database with better performance and reliability

**📘 PostgreSQL Setup:** See [POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md) for complete PostgreSQL setup guide in CapRover.

**Quick Summary:**
1. Install PostgreSQL one-click app in CapRover
2. Update Prisma schema to use PostgreSQL provider
3. Set `DATABASE_URL` environment variable
4. Run migrations after deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md#database-setup) for details.

## 🆘 Need Help?

Check the troubleshooting section in [DEPLOYMENT.md](./DEPLOYMENT.md#troubleshooting)

