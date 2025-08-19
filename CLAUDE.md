# SmartBite Frontend - Project Documentation

## Project Overview

**SmartBite Frontend** is a React-based cash reconciliation system designed for restaurant management. It provides a comprehensive solution for employees and owners to manage daily cash reconciliation processes with real-time calculations, validation, and secure API integration.

## Current System Status (Updated: August 20, 2025)

### ⚠️ CRITICAL ISSUE: Configuration API Not Properly Implemented
**Status**: REQUIRES IMMEDIATE ATTENTION  
**Impact**: Multi-device configuration synchronization broken  
**Details**: See `API_INVESTIGATION_PROMPT.md` for complete analysis and action plan

### Recently Resolved Issues ✅
- **Employee Login Stuck**: Fixed React hooks ordering violation in EmployeeReconciliation.jsx
- **Debug Logging**: Cleaned up production code, removed console.log statements
- **Component Lifecycle**: Proper useEffect execution now works correctly

### Active API Endpoints
- **Base URL**: `https://func-smartbite-reconciliation.azurewebsites.net/api`
- **GET /config/system**: Responds but returns service metadata instead of config data
- **PUT /config/system**: Accepts data but doesn't store properly
- **Status**: Partially functional - needs complete backend implementation

## Architecture & Technology Stack

### Frontend Stack
- **React 18** - Modern component-based UI framework
- **Vite** - Fast build tool and development server (localhost:3000)
- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **JavaScript (ES6+)** - Modern JavaScript features

### Backend Integration
- **Azure Functions** - Serverless API backend (needs configuration endpoints)
- **API Client** - Centralized HTTP client with error handling
- **Configuration Service** - Manages system config with fallback to localStorage

### Development Tools
- **ESLint** - Code linting and quality assurance
- **PostCSS** - CSS processing and optimization
- **Hot Module Replacement** - Real-time development updates

### Deployment & CI/CD
- **Azure Static Web Apps** - Serverless hosting platform
- **GitHub Actions** - Automated CI/CD pipeline
- **Azure CLI** - Command-line deployment tools

## Project Structure

```
smartbite-frontend/
├── .github/workflows/           # GitHub Actions CI/CD
│   └── azure-static-web-apps.yml
├── dist/                        # Production build output
├── public/                      # Static assets
├── src/                         # Source code
│   ├── components/              # Reusable UI components
│   │   ├── layout/
│   │   │   └── OwnerDashboard.jsx
│   │   ├── shared/              # Shared components
│   │   └── ui/                  # UI-specific components
│   ├── config/                  # Configuration files
│   │   └── env.js               # Environment configuration
│   ├── features/                # Feature-specific components
│   │   └── auth/
│   │       └── LoginScreen.jsx
│   ├── modules/                 # Business logic modules
│   │   └── cash-reconciliation/
│   │       ├── EmployeeReconciliation.jsx
│   │       └── OwnerReconciliationReview.jsx
│   ├── services/                # API and service layer
│   │   ├── apiClient.js         # Centralized HTTP client
│   │   ├── reconciliationService.js
│   │   └── index.js             # Service exports
│   ├── types/                   # Type definitions
│   ├── utils/                   # Utility functions
│   ├── hooks/                   # Custom React hooks
│   ├── App.jsx                  # Main application component
│   ├── main.jsx                 # Application entry point
│   └── index.css                # Global styles
├── .env                         # Environment variables (local)
├── .env.example                 # Environment template
├── .env.production              # Production environment
├── .gitignore                   # Git ignore rules
├── deploy-azure.sh              # Azure deployment script
├── staticwebapp.config.json     # Azure Static Web Apps config
├── package.json                 # Dependencies and scripts
├── vite.config.js               # Vite configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── postcss.config.js            # PostCSS configuration
├── index.html                   # HTML template
├── README.md                    # Project documentation
└── CLAUDE.md                    # This file
```

## Current Development State

### Code Health Status ✅
- **src/modules/cash-reconciliation/EmployeeReconciliation.jsx**: FIXED - React hooks ordering violation resolved
- **src/services/configService.js**: CLEANED - Production ready, debug logging removed
- **src/services/authService.js**: CLEANED - Debug logging removed  
- **src/services/apiClient.js**: STABLE - HTTP client with proper error handling
- **src/features/auth/LoginScreen.jsx**: CLEANED - Production ready

