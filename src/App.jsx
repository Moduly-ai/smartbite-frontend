import React, { useState, useEffect } from 'react';
import LoginScreen from './features/auth/LoginScreen';
import EmployeeReconciliation from './modules/cash-reconciliation/EmployeeReconciliation';
import OwnerDashboard from './components/layout/OwnerDashboard';
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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login screen if no user session
  if (!userSession) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoginScreen onLogin={handleLogin} />
      </div>
    );
  }

  // Show appropriate dashboard based on user type
  if (userSession.userType === 'owner') {
    return (
      <div className="min-h-screen bg-gray-50">
        <OwnerDashboard user={userSession} onLogout={handleLogout} />
      </div>
    );
  }

  // Default to employee reconciliation
  return (
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
  );
}

export default App;