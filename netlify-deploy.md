# 🚀 SmartBite Frontend - Complete Netlify Deployment Guide

## 📋 QUICK START GUIDE

**Ready to deploy? Follow this streamlined process:**

1. **✅ Prerequisites Met:** CI/CD pipeline files already committed to your repository
2. **🔧 Setup Netlify:** Create account & import your repository  
3. **🔑 Add Secrets:** Configure GitHub Actions secrets for automated deployments
4. **🌐 Configure Domain:** Point `smartbiteapp.moduly.ai` to your Netlify site
5. **🚀 Deploy:** Push to Git → Automatic deployment with health checks

---

## 🎯 DEPLOYMENT STATUS: READY TO DEPLOY

Your SmartBite frontend is **FULLY CONFIGURED** with professional CI/CD pipeline and ready for production deployment to `smartbiteapp.moduly.ai`.

### ✅ What's Already Configured:
- **CI/CD Pipeline:** Complete GitHub Actions workflow (`.github/workflows/deploy.yml`)
- **Environment Management:** Production & staging configurations (`.env.production`, `.env.staging`)
- **Build Configuration:** Netlify settings with security headers (`netlify.toml`)
- **SPA Support:** React Router redirects (`public/_redirects`)
- **Security Headers:** Production-ready headers (`public/_headers`)
- **Build Optimizations:** Enhanced Vite configuration with environment loading

### 🌟 Pipeline Features:
- **4-Stage Deployment:** Build → Test → Deploy → Health Check → Notify
- **Multi-Environment:** `main` → Production, `develop` → Staging, `feature/*` → Previews
- **Quality Gates:** Automated testing, linting, and health checks
- **Monitoring:** Real-time deployment status and notifications

---

## 🏗️ DEPLOYMENT ARCHITECTURE

### Production Setup:
```
GitHub Repository → GitHub Actions → Netlify → smartbiteapp.moduly.ai
     ↓                    ↓              ↓            ↓
 CI/CD Pipeline    Build & Test    Global CDN    Production App
```

### Multi-Site Management:
```
moduly.ai          (Your existing marketing website)
├── smartbiteapp.moduly.ai  (SmartBite application - NEW SITE)
└── Future subdomains (api.moduly.ai, docs.moduly.ai, etc.)
```

---

## 🚀 STEP-BY-STEP DEPLOYMENT

### Step 1: Create Netlify Site

