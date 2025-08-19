#!/bin/bash

# Azure CLI method to create Static Web App and get token
echo "Creating Azure Static Web App and getting deployment token..."

# Variables
RESOURCE_GROUP="smartbite-rg"
STATIC_APP_NAME="smartbite-frontend"
GITHUB_REPO="https://github.com/ImranQasim/smartbite-frontend"
LOCATION="eastus2"

echo "Creating resource group..."
az group create --name $RESOURCE_GROUP --location $LOCATION

echo "Creating Static Web App..."
az staticwebapp create \
  --name $STATIC_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --source $GITHUB_REPO \
  --location $LOCATION \
  --branch main \
  --app-location "/" \
  --output-location "dist" \
  --login-with-github

echo "Getting deployment token..."
az staticwebapp secrets list --name $STATIC_APP_NAME --resource-group $RESOURCE_GROUP

echo "Token will be displayed above as 'properties.apiKey'"
