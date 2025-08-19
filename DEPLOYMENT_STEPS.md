# Azure Deployment Steps - Fix for GitHub Authentication

## Issue
The deployment is failing because:
1. You need to create a GitHub repository first
2. The repository URL in the script needs to be updated
3. GitHub authentication is required

## Solution - Step by Step

### Step 1: Initialize Git and Create GitHub Repository

1. **Initialize Git repository locally:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: SmartBite Frontend with Azure deployment setup"
   ```

2. **Create GitHub repository:**
   - Go to https://github.com/new
   - Repository name: `smartbite-frontend` (or your preferred name)
   - Set to Public or Private
   - Don't initialize with README (we already have files)
   - Click "Create repository"

3. **Add remote and push:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/smartbite-frontend.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Update Deployment Script

Update the repository URL in `deploy-azure.sh`:

```bash
# Change this line:
GITHUB_REPO_URL="https://github.com/YOUR_USERNAME/smartbite-frontend"

# To your actual repository:
GITHUB_REPO_URL="https://github.com/YOUR_ACTUAL_USERNAME/smartbite-frontend"
```

### Step 3: Alternative Deployment Methods

#### Option A: Deploy without GitHub Integration (Recommended for now)

Create a simpler deployment script that doesn't require GitHub:

```bash
#!/bin/bash
# Simple Azure deployment without GitHub integration

RESOURCE_GROUP="smartbite-rg"
APP_NAME="smartbite-frontend"
LOCATION="East US 2"

echo "🚀 Creating Azure Static Web App without GitHub integration..."

# Create Static Web App without GitHub
az staticwebapp create \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --location "$LOCATION"

# Get deployment token
DEPLOYMENT_TOKEN=$(az staticwebapp secrets list --name $APP_NAME --resource-group $RESOURCE_GROUP --query "properties.apiKey" -o tsv)

echo "✅ Static Web App created!"
echo "📋 Deployment Token: $DEPLOYMENT_TOKEN"

# Manual deployment
az staticwebapp environment set \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --environment-name default \
    --source ./dist
```

#### Option B: Deploy using Azure Portal (Easiest)

1. **Go to Azure Portal**: https://portal.azure.com
2. **Create Static Web App**:
   - Search "Static Web Apps" → Create
   - Subscription: Your subscription
   - Resource Group: `smartbite-rg` (or create new)
   - Name: `smartbite-frontend`
   - Plan: Free
   - Region: East US 2
   - Source: GitHub (connect your repo)
   - Organization: Your GitHub username
   - Repository: smartbite-frontend
   - Branch: main
   - Build Presets: React
   - App location: `/`
   - Output location: `dist`

3. **Configure in Portal**:
   - Azure will automatically create the GitHub Action
   - It will add the deployment token to your repository secrets
   - First deployment will trigger automatically

### Step 4: Manual Build and Deploy (Quick Solution)

If you want to deploy immediately without GitHub integration:

```bash
# Build the project
npm run build

# Install Azure Static Web Apps CLI
npm install -g @azure/static-web-apps-cli

# Deploy directly
swa deploy ./dist --deployment-token YOUR_DEPLOYMENT_TOKEN
```

## Recommended Approach

**For immediate deployment:**
1. Use Azure Portal method (Option B above)
2. Let Azure handle the GitHub integration automatically
3. This will set up everything correctly

**For learning purposes:**
1. Create GitHub repository first
2. Update the deployment script with correct URL
3. Try the automated script again

## Next Steps After Successful Deployment

1. **Add Environment Variables in Azure:**
   - Go to Azure Portal → Your Static Web App → Configuration
   - Add application settings:
     - `VITE_API_BASE_URL`
     - `VITE_API_TIMEOUT`
     - `VITE_APP_NAME`
     - `VITE_APP_VERSION`

2. **Verify GitHub Actions:**
   - Check your repository → Actions tab
   - Ensure the workflow runs successfully

3. **Test the deployed application:**
   - Visit the provided Azure URL
   - Test all functionality

Would you like me to create a simplified deployment script that avoids the GitHub authentication issue?