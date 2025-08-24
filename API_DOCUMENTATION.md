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

**Request:**
```json
{
  "employeeId": "employee-001",
  "pin": "employee789"
}
```

**Response (Success):**
```json
{
  "success": true,
  "user": {
    "employeeId": "employee-001",
    "userType": "employee",
    "name": "John Smith", 
    "email": "john@smartbite.com",
    "tenantId": "tenant-001",
    "permissions": ["reconciliation"],
    "hasReconciliationAccess": false,
    "profile": {
      "firstName": "John",
      "lastName": "Smith", 
      "phone": "555-0101"
    }
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login successful",
  "expiresIn": 86400,
  "timestamp": "2025-08-23T23:33:52.858Z"
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
  "error": "Invalid employee ID or PIN",
  "timestamp": "2025-08-23T23:33:52.858Z"
}
```

### GET /auth/status
Check authentication service health and get demo credentials.

**Response:**
```json
{
  "success": true,
  "service": "SmartBite Authentication API v3.0",
  "message": "Enhanced authentication with Cosmos DB integration",
  "database": {
    "status": "healthy",
    "integration": "Azure Cosmos DB"
  },
  "demo_credentials": {
    "employee": { "employeeId": "employee-001", "pin": "employee789" },
    "manager": { "employeeId": "manager-001", "pin": "manager456" },
    "owner": { "employeeId": "owner-001", "pin": "owner123" }
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
    "id": "emp-new",
    "employeeId": "EMP-12345",
    "pin": "1234",
    "name": "New Employee",
    "email": "new@smartbite.com",
    "userType": "employee"
  }
}
```

### PUT /employees/{employeeId}
Update an existing employee (Manager/Owner only).

### DELETE /employees/{employeeId}  
Deactivate an employee (Manager/Owner only).

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

**Request:**
```json
{
  "expectedCash": 500.00,
  "actualCash": 495.00,
  "notes": "Short $5 - customer refund"
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

```javascript
const demoCredentials = {
  employee: { employeeId: 'employee-001', pin: 'employee789' },
  manager: { employeeId: 'manager-001', pin: 'manager456' }, 
  owner: { employeeId: 'owner-001', pin: 'owner123' }
};
```

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