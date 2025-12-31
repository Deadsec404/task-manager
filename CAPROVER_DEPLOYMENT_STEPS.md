# CapRover Deployment Steps - Azure DevOps

## Quick Deployment Guide

### Step 1: Get Your Repository URL with PAT

Your Azure DevOps repository URL format:
```
https://[YOUR_PAT]@dev.azure.com/TechMorpho/Task-Managemnet-System/_git/Task-Managemnet-System
```

**Replace `[YOUR_PAT]` with your actual Personal Access Token**

### Step 2: Configure in CapRover

1. **Login to CapRover Dashboard**
   - Go to: `https://captain.yourdomain.com` (or your CapRover URL)

2. **Create/Select Your App**
   - Click "Apps" in left sidebar
   - Create new app: `task-management` (or select existing)

3. **Go to Deployment Tab**
   - Click on your app
   - Click "Deployment" tab at the top

4. **Configure Repository Connection**

   ⚠️ **IMPORTANT:** CapRover Method 1 doesn't support Azure DevOps directly. Use one of these alternatives:

   **Option A: Use Docker Registry (Recommended)**
   - Select: **"Method 3: Deploy using a Docker image from a registry"**
   - Build and push Docker image from Azure DevOps pipeline to a registry (Azure Container Registry or Docker Hub)
   - Enter image URL: `yourregistry.azurecr.io/task-management:latest`
   - Add registry credentials
   - See [CAPROVER_AZURE_DEVOPS_SOLUTION.md](./CAPROVER_AZURE_DEVOPS_SOLUTION.md) for details

   **Option B: Manual Deployment**
   - Build Docker image locally or via pipeline
   - Use CapRover CLI to deploy
   - Or use webhook deployment if available

   See [CAPROVER_AZURE_DEVOPS_SOLUTION.md](./CAPROVER_AZURE_DEVOPS_SOLUTION.md) for complete solutions.

5. **Monitor Deployment**
   - CapRover will automatically fetch and build your code
   - Watch the build logs in the "Deployment" tab
   - Check "App Logs" for any errors

### Step 3: Set Environment Variables

After deployment is configured, go to **"App Configs"** tab → **"Environment Variables"**:

```env
NODE_ENV=production
PORT=80
DATABASE_URL=postgresql://postgres:f0b3b4d8d29e8666@srv-captain--postgres:5432/postgres
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars-long
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://task-management.captain.yourdomain.com
```

Click **"Save & Update"**

### Step 4: Enable HTTPS

1. Go to **"HTTP Settings"** tab
2. Enable **"HTTPS"**
3. Enable **"Force HTTPS by Redirect"**
4. Click **"Save & Update"**

### Step 5: Initialize Database

After first deployment, access container terminal and run:

```bash
npx prisma generate
npx prisma migrate deploy
npm run seed
```

### Example Complete URL

If your PAT is: `abc123xyz789`

Your complete URL would be:
```
https://abc123xyz789@dev.azure.com/TechMorpho/Task-Managemnet-System/_git/Task-Managemnet-System
```

## Troubleshooting

**Build fails:**
- Verify PAT has "Code (read)" permission
- Check URL format is correct (no spaces, correct organization/project/repo names)
- Verify branch name is correct (`main`)

**Cannot connect:**
- Ensure PAT is not expired
- Check PAT has correct permissions
- Verify repository URL is accessible

**Need to update code:**
- Push changes to `main` branch in Azure DevOps
- CapRover will automatically trigger new deployment
- Or click "Trigger Build" in CapRover dashboard