#### 1.1 Setup Netlify Account
1. **Go to [netlify.com](https://netlify.com)**
2. **Sign up with GitHub** (recommended for seamless integration)
3. **Connect your repositories** (automatic with GitHub signup)

#### 1.2 Import SmartBite Repository
1. **Click "New site from Git"** on Netlify dashboard
2. **Choose GitHub** as your Git provider
3. **Select `smartbite-frontend`** repository from the list
4. **Configure Build Settings:**
   ```
   Build command: npm run build
   Publish directory: dist  
   Base directory: (leave empty)
   ```

#### 1.3 Deploy Initial Site
1. **Click "Deploy Site"** - Netlify will build automatically
2. **Monitor build logs** for any errors (usually takes 2-3 minutes)
3. **Note your temporary URL** (e.g., `https://amazing-name-123456.netlify.app`)
4. **Test the deployment** - verify SmartBite loads correctly

### Step 2: Configure Custom Domain (smartbiteapp.moduly.ai)

#### 2.1 Add Custom Domain in Netlify
1. **Go to Site Settings → Domain Management**
2. **Click "Add a domain you already own"**
3. **Enter:** `smartbiteapp.moduly.ai`
4. **Click "Verify"** - shows "not yours yet" (expected)
5. **Click "Add domain"** anyway
6. **Note the DNS target** provided (usually `your-site-name.netlify.app`)

#### 2.2 Configure DNS (At Your Domain Provider)
**Find where you manage moduly.ai DNS (Cloudflare, GoDaddy, Namecheap, etc.)**

1. **Login to your DNS provider**
2. **Go to DNS management for moduly.ai**
3. **Add CNAME Record:**
   ```
   Type: CNAME
   Name: smartbiteapp
   Value: your-smartbite-site.netlify.app
   TTL: Auto or 3600 (1 hour)
   ```

**DNS Provider Specific Instructions:**

**Cloudflare:**
- DNS → Records → Add record
- Type: CNAME, Name: `smartbiteapp`, Content: `smartbiteapp.netlify.app`
- Proxy status: OFF (gray cloud) initially

**GoDaddy:**
- DNS Management → Add Record
- Type: CNAME, Host: `smartbiteapp`, Points to: `smartbiteapp.netlify.app`

**Namecheap:**
- Advanced DNS → Add New Record  
- Type: CNAME Record, Host: `smartbiteapp`, Value: `smartbiteapp.netlify.app`

#### 2.3 Verify Domain Setup
1. **If using Netlify DNS (like moduly.ai):**
   - ✅ **Automatic Setup:** Domain and SSL configured automatically
   - ✅ **No DNS changes needed:** Skip manual CNAME configuration
   - ✅ **SSL Certificate:** Let's Encrypt automatically provisioned

2. **If using External DNS Provider (GoDaddy, Cloudflare, etc.):**
   - Follow the CNAME configuration steps above
   - Wait for DNS propagation (5-30 minutes)
   - Test: `nslookup smartbiteapp.moduly.ai` should return Netlify's IP

3. **Test Your Live Site:**
   - **Visit:** `https://smartbiteapp.moduly.ai`
   - **Verify SSL:** Green lock in browser
   - **Test functionality:** Login and core features work

## 🎉 **CONGRATULATIONS! Your Site is Live**

**✅ SmartBite is now successfully deployed at `https://smartbiteapp.moduly.ai`**

Your basic deployment is complete! The following steps are **optional enhancements** for professional development workflows.

---

### Step 3: (Optional) Configure GitHub Actions CI/CD Pipeline

**Current Setup:** Netlify automatically builds when you push to Git
**Enhancement:** Add advanced CI/CD with testing, health checks, and deployment notifications

#### 3.1 Get Required Secrets

**Get Netlify Auth Token:**
1. **Go to [Netlify Dashboard](https://app.netlify.com)**
2. **Click your profile → User Settings → Applications**
3. **Scroll to "Personal access tokens"**
4. **Click "New access token"**
5. **Name:** `SmartBite GitHub Actions`
6. **Copy the token** (starts with `nfp_`)

**Get Netlify Site ID:**
1. **Go to your SmartBite site in Netlify**
2. **Site Settings → General → Site Details**
3. **Copy "Site ID"** (format: `12345678-abcd-1234-5678-123456789abc`)

#### 3.2 Add Secrets to GitHub Repository
1. **Go to your GitHub repository**
2. **Settings → Secrets and variables → Actions**
3. **Click "New repository secret"**
4. **Add ALL required secrets:**

**Deployment Secrets:**
```
Name: NETLIFY_AUTH_TOKEN
Value: nfp_your_token_here

Name: NETLIFY_SITE_ID  
Value: your-site-id-here
```

**Environment Configuration Secrets (Detailed):**

#### 🌐 **API Configuration Secrets**

```
Name: VITE_API_BASE_URL_PROD
Value: https://func-smartbite-reconciliation.azurewebsites.net/api
Where to get: Your Azure Functions production API URL
└── Azure Portal → Function Apps → Your SmartBite API → Overview → URL
└── Remove trailing slashes, add '/api' suffix

Name: VITE_API_BASE_URL_STAGING  
Value: https://func-smartbite-reconciliation-staging.azurewebsites.net/api
Where to get: Your Azure Functions staging API URL (if you have one)
└── If no staging API: Use same as production for now
└── For separate staging: Deploy second Azure Function App

Name: VITE_API_TIMEOUT
Value: 30000
Where to get: Standard value (30 seconds in milliseconds)
└── Increase if your API calls are slow: 45000 (45 sec), 60000 (60 sec)
└── Decrease for faster timeout: 15000 (15 sec), 10000 (10 sec)
```

#### 📱 **Application Configuration Secrets**

```
Name: VITE_APP_NAME
Value: SmartBite Frontend
Where to get: Your application display name
└── Used in browser title, notifications, error messages
└── Can be: "SmartBite Cash Reconciliation", "SmartBite POS", etc.

Name: VITE_APP_VERSION_PROD
Value: 1.0.0
Where to get: Your current production version
└── Use semantic versioning: 1.0.0, 1.1.0, 2.0.0
└── Update manually when releasing new features

Name: VITE_APP_VERSION_STAGING
Value: staging
Where to get: Fixed value for staging builds
└── Can be: "staging", "beta", "dev", or version like "1.1.0-beta"

Name: VITE_APP_DOMAIN
Value: smartbiteapp.moduly.ai
Where to get: Your custom domain (without https://)
└── This is the domain you configured in Step 2
└── Used for CORS configuration and internal references

Name: VITE_APP_URL
Value: https://smartbiteapp.moduly.ai
Where to get: Your full production URL (with https://)
└── This is your live site URL
└── Used for health checks and deployment notifications
```

#### 📊 **Logging Configuration Secrets**

```
Name: VITE_LOG_LEVEL_PROD
Value: error
Where to get: Choose logging level for production
└── Options: "error" (recommended), "warn", "info", "debug"
└── "error" = only show critical errors (fastest, least noise)

Name: VITE_LOG_LEVEL_STAGING  
Value: info
Where to get: Choose logging level for staging/testing
└── Options: "debug" (most detailed), "info" (recommended), "warn", "error"
└── "info" = show general info + errors (good for debugging)
```

#### 📈 **Optional Analytics Secrets**

```
Name: VITE_GOOGLE_ANALYTICS_ID
Value: (leave empty or add GA-XXXXXXXXX)
Where to get: Google Analytics dashboard
└── Google Analytics → Admin → Property Settings → Tracking ID
└── Format: GA-XXXXXXXXX or G-XXXXXXXXXX (GA4)
└── Leave empty if not using Google Analytics

Name: VITE_SENTRY_DSN
Value: (leave empty or add your Sentry DSN) 
Where to get: Sentry.io dashboard (error tracking service)
└── Sentry → Project Settings → Client Keys (DSN)
└── Format: https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
└── Leave empty if not using error tracking
```

#### 3.3 Enable GitHub Actions
1. **Go to Actions tab** in your repository
2. **Enable workflows** if prompted
3. **Pipeline will run automatically** on your next push

#### 3.4 Add SIT Environment Support (Optional)
If you want a separate SIT environment:

```
Name: VITE_API_BASE_URL_SIT
Value: https://func-smartbite-sit.azurewebsites.net/api
Where to get: Your SIT Azure Functions API URL

Name: VITE_API_SIT_KEY
Value: your-sit-function-key
Where to get: Azure Portal → SIT Function App → App Keys → Function Keys
```

## 🚀 **How Deployment Works:**

### **Current Setup (Basic Netlify):**
```
Git Push → Netlify Auto-Build → Live Site
```

### **With GitHub Actions (Enhanced):**
```
Git Push → GitHub Actions → Tests → Build → Deploy to Netlify → Health Check
```

## 📋 **Deployment by Environment:**

### **For Production Deployment:**
```bash
git checkout main
git add .
git commit -m "feat: your changes"
git push origin main
# → Deploys to smartbiteapp.moduly.ai with production config
```

### **For Staging Deployment:**
```bash
git checkout develop  # or create develop branch
git add .
git commit -m "feat: staging changes"
git push origin develop
# → Creates deploy preview with staging config
```

### **For SIT Deployment (if configured):**
```bash
git checkout sit  # or create sit branch
git add .
git commit -m "feat: sit testing"
git push origin sit
# → Creates deploy preview with SIT config
```

### Step 4: (Optional) Test Automated Deployment

**Note:** Only complete this if you set up GitHub Actions in Step 3.

#### 4.1 Trigger Pipeline
```bash
# Make a test change and push to trigger pipeline
git checkout main
echo "# Test deployment" >> README.md
git add README.md
git commit -m "test: trigger deployment pipeline"
git push origin main
```

#### 4.2 Monitor Pipeline
1. **Go to Actions tab** in GitHub
2. **Watch "🚀 Deploy SmartBite to Netlify" workflow**
3. **Monitor each stage:**
   - 🔨 Build & Test (dependencies, linting, build)
   - 🌐 Deploy (deployment to Netlify)
   - 🏥 Health Check (production verification)
   - 📢 Notify (deployment summary)

#### 4.3 Verify Production Deployment
1. **Visit https://smartbiteapp.moduly.ai**
2. **Verify SSL certificate** (green lock in browser)
3. **Test core functionality:**
   - Login with demo credentials
   - Navigate through reconciliation flow
   - Check browser console for errors
4. **Test mobile responsiveness**

---

---

## ✅ **DEPLOYMENT COMPLETE**

**Your SmartBite application is now live and accessible at:**
**🌐 https://smartbiteapp.moduly.ai**

### **What's Working:**
- ✅ **Live Site:** SmartBite cash reconciliation system
- ✅ **Custom Domain:** Professional smartbiteapp.moduly.ai URL
- ✅ **SSL Certificate:** Secure HTTPS with Let's Encrypt
- ✅ **Automatic Deployments:** Netlify builds on Git push
- ✅ **Global CDN:** Fast loading worldwide

### **Basic Workflow:**
```
Code Changes → Git Push → Netlify Build → Live on smartbiteapp.moduly.ai
```

---

## 🚀 **OPTIONAL: Advanced Development Workflow**

The following sections are for teams wanting professional CI/CD pipelines with testing and monitoring.

## 🔄 DEVELOPMENT WORKFLOW (Advanced)

### Branch Strategy (Already Configured)
```
main branch     → Production (smartbiteapp.moduly.ai)
develop branch  → Staging (deploy previews)
feature/* branches → Deploy previews (temporary URLs)
```

### Daily Development Workflow

#### 1. Feature Development
```bash
# Create feature branch from develop
git checkout develop
git checkout -b feature/new-feature

# Make changes, commit, and push
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature

# ✅ Pipeline automatically creates deploy preview
# 🔗 Preview URL posted in GitHub PR comments
```

#### 2. Staging Deployment
```bash
# Merge feature to develop for staging
git checkout develop
git merge feature/new-feature
git push origin develop

# ✅ Pipeline automatically:
#   - Runs tests & linting  
#   - Builds with staging config
#   - Deploys to staging environment
```

#### 3. Production Release
```bash
# Release to production
git checkout main
git merge develop
git push origin main

# ✅ Pipeline automatically:
#   - Runs full test suite
#   - Builds with production config
#   - Deploys to app.moduly.ai
#   - Runs health checks
#   - Notifies on success/failure
```

### Pipeline Monitoring

**View Pipeline Status:**
- GitHub repo → Actions tab
- Real-time logs for each deployment stage
- Email notifications on failures

**Manual Deployment Trigger:**
- Actions tab → "🚀 Deploy SmartBite to Netlify"
- Click "Run workflow" → Select branch
- Useful for hotfixes or rollbacks

**Deployment Status Indicators:**
- ✅ Green checkmark = Successful deployment
- ❌ Red X = Failed deployment (check logs)
- 🟡 Yellow dot = Pipeline in progress
- ⚪ Gray circle = Pipeline queued

---

## 🔧 ENVIRONMENT MANAGEMENT (GitHub Secrets)

### Environment Configuration via GitHub Secrets

**All environment variables are now managed through GitHub Secrets for better security and centralized management.**

#### Production Environment (`main` branch)
- **Domain:** `smartbiteapp.moduly.ai` (from `VITE_APP_DOMAIN` secret)
- **Config:** GitHub Secrets (production values)
- **API:** `VITE_API_BASE_URL_PROD` secret
- **Features:** Stable features only, error logging, optimized builds

#### Staging Environment (`develop` branch)
- **Domain:** Deploy preview URLs
- **Config:** GitHub Secrets (staging values)  
- **API:** `VITE_API_BASE_URL_STAGING` secret
- **Features:** Beta features enabled, debug logging, development aids

### GitHub Secrets Configuration

**The pipeline automatically uses these secrets based on branch:**

#### Production Secrets (main branch):
```
VITE_API_BASE_URL_PROD → Production API endpoint
VITE_APP_VERSION_PROD → Production version (1.0.0)
VITE_LOG_LEVEL_PROD → Error-level logging only
VITE_DEBUG_MODE → false (hardcoded for security)
VITE_FEATURE_ADVANCED_REPORTING → false
```

#### Staging Secrets (develop branch):
```
VITE_API_BASE_URL_STAGING → Staging API endpoint  
VITE_APP_VERSION_STAGING → staging
VITE_LOG_LEVEL_STAGING → Info-level logging
VITE_DEBUG_MODE → true (hardcoded for development)
VITE_FEATURE_ADVANCED_REPORTING → true
```

### Benefits of GitHub Secrets Management:
- **🔒 Security:** No sensitive config in repository
- **🔄 Centralized:** Update config without code changes
- **🌍 Team Access:** Managed via GitHub repository permissions
- **📋 Audit Trail:** Changes tracked in GitHub
- **🚀 Deployment:** Automatic environment switching

---

## 🛠️ TROUBLESHOOTING

### Common Deployment Issues

#### ❌ Build Failures
**Symptoms:** Red X in GitHub Actions, build logs show errors
**Solutions:**
1. Check Actions logs for specific error
2. Verify dependencies: `npm ci && npm run build` locally
3. Ensure Node.js 18+ in environment
4. Check for TypeScript errors or linting issues

#### ❌ Deployment Failures  
**Symptoms:** Build succeeds but deployment fails
**Solutions:**
1. Verify GitHub secrets are set correctly
2. Check Netlify site ID matches your site
3. Ensure Netlify auth token has deployment permissions
4. Check Netlify build logs in dashboard

#### ❌ DNS/SSL Issues
**Symptoms:** app.moduly.ai not accessible or SSL warnings
**Solutions:**
1. Wait longer for DNS propagation (up to 24 hours)
2. Test DNS: `nslookup app.moduly.ai 8.8.8.8`
3. In Netlify, try "Renew certificate" in Domain Management
4. Verify CNAME record points to correct Netlify site

#### ❌ Health Check Failures
**Symptoms:** Pipeline fails at health check stage
**Solutions:**
1. Check if app.moduly.ai loads in browser
2. Verify Azure Functions CORS allows new domain
3. Re-run pipeline (may be temporary propagation delay)
4. Check network connectivity to API endpoints

#### ❌ API Integration Issues
**Symptoms:** App loads but API calls fail
**Solutions:**
1. Update Azure Functions CORS settings:
   ```
   Allowed origins: https://app.moduly.ai
   ```
2. Verify environment variables match your API endpoints
3. Check browser Network tab for specific API errors
4. Test API endpoints directly in browser or Postman

---

## ✅ PRODUCTION DEPLOYMENT CHECKLIST

### Pre-Deployment Verification
- [ ] **Repository Setup:** All pipeline files committed and pushed
- [ ] **GitHub Secrets:** `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` added
- [ ] **Netlify Site:** Created and successfully building
- [ ] **DNS Configuration:** CNAME record `app` points to Netlify site
- [ ] **SSL Certificate:** HTTPS working at app.moduly.ai

### Pipeline Verification
- [ ] **GitHub Actions:** Workflows tab shows pipeline enabled
- [ ] **Initial Pipeline Run:** First push triggers successful pipeline
- [ ] **Build Stage:** Dependencies install, linting passes, build completes
- [ ] **Deploy Stage:** Deployment to Netlify succeeds
- [ ] **Health Check:** Production health check passes

### Production Verification
- [ ] **Core Functionality:** Login/authentication works
- [ ] **API Connectivity:** Azure Functions API responds correctly
- [ ] **SPA Routing:** All routes work (test refresh on different pages)
- [ ] **Mobile Responsiveness:** App works on mobile devices
- [ ] **Performance:** Fast loading via global CDN
- [ ] **Browser Console:** No critical JavaScript errors

### Operational Readiness
- [ ] **CORS Configuration:** Azure Functions allows app.moduly.ai origin
- [ ] **Error Monitoring:** Deployment notifications configured
- [ ] **Team Access:** Development team has GitHub repository access
- [ ] **Documentation:** Team understands Git-based deployment workflow
- [ ] **Rollback Plan:** Know how to revert problematic deployments

---

## 🎉 FINAL DEPLOYMENT SUMMARY

**Your SmartBite system is successfully deployed with:**

### **✅ BASIC DEPLOYMENT (Complete):**
- **Live Application:** https://smartbiteapp.moduly.ai
- **Secure Access:** HTTPS with automatic SSL certificates
- **Professional Domain:** Custom subdomain on your domain
- **Automatic Builds:** Netlify builds on every Git push
- **Global Performance:** Worldwide CDN for fast loading

### **🚀 ADVANCED FEATURES (Optional):**

If you completed the optional GitHub Actions setup, you also have:

### ✨ **Modern CI/CD Pipeline**
- **Automated Deployments:** Git push → automatic deployment
- **Multi-Environment Support:** Production, staging, and preview environments
- **Quality Gates:** Testing, linting, and health checks before deployment
- **Real-Time Monitoring:** GitHub Actions with deployment status tracking

### 🌐 **Production-Ready Hosting**
- **Global CDN:** Lightning-fast loading worldwide via Netlify
- **Automatic SSL:** HTTPS certificates managed automatically
- **Security Headers:** Production security best practices enforced
- **Performance Optimization:** Asset compression and caching

### 🚀 **Professional DevOps Workflow**
- **Branch-Based Deployments:** Feature → Staging → Production flow
- **Deploy Previews:** Test features before merging
- **Health Monitoring:** Automatic verification of production deployments
- **Team Collaboration:** PR status checks and deployment notifications

### 📊 **Architecture Benefits**
- **Separate from moduly.ai:** Independent site management
- **Scalable Infrastructure:** Ready for multiple applications
- **Professional Subdomain:** Industry-standard `app.moduly.ai` URL
- **Future-Proof:** Easy to add api.moduly.ai, docs.moduly.ai, etc.

---

## 🔗 **FINAL RESULT**

**Push code to Git → Automatic deployment to `https://smartbiteapp.moduly.ai`**

Your SmartBite cash reconciliation system is now live with enterprise-grade deployment infrastructure, automatic testing, and professional monitoring. Every code change flows through a complete CI/CD pipeline ensuring quality and reliability.

**Next Steps:** Start developing features using the established Git workflow, and watch your changes automatically deploy to production! 🚀