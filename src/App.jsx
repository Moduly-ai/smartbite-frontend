import React, { useState, useEffect } from 'react';
import LoginScreen from './features/auth/LoginScreen';
import EmployeeReconciliation from './modules/cash-reconciliation/EmployeeReconciliation';
import OwnerDashboard from './components/layout/OwnerDashboard';
import ErrorBoundary from './components/shared/ErrorBoundary';
import LoadingSpinner from './components/shared/LoadingSpinner';
import { authService } from './services/authService';

function App() {
  const [userSession, setUserSession] = useState(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // Check session status on app load (cookie-based authentication)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionStatus = await authService.getSessionStatus();
        
        if (sessionStatus.authenticated && sessionStatus.user) {
          setUserSession(sessionStatus.user);
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

  const handleLogin = async (loginData) => {
    // After successful login, get fresh session status to ensure we have latest user data
    try {
      const sessionStatus = await authService.getSessionStatus();
      if (sessionStatus.authenticated && sessionStatus.user) {
        setUserSession(sessionStatus.user);
      } else {
        // Fallback to login data if session status fails
        setUserSession(loginData);
      }
    } catch (error) {
      console.error('Failed to get session after login:', error);
      setUserSession(loginData); // Fallback to login data
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUserSession(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Clear user session even if API call fails
      setUserSession(null);
    }
  };

  // Show loading while checking for existing session
  if (isLoadingSession) {
    return <LoadingSpinner fullScreen text="Initializing SmartBite..." />;
  }

  return (
    <ErrorBoundary>
      {/* Show login screen if no user session */}
      {!userSession && (
        <div className="min-h-screen bg-gray-50">
          <LoginScreen onLogin={handleLogin} />
        </div>
      )}

      {/* Show appropriate dashboard based on user type */}
      {userSession?.userType === 'owner' && (
        <div className="min-h-screen bg-gray-50">
          <OwnerDashboard user={userSession} onLogout={handleLogout} />
        </div>
      )}

      {/* Default to employee reconciliation */}
      {userSession && userSession.userType !== 'owner' && (
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <header className="text-center mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">SmartBite Cash Reconciliation</h1>
                <p className="text-gray-600">Employee: {userSession.name}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium"
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