# SmartBite API Documentation for Frontend Developers

## Base URL
```
Production: https://func-smartbite-reconciliation.azurewebsites.net/api
```

## Authentication Overview

SmartBite uses **PIN-based authentication** with **JWT tokens** for session management. All protected endpoints require a valid JWT token in the Authorization header.

### User Roles & Permissions
- **Employee**: Can submit reconciliations (`["reconciliation"]`)
- **Manager**: Can approve reconciliations and manage employees (`["reconciliation", "employee-mgmt"]`)  
- **Owner**: Full system access (`["reconciliation", "employee-mgmt", "system-config", "financial-reports"]`)

---

## 🔐 Authentication Endpoints

### POST /auth/login
Authenticate user with Employee ID and PIN.

**Important:** This endpoint supports CORS and can be called from web applications without cross-origin issues. Both `/auth` and `/auth/login` routes are supported.

**Request:**
```json
{
  "employeeId": "employee-001",
  "pin": "1789"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "employeeId": "employee-001",
    "name": "John Smith",
    "userType": "employee",
    "tenantId": "tenant-001"
  }
}
```

**Frontend Routing Logic:**
```javascript
// Route users based on userType
switch (response.user.userType) {
  case 'employee': 
    router.push('/employee/dashboard');
    break;
  case 'manager':
    router.push('/manager/dashboard'); 
    break;
  case 'owner':
    router.push('/owner/dashboard');
    break;
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

### GET /auth/status
Check authentication service health and get demo credentials.

**Response:**
```json
{
  "success": true,
  "service": "SmartBite Auth API",
  "message": "CORS-enabled authentication service",
  "demo_credentials": {
    "owner": { "employeeId": "owner-001", "pin": "1123" },
    "manager": { "employeeId": "manager-001", "pin": "1456" },
    "employee": { "employeeId": "employee-001", "pin": "1789" }
  }
}
```

### POST /auth/verify
Verify JWT token validity (Note: Currently has header parsing issue).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

---

## 👥 Employee Management Endpoints

All employee endpoints require authentication. Managers and Owners have full access.

### GET /employees
Get all employees for the authenticated user's tenant.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "employees": [
    {
      "id": "emp-001",
      "employeeId": "employee-001",
      "name": "John Smith",
      "email": "john@smartbite.com", 
      "userType": "employee",
      "isActive": true,
      "permissions": ["reconciliation"],
      "profile": {
        "firstName": "John",
        "lastName": "Smith",
        "phone": "555-0101"
      },
      "createdAt": "2025-08-22T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

### POST /employees
Create a new employee (Manager/Owner only).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request:**
```json
{
  "name": "New Employee",
  "email": "new@smartbite.com",
  "userType": "employee",
  "profile": {
    "firstName": "New",
    "lastName": "Employee", 
    "phone": "555-0123"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Employee created successfully",
  "employee": {
    "id": "employee-257278pkb",
    "employeeId": "employee-257278pkb",
    "tenantId": "tenant-001",
    "userType": "employee",
    "name": "New Employee",
    "email": "new@smartbite.com",
    "pin": "4369",
    "isActive": true,
    "permissions": ["reconciliation"],
    "profile": {
      "firstName": "New",
      "lastName": "Employee",
      "phone": "555-0123"
    },
    "createdAt": "2025-08-24T00:10:57.278Z",
    "updatedAt": "2025-08-24T00:10:57.278Z"
  },
  "credentials": {
    "employeeId": "employee-257278pkb",
    "pin": "4369"
  },
  "timestamp": "2025-08-24T00:10:57.289Z"
}
```

### PUT /employees/{employeeId}
Update an existing employee (Manager/Owner only).

**Request:**
```json
{
  "name": "Updated Employee Name",
  "userType": "manager",
  "email": "updated@smartbite.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Employee updated successfully",
  "employee": {
    "id": "employee-257278pkb",
    "employeeId": "employee-257278pkb",
    "tenantId": "tenant-001",
    "userType": "manager",
    "name": "Updated Employee Name",
    "email": "updated@smartbite.com",
    "permissions": ["reconciliation", "employee-mgmt"],
    "updatedAt": "2025-08-24T00:11:09.952Z"
  },
  "timestamp": "2025-08-24T00:11:09.962Z"
}
```

### DELETE /employees/{employeeId}  
Deactivate an employee (Manager/Owner only). This performs a soft delete by setting `isActive: false`.

**Response:**
```json
{
  "success": true,
  "message": "Employee deactivated successfully",
  "employee": {
    "id": "employee-257278pkb",
    "employeeId": "employee-257278pkb",
    "isActive": false,
    "deactivatedAt": "2025-08-24T00:11:27.696Z",
    "updatedAt": "2025-08-24T00:11:27.696Z"
  },
  "timestamp": "2025-08-24T00:11:27.705Z"
}
```

### GET /employees/{employeeId}
Get a specific employee by ID.

**Response:**
```json
{
  "success": true,
  "employee": {
    "id": "employee-001",
    "employeeId": "employee-001", 
    "tenantId": "tenant-001",
    "userType": "employee",
    "name": "John Smith",
    "email": "john@smartbite.com",
    "isActive": true,
    "permissions": ["reconciliation"],
    "profile": {
      "firstName": "John",
      "lastName": "Smith",
      "phone": "555-0101"
    }
  }
}
```

---

## 🧾 Reconciliation Endpoints

### GET /reconciliations
Get reconciliations with optional filtering.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `status`: pending, approved, rejected
- `employeeId`: Filter by specific employee
- `startDate`: ISO date string
- `endDate`: ISO date string
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "reconciliations": [
    {
      "id": "recon-001",
      "employeeId": "employee-001",
      "employeeName": "John Smith",
      "date": "2025-08-23",
      "expectedCash": 500.00,
      "actualCash": 495.00,
      "variance": -5.00,
      "status": "pending",
      "notes": "Short $5 - customer refund",
      "createdAt": "2025-08-23T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10, 
    "total": 1,
    "totalPages": 1
  }
}
```

### POST /reconciliations
Submit a new reconciliation.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request:**
```json
{
  "date": "2025-08-24",
  "registers": [
    {
      "id": 1,
      "name": "Main Register",
      "total": 500.00,
      "reserve": 400.00,
      "banking": 100.00
    }
  ],
  "posTerminals": [
    {
      "id": 1,
      "name": "Terminal 1", 
      "total": 1200.50
    }
  ],
  "summary": {
    "totalSales": 1700.50,
    "totalEftpos": 1200.50,
    "payouts": 0,
    "expectedBanking": 100.00,
    "actualBanking": 100.00,
    "variance": 0
  },
  "comments": "Perfect day - no variance"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reconciliation submitted successfully",
  "reconciliation": {
    "id": "2025-08-24-employee-001-1755995304489",
    "date": "2025-08-24",
    "employeeName": "John Smith",
    "tenantId": "tenant-001",
    "status": "pending_approval",
    "submittedAt": "2025-08-24T00:28:24.490Z",
    "registers": [
      {
        "id": 1,
        "name": "Main Register",
        "total": 500,
        "reserve": 400,
        "banking": 100
      }
    ],
    "posTerminals": [
      {
        "id": 1,
        "name": "Terminal 1",
        "total": 1200.5
      }
    ],
    "summary": {
      "totalSales": 1700.5,
      "totalEftpos": 1200.5,
      "variance": 0
    }
  },
  "requiresApproval": false,
  "timestamp": "2025-08-24T00:28:24.490Z"
}
```

### PUT /reconciliations/{id}/approve
Approve a reconciliation (Manager/Owner only).

### PUT /reconciliations/{id}/reject  
Reject a reconciliation (Manager/Owner only).

**Request:**
```json
{
  "rejectionReason": "Variance too high, please recount"
}
```

### GET /reconciliations/pending
Get pending reconciliations awaiting approval (Manager/Owner only).

---

## ⚙️ Configuration Endpoints

Owner-only endpoints for system configuration.

### GET /config
Get current system configuration.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "config": {
    "registers": ["Register 1", "Register 2"],
    "posTerminals": ["POS-001", "POS-002"],
    "reconciliation": {
      "requireApproval": true,
      "tolerance": 5.00,
      "currency": "USD"
    },
    "business": {
      "name": "My Restaurant",
      "address": "123 Main St",
      "phone": "555-0100"
    }
  }
}
```

### PUT /config
Update system configuration (Owner only).

---

## 🏢 Onboarding Endpoints

### POST /finalOwnerSignup
One-step business owner account creation.

**Request:**
```json
{
  "firstName": "Restaurant",
  "lastName": "Owner", 
  "email": "owner@restaurant.com",
  "businessName": "My Restaurant",
  "phone": "555-0100",
  "address": "123 Main St",
  "timezone": "America/New_York",
  "currency": "USD",
  "businessType": "restaurant"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully! Welcome to SmartBite!",
  "data": {
    "tenant": {
      "id": "uuid-tenant-id",
      "name": "My Restaurant",
      "plan": "starter",
      "status": "active"
    },
    "owner": {
      "id": "uuid-owner-id", 
      "name": "Restaurant Owner",
      "email": "owner@restaurant.com",
      "userType": "owner"
    },
    "credentials": {
      "employeeId": "uuid-owner-id",
      "pin": "1234",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "nextSteps": [
      "Save your login credentials in a secure location",
      "Complete your business profile in Settings", 
      "Add your first employees",
      "Configure your POS terminals and registers"
    ]
  }
}
```

### POST /seedDemoUsers
Seed demo users for testing (Development only).

---

## 📊 Common HTTP Status Codes

- **200**: Success (GET, PUT)
- **201**: Created (POST)
- **400**: Bad Request - Invalid input data
- **401**: Unauthorized - Invalid or missing JWT token  
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource doesn't exist
- **500**: Internal Server Error

---

## 🔗 Request Headers

### Required for Protected Endpoints
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Optional Headers
```
x-tenant-id: tenant-001    // Override tenant (defaults to token tenant)
```

---

## 🚀 Frontend Integration Examples

### Login Flow
```javascript
const login = async (employeeId, pin) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId, pin })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Store token
      localStorage.setItem('jwt_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Route based on user type
      switch (data.user.userType) {
        case 'employee': router.push('/employee/dashboard'); break;
        case 'manager': router.push('/manager/dashboard'); break; 
        case 'owner': router.push('/owner/dashboard'); break;
      }
    } else {
      setError(data.error);
    }
  } catch (error) {
    setError('Login failed');
  }
};
```

### Protected API Call
```javascript
const getReconciliations = async () => {
  const token = localStorage.getItem('jwt_token');
  
  const response = await fetch('/api/reconciliations', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.json();
};
```

### Permission-Based UI
```javascript
const user = JSON.parse(localStorage.getItem('user'));

// Show reconciliation approval UI only for managers/owners
const canApproveReconciliations = user.hasReconciliationAccess;

// Show employee management only for managers/owners  
const canManageEmployees = user.permissions.includes('employee-mgmt');

// Show system config only for owners
const canConfigureSystem = user.permissions.includes('system-config');
```

---

## 🔧 Demo Credentials for Testing

**All demo users are stored in Azure Cosmos DB and verified working:**

```javascript
const demoCredentials = {
  employee: { employeeId: 'employee-001', pin: '1789' },
  manager: { employeeId: 'manager-001', pin: '1456' }, 
  owner: { employeeId: 'owner-001', pin: '1123' }
};
```

**Demo Data Available:**
- ✅ **3 Active Employees** in database (employee-001, manager-001, owner-001)
- ✅ **Sample Reconciliation Data** with complete cash/POS records  
- ✅ **System Configuration** with registers, POS terminals, and business settings
- ✅ **Multi-tenant Support** with tenant-001 as demo tenant

---

## 🛠️ Development Notes

- All timestamps are in ISO 8601 format
- Currency values are in decimal format (e.g., 500.00)
- Employee IDs are auto-generated UUIDs for new accounts
- PINs are 4-digit numeric codes
- JWT tokens expire after 24 hours
- All endpoints support CORS for web applications
- The API uses multi-tenant architecture - data is isolated by tenantId
- Error responses always include a `timestamp` field

---

*This documentation covers the production-ready SmartBite API with Cosmos DB integration. For questions or issues, contact the backend development team.*