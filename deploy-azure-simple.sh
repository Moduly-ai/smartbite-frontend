#!/bin/bash

# SmartBite Frontend - Simple Azure Deployment (No GitHub Required)
# This script creates Azure Static Web App and provides manual deployment instructions

set -e

echo "🚀 Starting Simple Azure deployment for SmartBite Frontend..."

# Configuration
RESOURCE_GROUP="smartbite-rg"
APP_NAME="smartbite-frontend"
LOCATION="East US 2"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
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

# Create Static Web App without GitHub
echo "🌐 Creating Azure Static Web App (without GitHub integration)..."
az staticwebapp create \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --location "$LOCATION" \
    --sku Free

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Static Web App created successfully${NC}"
    
    # Get the deployment token
    echo "🔑 Retrieving deployment token..."
    DEPLOYMENT_TOKEN=$(az staticwebapp secrets list --name $APP_NAME --resource-group $RESOURCE_GROUP --query "properties.apiKey" -o tsv)
    
    # Get the app URL
    APP_URL=$(az staticwebapp show --name $APP_NAME --resource-group $RESOURCE_GROUP --query "defaultHostname" -o tsv)
    
    echo ""
    echo -e "${BLUE}🎉 Deployment Information:${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${GREEN}App Name:${NC} $APP_NAME"
    echo -e "${GREEN}Resource Group:${NC} $RESOURCE_GROUP"
    echo -e "${GREEN}Location:${NC} $LOCATION"
    echo -e "${GREEN}App URL:${NC} https://$APP_URL"
    echo ""
    echo -e "${BLUE}🔐 Deployment Token:${NC}"
    echo "$DEPLOYMENT_TOKEN"
    echo ""
    
    # Check if SWA CLI is installed
    if command -v swa &> /dev/null; then
        echo -e "${YELLOW}📤 Deploying application using SWA CLI...${NC}"
        swa deploy ./dist --deployment-token "$DEPLOYMENT_TOKEN" --env default
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Application deployed successfully!${NC}"
            echo -e "${GREEN}🌍 Visit your app at: https://$APP_URL${NC}"
        else
            echo -e "${YELLOW}⚠️ SWA CLI deployment failed, but you can deploy manually${NC}"
        fi
    else
        echo -e "${YELLOW}📋 SWA CLI not found. Manual deployment options:${NC}"
        echo ""
        echo "Option 1: Install SWA CLI and deploy"
        echo "  npm install -g @azure/static-web-apps-cli"
        echo "  swa deploy ./dist --deployment-token \"$DEPLOYMENT_TOKEN\" --env default"
        echo ""
        echo "Option 2: Use Azure Portal"
        echo "  1. Go to Azure Portal → Static Web Apps → $APP_NAME"
        echo "  2. Go to 'Deployment' section"
        echo "  3. Upload the 'dist' folder manually"
        echo ""
        echo "Option 3: Set up GitHub integration later"
        echo "  1. Create GitHub repository"
        echo "  2. Connect it in Azure Portal → Static Web Apps → $APP_NAME → GitHub integration"
    fi
    
    echo ""
    echo -e "${BLUE}📝 Next Steps:${NC}"
    echo "1. Visit your app: https://$APP_URL"
    echo "2. Add environment variables in Azure Portal:"
    echo "   - VITE_API_BASE_URL"
    echo "   - VITE_API_TIMEOUT"
    echo "   - VITE_APP_NAME"
    echo "   - VITE_APP_VERSION"
    echo "3. Optionally set up GitHub integration for CI/CD"
    echo ""
    echo -e "${GREEN}✅ SmartBite Frontend deployment completed!${NC}"
else
    echo -e "${RED}❌ Static Web App creation failed${NC}"
    exit 1
fi