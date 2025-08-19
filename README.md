# SmartBite Frontend

A React-based cash reconciliation system for SmartBite restaurant management.

## Features

- Employee and Owner authentication
- Multi-step cash reconciliation process
- Real-time calculations and validation
- Responsive design with Tailwind CSS
- Centralized API client with error handling

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your API configuration

5. Start development server:
   ```bash
   npm run dev
   ```

## Deployment

### Azure Static Web Apps

This project is configured for deployment to Azure Static Web Apps with automated CI/CD.

#### Manual Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy using Azure CLI:
   ```bash
   az staticwebapp create \
     --name smartbite-frontend \
     --resource-group smartbite-rg \
     --source https://github.com/ImranQasim/smartbite-frontend \
     --location "East US 2" \
     --branch main \
     --app-location "/" \
     --output-location "dist"
   ```

#### GitHub Actions CI/CD

The project includes automated deployment via GitHub Actions. To set up:

1. **Create Azure Static Web App:**
   - Go to Azure Portal → Static Web Apps
   - Create new Static Web App
   - Connect to your GitHub repository
   - Set build details:
     - App location: `/`
     - Output location: `dist`

2. **Configure GitHub Secrets:**
   Go to your GitHub repository → Settings → Secrets and variables → Actions, and add:

   - `AZURE_STATIC_WEB_APPS_API_TOKEN`: From Azure Static Web App deployment token
   - `VITE_API_BASE_URL`: Your API base URL
   - `VITE_API_TIMEOUT`: API timeout (e.g., 30000)
   - `VITE_APP_NAME`: Application name
   - `VITE_APP_VERSION`: Application version

3. **Environment Variables:**
   In Azure Portal → Static Web Apps → Configuration, add:
   - `VITE_API_BASE_URL`
   - `VITE_API_TIMEOUT`
   - `VITE_APP_NAME`
   - `VITE_APP_VERSION`

### Security Best Practices

- ✅ No secrets in code repository
- ✅ Environment variables managed via GitHub Secrets
- ✅ API tokens secured in Azure
- ✅ Build-time environment injection
- ✅ Production environment isolation

## Demo Credentials

### Employee Login:
- **Name:** John Smith
- **PIN:** 1234

### Owner Login:
- **Name:** Owner Admin
- **PIN:** 0000

## Project Structure

```
src/
├── components/          # Reusable UI components
├── config/             # Configuration files
├── features/           # Feature-specific components
├── modules/            # Business logic modules
├── services/           # API services
└── utils/              # Utility functions
```

## API Integration

The application uses a centralized API client (`src/services/apiClient.js`) for all HTTP requests with timeout handling, error management, authentication support, and environment-based configuration.

### Current API Endpoints

#### Authentication APIs
- `POST /auth/login` - Employee/Owner authentication with PIN
- `POST /auth/logout` - Session termination
- `GET /auth/verify` - Token verification

#### Configuration APIs
- `GET /config/system` - System configuration (registers, POS machines, reserve amounts)
- `PUT /config/system` - Update system configuration (Owner only)
- `GET /config/tenant/{tenantId}` - Tenant-specific configuration

#### Reconciliation APIs
- `POST /reconciliations` - Submit daily reconciliation
- `GET /reconciliations` - Get reconciliation history with filters
- `GET /reconciliations/{id}` - Get specific reconciliation
- `PUT /reconciliations/{id}/status` - Update reconciliation status (Manager/Owner)
- `GET /reconciliations/pending` - Get pending reconciliations for review

#### Employee Management APIs
- `GET /employees` - Get employee list (Owner only)
- `POST /employees` - Create new employee (Owner only)
- `PUT /employees/{id}` - Update employee details (Owner only)
- `DELETE /employees/{id}` - Remove employee (Owner only)

### API Response Formats

