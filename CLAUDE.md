# SmartBite Frontend - AI Agent Documentation

## Project Overview

**SmartBite Frontend** is a React-based cash reconciliation system for restaurant management. Built with React 18, Vite, and Tailwind CSS, it provides comprehensive employee/owner authentication and multi-step cash reconciliation workflows.

## Current System Status (August 2025)

### ✅ FULLY OPERATIONAL
- **Authentication**: Employee/Owner login with JWT Bearer tokens
- **Configuration Management**: Real-time multi-device sync with API integration
- **Cash Reconciliation**: Complete end-to-end workflow with bag number tracking
- **Owner Approval System**: Full approve/reject workflow with local/server sync
- **API Integration**: Live backend connection to Azure Functions
- **Deployment**: Production-ready on Azure Static Web Apps

### Live API Endpoints ✅
- **Base URL**: `https://func-smartbite-reconciliation.azurewebsites.net/api`
- **Authentication**: `POST /auth/login` - JWT token generation
- **Configuration**: `GET|PUT /config/system` - System settings with Bearer auth
- **Reconciliation**: `GET|POST /reconciliations` - Cash reconciliation data
- **Status**: All endpoints operational with proper authentication

## Technical Architecture

### Stack
- **React 18** + **Vite** - Component framework with fast build tooling
- **Tailwind CSS** - Utility-first styling
- **Azure Functions** - Serverless backend API
- **Azure Static Web Apps** - Hosting with GitHub Actions CI/CD

### Key Services
- **authService.js** - JWT authentication with Bearer tokens
- **configService.js** - System configuration with API-first approach
- **reconciliationService.js** - Cash reconciliation data management
- **apiClient.js** - Centralized HTTP client with error handling

## Project Structure

```
src/
├── components/layout/           # Layout components
├── features/auth/               # Authentication (LoginScreen.jsx)
├── modules/cash-reconciliation/ # Main reconciliation workflows
│   ├── EmployeeReconciliation.jsx
│   └── OwnerReconciliationReview.jsx
├── services/                    # API integration layer
│   ├── apiClient.js            # HTTP client with Bearer auth
│   ├── authService.js          # Authentication management
│   ├── configService.js        # Configuration API
│   └── reconciliationService.js
├── config/env.js               # Environment configuration
└── App.jsx                     # Main app component
```

## Current Technical State

### Live Demo Credentials
- **Employee**: `employee-001` / `employee789`
- **Manager**: `manager-001` / `manager456`
- **Owner**: `owner-001` / `owner123`

### Configuration API Schema
```javascript
// GET /config/system response:
{
  success: true,
  config: {
    registers: { count: 2, names: ["Register 1", "Register 2"], reserveAmount: 400, enabled: [true, true] },
    business: { name: "SmartBite Restaurant", timezone: "Australia/Sydney", currency: "AUD", taxRate: 0.10 },
    reconciliation: { dailyDeadline: "23:59", varianceTolerance: 5.00, requireManagerApproval: true },
    posTerminals: { count: 4, names: ["Terminal 1-4"], enabled: [true, true, true, false] }
  },
  timestamp: "2025-08-19T..."
}

// PUT /config/system - automatically cleans server fields before submission
```

### Authentication Flow
1. `authService.login(employeeId, pin)` → JWT Bearer token
2. Token auto-included in all API requests via `apiClient.js`
3. Role-based access (employee/owner) enforced server-side
4. Session persistence in localStorage with expiration handling

## Application Features

### 1. Multi-Step Cash Reconciliation
- **Register Counting**: Notes, coins, and coin rolls with automatic totals
- **EFTPOS Integration**: Multi-terminal tracking with real-time calculations
- **Banking Calculations**: Expected vs actual banking with variance analysis
- **Progress Navigation**: Clickable step progression with data persistence
- **Responsive Design**: Mobile-first UI with Tailwind CSS

### 2. Dynamic Configuration Management
- **Register Management**: Add/remove registers (1-10) with automatic name synchronization
- **POS Terminal Setup**: Up to 20 terminals with location settings
- **Business Settings**: Company info, timezone, currency, tax rates
- **Reconciliation Rules**: Daily deadlines, variance tolerance, approval workflows
- **Real-time Sync**: Owner changes instantly visible across all devices

### 3. Role-Based Authentication
- **Employee Access**: Cash reconciliation workflow
- **Owner Access**: Configuration management + reconciliation review
- **JWT Security**: Bearer token authentication with session persistence
- **Permission Enforcement**: Server-side role validation

## Development Context

### Service Layer Architecture
- **authService.js**: JWT authentication with role-based access
- **configService.js**: System configuration with automatic data cleaning
- **reconciliationService.js**: Cash reconciliation submission and retrieval
- **apiClient.js**: Centralized HTTP client with Bearer token injection

### Key Technical Patterns
- **API-First Approach**: Configuration synced from backend, not localStorage
- **Automatic Data Cleaning**: Server-side fields removed before PUT requests
- **Array Normalization**: Register/POS terminal arrays auto-synced with counts
- **Offline Fallback**: Local storage backup for when API unavailable
- **Error Handling**: Comprehensive error messages for all failure scenarios

### Environment Variables
- `VITE_API_BASE_URL`: Backend API endpoint
- `VITE_API_TIMEOUT`: Request timeout (30000ms)
- `VITE_APP_NAME`: Application name
- `VITE_APP_VERSION`: Version information

## Deployment

- **Platform**: Azure Static Web Apps
- **CI/CD**: GitHub Actions (automated on push to main)
- **Build**: Vite production build to `dist/` directory
- **Configuration**: `staticwebapp.config.json` for SPA routing

## Common Issues & Solutions

### React Component Patterns
- **Hook Ordering**: All useState/useEffect must come before conditional returns
- **useEffect Dependencies**: Use empty array `[]` for mount-only effects
- **State Updates**: Prefer functional updates for state based on previous state

### API Integration Issues
- **Authentication**: Ensure Bearer token included in all authenticated requests
- **Data Cleaning**: Remove server-side fields before PUT requests to avoid 400 errors
- **Array Synchronization**: Register/POS terminal counts must match name array lengths

### Configuration Management
- **API-First**: Always fetch fresh config from API, don't rely on localStorage
- **Normalization**: Use normalizeConfig() to fix mismatched arrays
- **Error Handling**: Handle 401/403 for auth issues, 400 for validation errors

### Development Scripts
- `npm run dev` - Development server (localhost:3000)
- `npm run build` - Production build
- `npm run preview` - Preview production build

---

**For AI Agents**: This system is fully operational with live API integration. Focus on maintaining the existing patterns and architecture when making changes.