### Configuration Service Architecture
```javascript
// Current API contract expected by frontend:
configService.getSystemConfig() -> {
  success: true,
  config: {
    registers: { count: N, names: [...], reserveAmount: N },
    posTerminals: { count: N, names: [...] },
    reconciliation: { varianceTolerance: N, requireManagerApproval: boolean }
  }
}

configService.updateSystemConfig(config) -> {
  success: true,
  config: { /* updated config */ },
  message: "Configuration updated successfully"
}
```

### Known Issues & Limitations
1. **Configuration Sync**: localStorage approach doesn't work across different devices
2. **API Implementation**: Backend endpoints exist but don't store/retrieve data properly
3. **Error Handling**: Falls back to default config when API fails
4. **Cache Strategy**: Simplified to avoid localStorage dependency issues

### Core Features

### 1. Authentication System
- **Dual Login Types**: Employee and Owner authentication
- **Mock Authentication**: Demo credentials for testing
- **Session Management**: User state persistence
- **Role-Based Access**: Different interfaces for employees vs owners

**Live API Credentials:**
- Employee: `employee-001` / PIN: `employee789`
- Manager: `manager-001` / PIN: `manager456`
- Owner: `owner-001` / PIN: `owner123`

### 2. Cash Reconciliation Process

#### Multi-Step Workflow:
1. **Register 1 Count** - Notes, loose coins, and coin bags/rolls
2. **Register 2 Count** - Same structure as Register 1
3. **Sales & EFTPOS** - Daily sales data and payment terminals
4. **Banking & Review** - Final calculations and submission

#### Key Features:
- **Real-time Calculations**: Automatic totals and variance calculations
- **Clickable Progress Steps**: Users can navigate directly to any step
- **Data Persistence**: Local storage backup for form data
- **Validation**: Input validation and error handling
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### 3. Cash Counting Components

#### Notes Section:
- $100, $50, $20, $10, $5 denominations
- Quantity-based counting
- Automatic total calculation

#### Loose Coins Section:
- $1, 50¢, 20¢, 10¢, 5¢ individual coins
- Count-based input system
- Real-time totals

#### Coin Bags/Rolls Section:
- $1 Roll ($20), $2 Roll ($50)
- 50¢ Roll ($10), 20¢ Roll ($4)
- 10¢ Roll ($4), 5¢ Roll ($2)
- Roll quantity tracking

### 4. EFTPOS Integration
- **4 Terminal Support**: Individual terminal tracking
- **Automatic Totaling**: Real-time EFTPOS total calculation
- **Sales Reconciliation**: Integration with daily sales figures

### 5. Banking Calculations
- **Expected Banking**: Sales - EFTPOS - Payouts
- **Actual Banking**: Register totals minus $400 reserve per register
- **Variance Analysis**: Automatic difference calculation
- **Status Indicators**: Visual feedback for balance accuracy

## Live API Integration

### Production API: `https://func-smartbite-reconciliation.azurewebsites.net/api`

### Authentication Service (`src/services/authService.js`)
- **Endpoint**: `POST /auth/login`
- **Method**: `login(employeeId, pin)`
- **Features**: JWT token management, role-based access, session persistence
- **Fallback**: Mock authentication when API unavailable

### Configuration Service (`src/services/configService.js`)
- **Endpoint**: `GET /config/system`, `PUT /config/system`
- **Features**: Dynamic system configuration, validation, caching
- **Fallback**: Default configuration with localStorage backup

### Reconciliation Service (`src/services/reconciliationService.js`)
- **Submit**: `POST /reconciliations` - Submit cash reconciliation data
- **Retrieve**: `GET /reconciliations` - Get reconciliation history with filtering
- **Update**: `PUT /reconciliations/{id}` - Update reconciliation status
- **Sync**: Local storage fallback with automatic sync when API available
- **Features**: Offline-first approach, pending reconciliation management

### Centralized API Client (`src/services/apiClient.js`)
- **Features**: Bearer token authentication, timeout handling, error management
- **Methods**: GET, POST, PUT, DELETE with consistent error handling
- **Security**: Automatic token injection, CORS handling

### Environment Configuration (`src/config/env.js`)

**Managed Variables:**
- `VITE_API_BASE_URL` - Backend API endpoint
- `VITE_API_TIMEOUT` - Request timeout settings
- `VITE_APP_NAME` - Application name
- `VITE_APP_VERSION` - Version information

## Deployment & DevOps

### Azure Static Web Apps Configuration

**File: `staticwebapp.config.json`**
- SPA routing configuration
- MIME type settings
- Cache control headers
- Navigation fallback handling

