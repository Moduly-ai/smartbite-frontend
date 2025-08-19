import React, { useState } from 'react';
import LoginScreen from './features/auth/LoginScreen';
import EmployeeReconciliation from './modules/cash-reconciliation/EmployeeReconciliation';
import OwnerDashboard from './components/layout/OwnerDashboard';

function App() {
  const [userSession, setUserSession] = useState(null);

  const handleLogin = (loginData) => {
    setUserSession(loginData);
  };

  const handleLogout = () => {
    setUserSession(null);
  };

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