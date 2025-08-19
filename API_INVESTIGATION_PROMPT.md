# SmartBite API Investigation & Fix Prompt

## URGENT: Configuration API Endpoints Not Properly Implemented

### Problem Summary
The SmartBite frontend React application is experiencing critical configuration synchronization issues. While the API endpoints respond with HTTP 200 status codes, they are NOT properly storing or retrieving configuration data. This affects the core functionality where owner configuration changes need to be visible across all employee devices.

### Current State Analysis

**API Base URL**: `https://func-smartbite-reconciliation.azurewebsites.net/api`

**Problematic Endpoints**:
- `GET /config/system` - Returns service metadata instead of configuration data
- `PUT /config/system` - Accepts data but doesn't store it properly

**Evidence of Issues**:
1. API responds with success=true but no config data in response
2. Frontend falls back to localStorage (which doesn't sync between devices)
3. Configuration changes made by owner don't appear on employee devices
4. Employee login gets stuck on "Loading configuration..." when localStorage is empty

### Investigation Tasks

#### 1. API Response Analysis
Test the current endpoints and document exact response structure:

```bash
# Test GET endpoint
curl -X GET "https://func-smartbite-reconciliation.azurewebsites.net/api/config/system" \
  -H "Content-Type: application/json" \
  -v

# Test PUT endpoint
curl -X PUT "https://func-smartbite-reconciliation.azurewebsites.net/api/config/system" \
  -H "Content-Type: application/json" \
  -d '{
    "registers": {
      "count": 3,
      "names": ["Register 1", "Register 2", "Register 3"],
      "reserveAmount": 100
    },
    "posTerminals": {
      "count": 2,
      "names": ["POS 1", "POS 2"]
    },
    "reconciliation": {
      "varianceTolerance": 5,
      "requireManagerApproval": true
    }
  }' \
  -v
```

#### 2. Azure Function Investigation
**Check if the Azure Functions exist and are properly implemented:**

1. **Access Azure Portal** and navigate to the Function App: `func-smartbite-reconciliation`
2. **Verify Function Existence**: Look for functions named like:
   - `GetSystemConfig`
   - `UpdateSystemConfig` 
   - `config-get`
   - `config-put`
   - Or any function handling `/config/system` routes

3. **Review Function Code**: Check if the functions:
   - Have proper HTTP triggers
   - Handle both GET and PUT methods for `/config/system`
   - Actually store data in a database/storage
   - Return proper JSON responses with config data

#### 3. Database/Storage Investigation
**Determine where configuration data should be stored:**

1. **Check Function App Configuration** for connection strings to:
   - Azure SQL Database
   - Azure Cosmos DB
   - Azure Table Storage
   - Azure Blob Storage

2. **Verify Storage Resources** exist and are accessible
3. **Check if configuration table/container exists** with proper schema

#### 4. Required API Contract
The frontend expects this exact API contract:

**GET /config/system Response:**
```json
{
  "success": true,
  "config": {
    "registers": {
      "count": 3,
      "names": ["Register 1", "Register 2", "Register 3"],
      "reserveAmount": 100
    },
    "posTerminals": {
      "count": 2,
      "names": ["POS 1", "POS 2"]
    },
    "reconciliation": {
      "varianceTolerance": 5,
      "requireManagerApproval": true
    }
  },
  "message": "Configuration retrieved successfully"
}
```

**PUT /config/system Request/Response:**
```json
// Request Body
{
  "registers": { /* updated config */ },
  "posTerminals": { /* updated config */ },
  "reconciliation": { /* updated config */ }
}

// Response
{
  "success": true,
  "config": { /* the stored config */ },
  "message": "Configuration updated successfully"
}
```

### Immediate Action Required

#### If API Functions Don't Exist:
Create new Azure Functions with:
- HTTP trigger for `GET /config/system`
- HTTP trigger for `PUT /config/system` 
- Database storage integration
- Proper error handling and logging

#### If API Functions Exist But Broken:
Fix the existing functions to:
- Actually store data to database/storage
- Return the stored configuration data
- Handle errors properly
- Implement proper logging

#### If Storage Resources Missing:
Create appropriate storage resources:
- Database table for configuration
- Connection strings in Function App settings
- Proper access permissions

### Expected Outcome
After fixes, the following should work:
1. Owner updates configuration → stored in cloud database
2. Employee logs in → retrieves configuration from cloud database
3. Configuration changes sync immediately across all devices
4. No dependency on localStorage for production data

### Priority Level: CRITICAL
This issue blocks the core multi-device functionality of the SmartBite system. The cash reconciliation process cannot work properly if employees can't access the current configuration set by owners.

### Testing Verification
After implementation, verify with:
1. Owner device: Update configuration
2. Employee device: Login and verify configuration matches
3. Multiple employee devices: All should see same configuration
4. API testing: Direct curl commands should return proper data

---
**Created**: August 20, 2025
**Status**: PENDING INVESTIGATION
**Assigned**: API Development Team
