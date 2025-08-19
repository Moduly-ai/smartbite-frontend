#!/bin/bash

# SmartBite Frontend - Azure Deployment Script
# This script deploys the SmartBite frontend to Azure Static Web Apps

set -e

echo "🚀 Starting Azure deployment for SmartBite Frontend..."

# Configuration
RESOURCE_GROUP="smartbite-rg"
APP_NAME="smartbite-frontend"
LOCATION="East US"
GITHUB_REPO_URL="https://github.com/YOUR_USERNAME/smartbite-frontend"
BRANCH="main"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if logged in to Azure
echo "🔍 Checking Azure login status..."
if ! az account show > /dev/null 2>&1; then
    echo -e "${RED}❌ Not logged in to Azure. Please run: az login${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Azure login verified${NC}"

# Build the application
echo "🔨 Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build completed successfully${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

# Check if resource group exists
echo "🔍 Checking resource group..."
if ! az group show --name $RESOURCE_GROUP > /dev/null 2>&1; then
    echo "📦 Creating resource group: $RESOURCE_GROUP"
    az group create --name $RESOURCE_GROUP --location "$LOCATION"
    echo -e "${GREEN}✅ Resource group created${NC}"
else
    echo -e "${GREEN}✅ Resource group exists${NC}"
fi

# Create Static Web App
echo "🌐 Creating Azure Static Web App..."
az staticwebapp create \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --source $GITHUB_REPO_URL \
    --location "$LOCATION" \
    --branch $BRANCH \
    --app-location "/" \
    --output-location "dist" \
    --login-with-github

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Static Web App created successfully${NC}"
    
    # Get the deployment token
    echo "🔑 Retrieving deployment token..."
    DEPLOYMENT_TOKEN=$(az staticwebapp secrets list --name $APP_NAME --resource-group $RESOURCE_GROUP --query "properties.apiKey" -o tsv)
    
    echo -e "${BLUE}📋 Deployment Information:${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${GREEN}App Name:${NC} $APP_NAME"
    echo -e "${GREEN}Resource Group:${NC} $RESOURCE_GROUP"
    echo -e "${GREEN}Location:${NC} $LOCATION"
    echo ""
    echo -e "${BLUE}🔐 GitHub Secrets to add:${NC}"
    echo "AZURE_STATIC_WEB_APPS_API_TOKEN: $DEPLOYMENT_TOKEN"
    echo ""
    echo -e "${BLUE}🌍 Your app will be available at:${NC}"
    az staticwebapp show --name $APP_NAME --resource-group $RESOURCE_GROUP --query "defaultHostname" -o tsv | sed 's/^/https:\/\//'
    echo ""
    echo -e "${GREEN}✅ Deployment completed!${NC}"
else
    echo -e "${RED}❌ Static Web App creation failed${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo "1. Add the AZURE_STATIC_WEB_APPS_API_TOKEN to your GitHub repository secrets"
echo "2. Add environment variables to GitHub secrets:"
echo "   - VITE_API_BASE_URL"
echo "   - VITE_API_TIMEOUT"
echo "   - VITE_APP_NAME"
echo "   - VITE_APP_VERSION"
echo "3. Push your code to GitHub to trigger automated deployment"
echo ""
echo -e "${GREEN}🎉 SmartBite Frontend deployment setup complete!${NC}"