### GitHub Actions CI/CD Pipeline

**File: `.github/workflows/azure-static-web-apps.yml`**

**Pipeline Features:**
- **Trigger Events**: Push to main, Pull request events
- **Build Process**: Node.js 18, npm install, build
- **Testing**: Automated test execution
- **Environment Variables**: Secure injection from GitHub Secrets
- **Deployment**: Automatic deployment to Azure
- **Preview**: PR preview deployments

**Security Measures:**
- ✅ No secrets in repository code
- ✅ Environment variables via GitHub Secrets
- ✅ Build-time variable injection
- ✅ Azure API tokens secured
- ✅ Production environment isolation

### Deployment Options

#### 1. Automated Script Deployment
```bash
./deploy-azure.sh
```

#### 2. Manual Azure CLI Deployment
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

#### 3. GitHub Actions (Recommended)
- Push to main branch triggers deployment
- Pull requests generate preview URLs
- Environment variables managed securely

## Development Workflow

### Local Development Setup

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd smartbite-frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your API configuration
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   # Opens http://localhost:3000
   ```

### Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Create production build
- `npm run preview` - Preview production build locally
- `npm run lint` - Run code linting (if configured)

### Code Quality Standards

- **Component Structure**: Functional components with hooks
- **State Management**: Local state with useState/useEffect
- **Styling**: Tailwind CSS utility classes
- **API Calls**: Centralized service layer
- **Error Handling**: Comprehensive try-catch blocks
- **Responsive Design**: Mobile-first approach

## Security Implementation

### Frontend Security Measures

1. **Environment Variables**: Sensitive data managed via build-time injection
2. **API Client**: Centralized HTTP client with timeout and error handling
3. **Authentication**: Session-based user management
4. **Input Validation**: Form validation and sanitization
5. **HTTPS**: Production deployment over secure connections

### Production Security

1. **Azure Static Web Apps**: Built-in DDoS protection and CDN
2. **GitHub Secrets**: Encrypted environment variable storage
3. **CI/CD Security**: Automated security scanning capabilities
4. **API Integration**: Secure communication with backend services

## Performance Optimization

### Build Optimization
- **Vite Build Tool**: Fast bundling and optimization
- **Code Splitting**: Automatic chunk splitting for faster loading
- **Asset Optimization**: CSS and JavaScript minification
- **Tree Shaking**: Unused code elimination

### Runtime Performance
- **React 18**: Latest React features and optimizations
- **Lazy Loading**: Component-level code splitting capabilities
- **Local Storage**: Client-side data persistence
- **Responsive Images**: Optimized asset delivery

## API Integration Details

### Backend Communication
- **Base URL**: Configurable via environment variables
- **Authentication**: Employee name header for tracking
- **Error Handling**: Comprehensive error response management
- **Timeout Management**: 30-second default timeout
- **Retry Logic**: Built-in retry capabilities

### Data Flow
1. **User Input**: Form data collection and validation
2. **Local Storage**: Automatic backup of form state
3. **API Submission**: Secure transmission to backend
4. **Response Handling**: Success/error state management
5. **User Feedback**: Real-time status updates

## Testing Strategy

### Development Testing
- **Manual Testing**: Comprehensive user flow testing
- **Browser Testing**: Cross-browser compatibility
- **Responsive Testing**: Mobile and desktop verification
- **API Testing**: Backend integration verification

### Production Testing
- **Build Testing**: Automated build verification
- **Deployment Testing**: Azure deployment validation
- **Performance Testing**: Load time and responsiveness
- **Security Testing**: Vulnerability assessment

## Maintenance & Updates

### Version Control
- **Git Workflow**: Feature branch development
- **Pull Requests**: Code review process
- **Semantic Versioning**: Clear version management
- **Release Notes**: Change documentation

### Monitoring & Logging
- **Azure Monitoring**: Built-in Azure Static Web Apps analytics
- **Error Tracking**: Frontend error logging
- **Performance Monitoring**: Core Web Vitals tracking
- **User Analytics**: Usage pattern analysis

## Future Enhancements

### Planned Features
1. **TypeScript Migration**: Enhanced type safety
2. **Unit Testing**: Jest and React Testing Library
3. **E2E Testing**: Playwright or Cypress integration
4. **PWA Features**: Offline capability and app installation
5. **Advanced Analytics**: Detailed reporting dashboard

### Technical Improvements
1. **State Management**: Redux or Zustand for complex state
2. **Component Library**: Reusable component system
3. **Internationalization**: Multi-language support
4. **Accessibility**: WCAG compliance improvements
5. **Performance**: Advanced optimization techniques

## Support & Documentation

### Getting Help
- **README.md**: Quick start guide and basic documentation
- **CLAUDE.md**: Comprehensive project documentation (this file)
- **Code Comments**: Inline documentation for complex logic
- **API Documentation**: Service layer documentation

### Contributing Guidelines
1. **Code Style**: Follow existing patterns and conventions
2. **Testing**: Include tests for new features
3. **Documentation**: Update relevant documentation
4. **Security**: Follow security best practices
5. **Performance**: Consider performance implications

## Project Milestones

### Completed Features ✅
- ✅ React application setup with Vite
- ✅ Tailwind CSS integration and styling
- ✅ Authentication system (Employee/Owner)
- ✅ Multi-step cash reconciliation process
- ✅ Real-time calculations and validation
- ✅ Clickable progress navigation
- ✅ Responsive design implementation
- ✅ Centralized API client architecture
- ✅ Environment variable management
- ✅ Azure deployment configuration
- ✅ GitHub Actions CI/CD pipeline
- ✅ Security implementation
- ✅ Documentation and README

### Current Status - Live API Integration Complete ✅
The SmartBite Frontend is production-ready with **live API integration** to Azure Functions backend. All services are connected to the actual API endpoints with comprehensive fallback mechanisms. The application provides a complete end-to-end cash reconciliation solution with:

- **Live Authentication**: Real user management via API
- **Dynamic Configuration**: System settings managed through API
- **Real-time Reconciliation**: Live submission and retrieval of reconciliation data
- **Owner Management**: Full CRUD operations for system administration
- **Offline-first Architecture**: Continues working when API is unavailable
- **Automatic Synchronization**: Local data syncs when connection is restored

---

## CRITICAL BUG - Employee Login Configuration Loading Issue

### Current Problem
The Employee login successfully authenticates with the API but gets **permanently stuck** on "Loading configuration..." screen. The `EmployeeReconciliation` component never progresses beyond the loading state.

### Detailed Issue Analysis

#### What Works ✅
- Authentication API call succeeds (200 response)
- User session stored correctly in localStorage
- JWT token properly received and stored
- Component mounts successfully
- Access check passes (`hasAccess: true`)
- State shows `isLoadingConfig: true`

#### What Fails ❌
- **useEffect hook never executes** in EmployeeReconciliation component
- No configuration API call is made to `/config/system`
- Component remains in permanent loading state
- User cannot access reconciliation form

#### Logs Pattern
```javascript
// ✅ WORKING: Authentication flow
LoginScreen: Attempting login...
AuthService: Login API response: {success: true, user: {...}, token: '...'}
App: User session set to: {...}

