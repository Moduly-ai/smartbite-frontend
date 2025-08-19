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
     --source https://github.com/YOUR_USERNAME/smartbite-frontend \
     --location "West US 2" \
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

The application uses a centralized API client (`src/services/apiClient.js`) for all HTTP requests with:

- Timeout handling
- Error management
- Authentication support
- Environment-based configuration

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