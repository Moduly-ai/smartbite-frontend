# Azure Static Web Apps - Available Regions

## Supported Regions for Microsoft.Web/staticSites

Based on the Azure error message, the following regions are available for Azure Static Web Apps deployment:

### Available Regions:
- **westus2** - West US 2
- **centralus** - Central US
- **eastus2** - East US 2 ⭐ (Currently configured)
- **westeurope** - West Europe
- **eastasia** - East Asia

### NOT Supported:
- ❌ **eastus** - East US (Original error)

## How to Change Region

If you need to deploy to a different region, update the `LOCATION` variable in:

1. **deploy-azure.sh**:
   ```bash
   LOCATION="West US 2"  # or any other supported region
   ```

2. **Manual deployment**:
   ```bash
   az staticwebapp create \
     --location "West US 2" \
     # ... other parameters
   ```

## Region Selection Guidelines

### Performance Considerations:
- Choose the region closest to your users
- Consider latency requirements
- Review data residency requirements

### Cost Considerations:
- Pricing may vary slightly between regions
- Consider egress costs for data transfer

### Recommended Regions:
- **East US 2**: Good for US East Coast users
- **West US 2**: Good for US West Coast users  
- **Central US**: Good for central US locations
- **West Europe**: Good for European users
- **East Asia**: Good for Asian users

## Current Configuration
The deployment is currently configured for **East US 2** which provides good performance for North American users and is a stable Azure region with full feature availability.