import React, { useState, useEffect } from 'react';
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

  // Restore session on app load
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const session = authService.getSession();
        
        if (session && session.user) {
          // Restore the auth token for API calls
          apiClient.setAuthToken(session.token);
          setUserSession(session.user);
        }
      } catch (error) {
        console.error('App: Failed to restore session:', error);
      } finally {
        setIsLoadingSession(false);
      }
    };

    restoreSession();
  }, []);

  const handleLogin = (loginData) => {
    setUserSession(loginData);
  };

  const handleLogout = () => {
    authService.logout();
    setUserSession(null);
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