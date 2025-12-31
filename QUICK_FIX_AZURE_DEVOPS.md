# Quick Fix: Deploy Azure DevOps to CapRover

## The Problem
CapRover Method 1 doesn't support Azure DevOps → Error: "Missing required Github/BitBucket/Gitlab field"

## The Solution: Use Docker Registry (Method 3)

### Step 1: Set Up Docker Hub (Easiest) or Azure Container Registry

**Option A: Docker Hub (Simplest)**
1. Create account at https://hub.docker.com
2. Create a repository (e.g., `task-management`)
3. Note your Docker Hub username

**Option B: Azure Container Registry**
1. Create ACR in Azure Portal
2. Note the login server (e.g., `youracr.azurecr.io`)

### Step 2: Update Azure Pipeline to Push Docker Image

Add this to your `azure-pipelines.yml` (add after the Docker stage):

```yaml
  - stage: Docker
    displayName: 'Build and Push Docker Image'
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
    jobs:
      - job: BuildDocker
        displayName: 'Build and Push to Registry'
        steps:
          - task: Docker@2
            inputs:
              containerRegistry: 'DockerHub' # Change to your registry connection name
              repository: 'your-dockerhub-username/task-management'
              command: 'buildAndPush'
              Dockerfile: '**/Dockerfile'
              tags: |
                $(Build.BuildId)
                latest
```

**To set up Docker Hub service connection in Azure DevOps:**
1. Go to Project Settings → Service connections
2. New service connection → Docker Registry
3. Select "Docker Hub"
4. Enter Docker Hub credentials
5. Name it: "DockerHub"
6. Save

### Step 3: Configure CapRover (Method 3)

1. **In CapRover Dashboard:**
   - Go to your app
   - Click **"Deployment"** tab
   - Select **"Method 3: Deploy using a Docker image from a registry"**

2. **Enter Docker Image:**
   - For Docker Hub: `your-username/task-management:latest`
   - For ACR: `youracr.azurecr.io/task-management:latest`

3. **Add Registry Credentials (if private):**
   - Username: Your Docker Hub username
   - Password: Your Docker Hub password or access token

4. **Click "Save & Update"**

### Step 4: Deploy

- Push to `main` branch in Azure DevOps
- Pipeline will build and push Docker image
- CapRover will automatically pull and deploy the new image
- Or click "Trigger Build" in CapRover to pull latest

---

## Alternative: Manual Deployment via CLI

If you prefer manual control:

```bash
# Build locally
docker build -t task-management:latest .

# Tag for registry
docker tag task-management:latest your-username/task-management:latest

# Push to registry
docker push your-username/task-management:latest

# CapRover will auto-deploy if configured, or trigger manually
```

---

## Summary

✅ **Use Method 3 (Docker Registry)** instead of Method 1
✅ Build Docker image in Azure Pipeline
✅ Push to Docker Hub or ACR
✅ Configure CapRover to pull from registry
✅ Automatic deployments on every push!

