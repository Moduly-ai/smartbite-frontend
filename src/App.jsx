import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import LoginScreen from './features/auth/LoginScreen';
import EmployeeReconciliation from './modules/cash-reconciliation/EmployeeReconciliation';
import OwnerDashboard from './components/layout/OwnerDashboard';
import ErrorBoundary from './components/shared/ErrorBoundary';
import LoadingSpinner from './components/shared/LoadingSpinner';
import { authService } from './services/authService';
import apiClient from './services/apiClient';

function App() {
  const [userSession, setUserSession] = useState(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'login', 'app'

  // Check session status on app load (JWT auth)
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Load token from storage if present
        try {
          const token = localStorage.getItem('smartbite-token');
          if (token) apiClient.setAuthToken(token);
        } catch {}
        const sessionStatus = await authService.getSessionStatus();
        
        if (sessionStatus.authenticated && sessionStatus.user) {
          setUserSession(sessionStatus.user);
          setCurrentView('app');
        }
      } catch (error) {
        // 401 errors are expected when not logged in - don't log as errors
        if (!error.message.includes('401')) {
          console.error('App: Failed to check session status:', error);
        }
        // If session check fails, user will see login screen
      } finally {
        setIsLoadingSession(false);
      }
    };

    checkSession();
    
    // Setup automatic session refresh
    authService.setupSessionRefresh();
  }, []);

  const handleLogin = async (user) => {
    setUserSession(user);
    setCurrentView('app');
  };

  const handleLogout = () => {
    // Immediately clear user session and redirect to landing
    setUserSession(null);
    setCurrentView('landing');
    try {
      localStorage.removeItem('smartbite-token');
      localStorage.removeItem('smartbite-user');
    } catch {}
    
    // Make logout API call in background - don't wait for it
    authService.logout().catch(error => {
      console.warn('Background logout API call failed:', error);
      // User is already logged out locally, so this failure doesn't matter
    });
  };

  const handleGetStarted = () => {
    setCurrentView('signup');
  };

  const handleSignIn = () => {
    setCurrentView('login');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  // Show loading while checking for existing session
  if (isLoadingSession) {
    return <LoadingSpinner fullScreen text="Initializing SmartBite..." />;
  }

  return (
    <ErrorBoundary>
      {/* Landing Page */}
      {currentView === 'landing' && (
        <LandingPage
          onGetStarted={handleGetStarted}
          onSignIn={handleSignIn}
        />
      )}

      {/* Login/Signup Screen */}
      {(currentView === 'login' || currentView === 'signup') && (
        <div className="min-h-screen bg-neutral-50">
          <LoginScreen 
            onLogin={handleLogin}
            initialView={currentView}
            onBackToLanding={handleBackToLanding}
          />
        </div>
      )}

      {/* App Views - Show appropriate dashboard based on user type */}
      {currentView === 'app' && userSession?.userType === 'owner' && (
        <div className="min-h-screen bg-neutral-50">
          <OwnerDashboard user={userSession} onLogout={handleLogout} />
        </div>
      )}

      {/* Default to employee reconciliation */}
      {currentView === 'app' && userSession && userSession.userType !== 'owner' && (
        <div className="min-h-screen bg-neutral-50">
          <div className="container mx-auto px-4 py-8">
            <header className="text-center mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-neutral-900 mb-2 font-display">SmartBite Cash Reconciliation</h1>
                <p className="text-neutral-900 opacity-70">Employee: {userSession.name}</p>
              </div>
              <button
                onClick={handleLogout}
                className="btn-secondary hover:bg-secondary hover:border-secondary text-secondary hover:text-white px-4 py-2 font-medium"
              >
                Logout
              </button>
            </header>
            
            <EmployeeReconciliation user={userSession} />
          </div>
        </div>
      )}
    </ErrorBoundary>
  );
}

export default App;