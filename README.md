# SmartBite Frontend

A React-based cash reconciliation system for restaurant management, providing comprehensive daily cash counting and reconciliation workflows with real-time API integration.

## Features

- **Employee & Owner Authentication** - Role-based access with JWT security
- **Multi-Step Cash Reconciliation** - Guided workflow for register counting
- **Dynamic Configuration Management** - Real-time system settings synchronization
- **EFTPOS Integration** - Multi-terminal tracking and reconciliation
- **Responsive Design** - Mobile-first UI built with Tailwind CSS
- **Live API Integration** - Real-time data sync with Azure Functions backend

## Quick Start

### Prerequisites

- Node.js 18+
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smartbite-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your API configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   
   The application will open at `http://localhost:3000`

## Demo Credentials

### Live API Testing
- **Employee**: `employee-001` / PIN: `employee789`
- **Manager**: `manager-001` / PIN: `manager456`
- **Owner**: `owner-001` / PIN: `owner123`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Create production build
- `npm run preview` - Preview production build locally

## Project Structure

```
src/
├── components/
│   └── layout/          # Layout components (OwnerDashboard)
├── features/
│   └── auth/           # Authentication (LoginScreen)
├── modules/
│   └── cash-reconciliation/  # Main business logic
│       ├── EmployeeReconciliation.jsx
│       └── OwnerReconciliationReview.jsx
├── services/           # API integration layer
│   ├── apiClient.js   # HTTP client with authentication
│   ├── authService.js # User authentication
│   ├── configService.js  # System configuration
│   └── reconciliationService.js  # Cash reconciliation
├── config/
│   └── env.js         # Environment configuration
└── App.jsx            # Main application component
```

## API Integration

The application integrates with a live Azure Functions backend at:
`https://func-smartbite-reconciliation.azurewebsites.net/api`

### Available Endpoints

- **Authentication**: `POST /auth/login` - Employee/Owner login
- **Configuration**: `GET|PUT /config/system` - System settings management
- **Reconciliation**: `GET|POST /reconciliations` - Cash reconciliation data
- **Employee Management**: `GET|POST|PUT|DELETE /employees` - Employee CRUD operations

### Response Examples

#### Authentication
```json
{
  "success": true,
  "user": {
    "id": "employee-001",
    "name": "John Smith", 
    "userType": "employee",
    "hasReconciliationAccess": true
  },
  "token": "jwt-token-here"
}
```

#### Configuration
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

#### Employee Management

**Get All Employees**: `GET /employees`
```json
{
  "success": true,
  "employees": [
    {
      "id": "emp-1755660736254",
      "name": "John Smith",
      "userType": "manager",
      "email": "john@smartbite.com",
      "pin": "1697",
      "isActive": true,
      "createdAt": "2025-08-20T03:32:16.257Z",
      "tenantId": "tenant-001"
    }
  ],
  "count": 1
}
```

**Create Employee**: `POST /employees`
```json
{
  "name": "Jane Doe",
  "userType": "employee",
  "email": "jane@smartbite.com"
}
```

**Response**: 
```json
{
  "success": true,
  "message": "Employee created successfully",
  "employee": {
    "id": "emp-1755660993035",
    "name": "Jane Doe",
    "userType": "employee",
    "email": "jane@smartbite.com",
    "pin": "4977",
    "isActive": true,
    "createdAt": "2025-08-20T03:36:33.035Z",
    "tenantId": "tenant-001"
  }
}
```

**Update Employee**: `PUT /employees/{id}`
```json
{
  "name": "Jane Smith",
  "userType": "manager",
  "email": "jane.smith@smartbite.com"
}
```

**Delete Employee**: `DELETE /employees/{id}`
```json
{
  "success": true,
  "message": "Employee deactivated successfully",
  "employee": {
    "id": "emp-123",
    "isActive": false,
    "deactivatedAt": "2025-08-20T03:32:58.313Z"
  }
}
```

## Application Workflows

### Employee Workflow
1. **Login** - Authenticate with employee ID and PIN
2. **Register Counting** - Count cash in each register (notes, coins, rolls)
3. **EFTPOS Reconciliation** - Enter totals from each payment terminal
4. **Banking Calculation** - System calculates expected vs actual banking
5. **Submit** - Submit reconciliation for manager review

### Owner Workflow  
1. **Login** - Authenticate with owner credentials
2. **Configuration Management** - Update system settings (registers, POS terminals, business info)
3. **Reconciliation Review** - Review submitted reconciliations and approve/reject
4. **Real-time Sync** - Changes instantly visible across all devices

## Deployment

### Azure Static Web Apps (Recommended)

This project is configured for automated deployment to Azure Static Web Apps via GitHub Actions.

#### Setup Steps

1. **Create Azure Static Web App**
   - Go to Azure Portal → Static Web Apps
   - Connect to your GitHub repository
   - Set build configuration:
     - App location: `/`
     - Output location: `dist`

2. **Configure GitHub Secrets**
   Add these secrets in GitHub repository settings:
   - `AZURE_STATIC_WEB_APPS_API_TOKEN` - From Azure deployment token
   - `VITE_API_BASE_URL` - Your API base URL
   - `VITE_API_TIMEOUT` - API timeout (e.g., 30000)
   - `VITE_APP_NAME` - Application name
   - `VITE_APP_VERSION` - Application version

3. **Environment Variables**
   In Azure Portal → Static Web Apps → Configuration, add:
   - `VITE_API_BASE_URL`
   - `VITE_API_TIMEOUT`
   - `VITE_APP_NAME`
   - `VITE_APP_VERSION`

### Manual Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Azure**
   ```bash
   az staticwebapp create \
     --name smartbite-frontend \
     --resource-group smartbite-rg \
     --source https://github.com/your-username/smartbite-frontend \
     --location "East US 2" \
     --branch main \
     --app-location "/" \
     --output-location "dist"
   ```

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
VITE_API_BASE_URL=https://func-smartbite-reconciliation.azurewebsites.net/api
VITE_API_TIMEOUT=30000
VITE_APP_NAME=SmartBite Frontend
VITE_APP_VERSION=1.0.0
```

## Security

- ✅ **No secrets in code** - All sensitive data via environment variables
- ✅ **JWT Authentication** - Bearer token security for all API calls
- ✅ **Role-based Access** - Server-side permission enforcement
- ✅ **HTTPS Only** - Secure communication in production
- ✅ **Environment Isolation** - Separate dev/production configurations

## Technology Stack

- **React 18** - Modern component framework
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Azure Functions** - Serverless backend API
- **Azure Static Web Apps** - Hosting platform
- **GitHub Actions** - CI/CD automation

## Contributing

1. Create a feature branch from `main`
2. Make your changes and test locally
3. Create a pull request
4. CI/CD will automatically build and deploy a preview
5. Merge to `main` for production deployment

## Support

For technical documentation and AI agent context, see [CLAUDE.md](./CLAUDE.md).

For issues and bug reports, please create an issue in the repository.

## License

Private repository - All rights reserved.