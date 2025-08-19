# SmartBite Frontend - Project Documentation

## Project Overview

**SmartBite Frontend** is a React-based cash reconciliation system designed for restaurant management. It provides a comprehensive solution for employees and owners to manage daily cash reconciliation processes with real-time calculations, validation, and secure API integration.

## Architecture & Technology Stack

### Frontend Stack
- **React 18** - Modern component-based UI framework
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **JavaScript (ES6+)** - Modern JavaScript features

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

## Core Features

### 1. Authentication System
- **Dual Login Types**: Employee and Owner authentication
- **Mock Authentication**: Demo credentials for testing
- **Session Management**: User state persistence
- **Role-Based Access**: Different interfaces for employees vs owners

**Demo Credentials:**
- Employee: `John Smith` / PIN: `1234`
- Owner: `Owner Admin` / PIN: `0000`

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

## API Integration

### Centralized API Client (`src/services/apiClient.js`)

```javascript
class ApiClient {
  // HTTP methods: GET, POST, PUT, DELETE
  // Timeout handling: 30-second default
  // Error management: Comprehensive error handling
  // Authentication: Bearer token support
  // Headers: Configurable request headers
}
```

### Reconciliation Service (`src/services/reconciliationService.js`)

**Key Methods:**
- `submitReconciliation()` - Submit cash reconciliation data
- `getReconciliations()` - Retrieve reconciliation history
- `getReconciliation(id)` - Get specific reconciliation
- `updateReconciliationStatus()` - Manager review functionality

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

### Current Status
The SmartBite Frontend is production-ready with comprehensive features, secure deployment pipeline, and proper documentation. The application successfully provides a complete cash reconciliation solution with modern web technologies and best practices.

---

**Last Updated**: August 19, 2025
**Version**: 1.0.0
**Deployment**: Azure Static Web Apps Ready
**CI/CD**: GitHub Actions Configured