// ✅ WORKING: Component mounting
EmployeeReconciliation: Component mounted/rendered with user: {...}
EmployeeReconciliation: Access check result: {hasAccess: true, userType: 'employee'}
EmployeeReconciliation: isLoadingConfig = true
EmployeeReconciliation: Showing loading state

// ❌ MISSING: Configuration loading
// Should see: "EmployeeReconciliation: useEffect running, hasAccess = true"
// Should see: "ConfigService: Making API call to /config/system"
// Never happens!
```

### Root Cause Hypothesis
The React `useEffect` hook in `EmployeeReconciliation.jsx` is not executing despite component mounting successfully. This suggests:
1. Component render cycle issue
2. React lifecycle problem
3. State dependency issue with `useEffect([hasAccess])`
4. Possible infinite re-render loop preventing useEffect execution

### Debug Modifications Made (NEED REVERSION)
**All debug changes should be removed for production:**

#### Files Modified for Debugging:
1. **`src/App.jsx`**
   - Added session restoration logging
   - Added handleLogin logging
   - **REVERT**: Remove all `console.log` statements

2. **`src/features/auth/LoginScreen.jsx`**
   - Added pre-populated demo credentials
   - Added login process logging
   - **KEEP**: Demo credentials (useful feature)
   - **REVERT**: Remove debug logging

3. **`src/services/authService.js`**
   - Added comprehensive login flow logging
   - **REVERT**: Remove all debug `console.log` statements

4. **`src/services/apiClient.js`**
   - Added request/response logging
   - **REVERT**: Remove all debug `console.log` statements

5. **`src/services/configService.js`**
   - Added API call logging
   - **REVERT**: Remove all debug `console.log` statements

6. **`src/modules/cash-reconciliation/EmployeeReconciliation.jsx`**
   - Added extensive component lifecycle logging
   - Modified useEffect dependency from `[]` to `[hasAccess]`
   - Added state and access check logging
   - **REVERT**: Remove all debug logging, fix useEffect

7. **`src/modules/cash-reconciliation/OwnerReconciliationReview.jsx`**
   - Added safe property access with optional chaining
   - **KEEP**: Safe property access (bug fix)
   - **REVERT**: Any debug logging

8. **`staticwebapp.config.json`**
   - Fixed route configuration for proper static file serving
   - **KEEP**: This is a necessary fix

### Recommended Solution Approach

#### 1. Simple useEffect Fix (Try First)
```javascript
// In EmployeeReconciliation.jsx
useEffect(() => {
  const loadConfig = async () => {
    try {
## Development History & Context

### August 20, 2025 - Configuration API Crisis Resolution
**Issue**: Employee login stuck on "Loading configuration..." with configuration changes not syncing between owner and employee devices.

**Root Causes Identified**:
1. React hooks ordering violation in EmployeeReconciliation.jsx preventing useEffect execution
2. Configuration API endpoints responding but not actually storing/retrieving data
3. localStorage caching strategy failing across different devices

**Actions Taken**:
1. ✅ **Fixed React Component**: Moved all useState/useEffect hooks before conditional returns
2. ✅ **Cleaned Production Code**: Removed debug logging from all service files  
3. ✅ **Simplified Configuration Service**: Removed complex caching logic
4. ⚠️ **Identified API Gap**: Backend needs proper configuration storage implementation

**Current State**: Frontend code is production-ready but depends on backend API fixes for full functionality.

### Key Technical Decisions
- **React Hooks**: Strict adherence to hooks rules - all hooks before any conditional logic
- **Error Handling**: Graceful fallback to default configuration when API unavailable
- **Service Architecture**: Centralized API client with consistent error handling
- **Cache Strategy**: Abandoned localStorage for cross-device sync (requires proper API)

### Development Best Practices Applied
- **Console Logging**: Removed all debug logging for production deployment
- **Component Lifecycle**: Proper useEffect dependency management
- **API Integration**: Consistent response format across all service calls
- **Error Boundaries**: Comprehensive try-catch blocks with fallback behavior

---

## Technical Reference - React Hooks Fix (Historical)

### Problem Resolution Pattern
The following pattern was used to fix the React hooks violation:

```javascript
// ❌ WRONG - Hooks after conditional return
const SomeComponent = () => {
  if (condition) return <div>Loading...</div>;
  
  const [state, setState] = useState(null); // ❌ Hook after return
  useEffect(() => {}, []); // ❌ Hook after return
};

// ✅ CORRECT - All hooks before any returns
const SomeComponent = () => {
  const [state, setState] = useState(null); // ✅ Hook at top
  useEffect(() => {}, []); // ✅ Hook at top
  
  if (condition) return <div>Loading...</div>; // ✅ Return after hooks
};
```

This pattern ensures React hooks execute in consistent order on every render.

### Production Cleanup Required

#### Files to Clean:
1. Remove debug logging from all service files
2. Remove component lifecycle logging
3. Keep functional fixes (safe property access, static file routing)
4. Test both employee and owner login flows

#### Verification Steps:
1. Employee login should proceed directly to reconciliation form
2. Owner login should proceed to dashboard without crashes
3. Configuration API should be called (check network tab)
4. No debug logs in production console

### Current Project State
- **Authentication**: ✅ Working perfectly with live API
- **Owner Login**: ✅ Working (after property access fixes)
- **Employee Login**: ❌ BLOCKED - Stuck on config loading
- **API Integration**: ✅ All endpoints working
- **Deployment**: ✅ Successfully deployed to Azure

### Priority Actions
1. **URGENT**: Fix EmployeeReconciliation useEffect execution
2. **HIGH**: Remove all debug logging for production
3. **MEDIUM**: Test end-to-end flows
4. **LOW**: Performance optimization

---

**Last Updated**: August 19, 2025 - CRITICAL BUG DOCUMENTATION
**Version**: 1.0.0 - DEBUGGING STATE
**Status**: EMPLOYEE LOGIN BLOCKED - NEEDS IMMEDIATE FIX
**Deployment**: Azure Static Web Apps (with debug code)
**CI/CD**: GitHub Actions Configured