#### Authentication Response
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "name": "John Smith",
    "userType": "employee|owner",
    "tenantId": "uuid",
    "hasReconciliationAccess": true,
    "permissions": ["reconciliation", "reports"]
  },
  "token": "jwt-token",
  "expiresIn": 3600
}
```

#### Configuration Response
```json
{
  "success": true,
  "config": {
    "registers": {
      "count": 2,
      "names": ["Main Register", "Secondary Register"],
      "reserveAmount": 400
    },
    "posTerminals": {
      "count": 4,
      "names": ["Terminal 1", "Terminal 2", "Terminal 3", "Terminal 4"],
      "enabled": [true, true, true, false]
    },
    "reconciliation": {
      "dailyDeadline": "23:59",
      "varianceTolerance": 5.00,
      "requireManagerApproval": true
    }
  }
}
```

#### Reconciliation Submission
```json
{
  "date": "2025-08-19",
  "registers": [
    {
      "id": 1,
      "name": "Main Register",
      "cash": {
        "notes": {"hundreds": 10, "fifties": 5, "twenties": 20},
        "coins": {"dollars": 50, "fifties": 10, "twenties": 5},
        "coinRolls": {"dollars": 2, "fifties": 1}
      },
      "total": 850.00,
      "reserve": 400.00,
      "banking": 450.00
    }
  ],
  "posTerminals": [
    {"id": 1, "name": "Terminal 1", "total": 1250.50},
    {"id": 2, "name": "Terminal 2", "total": 980.25}
  ],
  "summary": {
    "totalSales": 2500.75,
    "totalEftpos": 2230.75,
    "payouts": 25.00,
    "expectedBanking": 245.00,
    "actualBanking": 450.00,
    "variance": 205.00
  },
  "comments": "Higher cash sales today",
  "submittedBy": "employee-id"
}
```

## API Implementation Status

### ✅ Implemented Features - Live API Integration
- ✅ **Live API Integration** - Connected to https://func-smartbite-reconciliation.azurewebsites.net/api
- ✅ **PIN-based authentication** - Employee ID + PIN authentication via `/auth/login`
- ✅ **Dynamic system configuration** - Live `/config/system` endpoint integration
- ✅ **Reconciliation API integration** - Full `/reconciliations` CRUD operations
- ✅ **Owner configuration UI** - Complete system settings management
- ✅ **Local fallback system** - Offline-first approach with automatic sync
- ✅ **Environment configuration** - Production-ready environment variable management
- ✅ **Error handling framework** - Comprehensive error handling with user feedback

### 🔗 Live API Endpoints
- **Authentication**: `POST /auth/login` - Employee ID + PIN authentication
- **Configuration**: `GET /config/system` - System configuration retrieval
- **Configuration**: `PUT /config/system` - System configuration updates (Owner only)
- **Reconciliations**: `GET /reconciliations` - Retrieve reconciliation history with filtering
- **Reconciliations**: `POST /reconciliations` - Submit new reconciliations
- **Reconciliations**: `PUT /reconciliations/{id}` - Update reconciliation status (Manager/Owner)
- **Employees**: `GET /employees` - Employee management operations

### 🎯 Demo Credentials (Live API)
- **Employee**: `employee-001` / `employee789`
- **Manager**: `manager-001` / `manager456` 
- **Owner**: `owner-001` / `owner123`

### 🚧 API Improvements Needed

#### Authentication & Security
- **JWT token refresh** - Automatic token renewal for extended sessions
- **Role-based access control** - Detailed permission validation per endpoint
- **Audit logging** - Track all user actions and data changes
- **Two-factor authentication** - Enhanced security for owner accounts

#### Configuration Management
- **Tenant-specific settings** - Multi-tenant support with isolated configurations
- **Configuration validation** - Ensure valid ranges and dependencies
- **Configuration history** - Track changes to system settings with rollback capability

#### Enhanced Reconciliation Features
- **Real-time reconciliation status** - WebSocket-based live updates
- **Reconciliation templates** - Pre-filled forms based on historical data
- **Batch reconciliation processing** - Handle multiple days or locations
- **Reconciliation analytics** - Trends, patterns, and insights
- **Manager approval workflow** - Structured approval process for variances

#### Employee Management
- **Employee CRUD operations** - Full employee lifecycle management
- **Permission management** - Granular access control per employee
- **Employee activity tracking** - Login history and action logs
- **Employee photo/biometric support** - Enhanced security options

#### Reporting & Analytics
- **Variance analysis API** - Detailed reconciliation variance reporting
- **Performance metrics** - Employee and location performance tracking
- **Export functionality** - PDF, Excel, CSV report generation
- **Dashboard data** - Real-time KPIs and metrics

#### Notification System
- **Email notifications** - Automated alerts for variances and deadlines
- **SMS alerts** - Critical notifications for managers
- **In-app notifications** - Real-time status updates
- **Escalation workflows** - Automated escalation for significant variances

#### Data Management
- **Data backup and recovery** - Automated backup procedures
- **Data archival** - Historical data management
- **Data synchronization** - Multi-location data consistency
- **Data validation** - Input validation and integrity checks

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run linter (if configured)

## Contributing

1. Create feature branch from `main`
2. Make changes and test locally
3. Create pull request
4. CI/CD will automatically build and deploy preview
5. Merge to `main` for production deployment