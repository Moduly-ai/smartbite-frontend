# SmartBite Configuration API - Quick Reference

## Authentication Required

All configuration endpoints require Bearer token authentication.

### Get Auth Token First:
```bash
curl -X POST "https://func-smartbite-reconciliation.azurewebsites.net/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"employeeId": "owner-001", "pin": "owner123"}'
```

Response: `{"success": true, "token": "eyJhbGciOiJIUzI1NiIs..."}`

---

## GET Configuration

**Endpoint:** `GET /config/system`

```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     "https://func-smartbite-reconciliation.azurewebsites.net/api/config/system"
```

**Response:**
```json
{
  "success": true,
  "config": {
    "registers": {
      "count": 2,
      "names": ["Main Register", "Secondary Register"],
      "reserveAmount": 400.00,
      "enabled": [true, true]
    },
    "business": {
      "name": "SmartBite Restaurant",
      "timezone": "America/New_York",
      "currency": "USD",
      "taxRate": 8.5
    },
    "reconciliation": {
      "dailyDeadline": "23:59",
      "varianceTolerance": 5.00,
      "requireManagerApproval": true
    },
    "posTerminals": {
      "count": 4,
      "names": ["POS Terminal 1", "POS Terminal 2", "POS Terminal 3", "POS Terminal 4"],
      "enabled": [true, true, true, true]
    }
  },
  "timestamp": "2025-08-20T15:13:27.102Z"
}
```

---

## PUT Configuration (Update)

**Endpoint:** `PUT /config/system`

```bash
curl -X PUT \
     -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     -H "Content-Type: application/json" \
     -d '{
       "registers": {
         "count": 3,
         "reserveAmount": 500.00
       },
       "business": {
         "name": "Updated Restaurant Name"
       }
     }' \
     "https://func-smartbite-reconciliation.azurewebsites.net/api/config/system"
```

**Response:**
```json
{
  "success": true,
  "config": {
    "registers": {
      "count": 3,
      "reserveAmount": 500.00,
      "names": ["Main Register", "Secondary Register", "Register 3"]
    },
    "business": {
      "name": "Updated Restaurant Name",
      "timezone": "America/New_York"
    },
    "lastUpdated": "2025-08-20T15:13:27.101Z",
    "updatedBy": "owner-001"
  },
  "message": "System configuration updated successfully",
  "timestamp": "2025-08-20T15:13:27.102Z"
}
```

---

## Frontend Integration

### configService Usage:

```javascript
import { configService } from './services/configService.js';

// Get configuration
const result = await configService.getSystemConfig();
if (result.success) {
  console.log('Config:', result.config);
}

// Update configuration (owner only)
const updateResult = await configService.updateSystemConfig({
  registers: { count: 3, reserveAmount: 500 }
});
if (updateResult.success) {
  console.log('Updated config:', updateResult.config);
}
```

### Authentication Flow:

1. User logs in → `authService.login()` → stores token
2. `configService` automatically uses stored token for API calls
3. If token expires → user gets authentication error → must log in again

---

## Common Errors

- **401 Unauthorized**: Missing or invalid token → log in again
- **403 Forbidden**: Not owner role → only owners can update config
- **400 Bad Request**: Invalid configuration data → check validation errors

---

## Configuration Fields

### registers
- `count` (1-10): Number of registers
- `names` (array): Register names (length must match count)
- `reserveAmount` (number ≥ 0): Cash reserve per register
- `enabled` (array of booleans): Which registers are active

### business  
- `name` (string, 1-100 chars): Business name
- `timezone` (string): Timezone identifier
- `currency` (string): 3-letter ISO currency code
- `taxRate` (number, 0-100): Tax percentage

### reconciliation
- `dailyDeadline` (HH:MM): Daily reconciliation deadline
- `varianceTolerance` (number ≥ 0): Allowed variance amount
- `requireManagerApproval` (boolean): Whether manager approval needed

### posTerminals
- `count` (1-20): Number of POS terminals  
- `names` (array): Terminal names (length must match count)
- `enabled` (array of booleans): Which terminals are active
