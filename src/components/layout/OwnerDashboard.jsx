import React, { useState } from 'react';
import EmployeeManagement from '../../features/employee-mgmt/EmployeeManagement';
import OwnerReconciliationReview from '../../modules/cash-reconciliation/OwnerReconciliationReview';
import ConfigurationSettings from '../owner/ConfigurationSettings';

const OwnerDashboard = ({ user, onLogout }) => {
  const [activeModule, setActiveModule] = useState('reconciliations');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Initialize sidebar state based on screen size
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // Desktop: start with collapsed sidebar (can be toggled)
        setSidebarOpen(false);
      } else {
        // Mobile: hide sidebar by default
        setSidebarOpen(false);
      }
    };
    
    // Set initial state
    handleResize();
    
    // Listen for resize events
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [showConfiguration, setShowConfiguration] = useState(false);

  const menuItems = [
    {
      id: 'reconciliations',
      name: 'Reconciliations',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'employees',
      name: 'Employee Management',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      )
    },
    {
      id: 'settings',
      name: 'System Settings',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ];

  const renderContent = () => {
    switch (activeModule) {
      case 'employees':
        return <EmployeeManagement />;
      case 'settings':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">System Configuration</h3>
              <p className="text-gray-600 mb-6">
                Configure system settings including registers, POS terminals, and reconciliation parameters.
              </p>
              <button
                onClick={() => setShowConfiguration(true)}
                className="btn-primary"
              >
                Open Configuration
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Registers</h4>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">Configure cash registers and reserve amounts</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">POS Terminals</h4>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">Manage EFTPOS terminals and payment processing</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Reconciliation</h4>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">Set reconciliation deadlines and variance tolerances</p>
              </div>
            </div>
          </div>
        );
      case 'reconciliations':
      default:
        return <OwnerReconciliationReview />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Always visible on desktop, toggle on mobile */}
      <div className={`bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 ease-in-out flex flex-col shadow-2xl
        ${sidebarOpen 
          ? 'fixed inset-y-0 left-0 z-50 w-72 lg:relative lg:z-auto lg:w-72' 
          : 'hidden lg:relative lg:z-auto lg:flex lg:w-16'
        }`}>
        
        {/* Header */}
        <div className={`p-6 ${!sidebarOpen ? 'lg:p-2 lg:flex lg:justify-center' : ''}`}>
          <div className={`flex items-center ${sidebarOpen ? 'justify-between' : 'lg:justify-center'}`}>
            <div className={`transition-all duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 w-0 lg:hidden'}`}>
              <h1 className="text-2xl font-bold text-white">SmartBite</h1>
              <p className="text-slate-300 text-base">Owner Portal</p>
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-3 rounded-lg hover:bg-slate-700 transition-colors ${!sidebarOpen ? 'lg:p-2' : ''}`}
            >
              <svg className={`${sidebarOpen ? 'w-7 h-7' : 'w-6 h-6'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 py-4 ${sidebarOpen ? 'px-6' : 'px-2 lg:px-1'}`}>
          <ul className="space-y-3">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveModule(item.id);
                    // Close sidebar on mobile after menu selection
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={`w-full flex items-center rounded-lg transition-all duration-200 text-left ${
                    sidebarOpen 
                      ? 'px-4 py-4' 
                      : 'px-2 py-3 lg:justify-center lg:px-1'
                  } ${
                    activeModule === item.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                  title={!sidebarOpen ? item.name : undefined}
                >
                  <div className="flex-shrink-0">
                    {React.cloneElement(item.icon, { className: "w-6 h-6" })}
                  </div>
                  <span className={`ml-4 transition-all duration-300 text-base font-medium ${
                    sidebarOpen ? 'opacity-100' : 'opacity-0 w-0 lg:hidden'
                  }`}>
                    {item.name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Info & Logout */}
        <div className={`border-t border-slate-700 ${sidebarOpen ? 'p-6' : 'p-2 lg:p-1'}`}>
          <div className={`transition-all duration-300 ${sidebarOpen ? 'opacity-100 mb-4' : 'opacity-0 lg:hidden mb-2'}`}>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-base">
                  {user.name.charAt(0)}
                </span>
              </div>
              {sidebarOpen && (
                <div className="ml-4">
                  <p className="text-white font-medium text-base">{user.name}</p>
                  <p className="text-slate-400 text-sm">Owner</p>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onLogout}
            className={`w-full flex items-center text-slate-300 hover:bg-red-600 hover:text-white rounded-lg transition-colors ${
              sidebarOpen 
                ? 'px-4 py-3' 
                : 'px-2 py-3 lg:justify-center lg:px-1'
            }`}
            title={!sidebarOpen ? 'Logout' : undefined}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className={`ml-4 transition-all duration-300 text-base font-medium ${
              sidebarOpen ? 'opacity-100' : 'opacity-0 w-0 lg:hidden'
            }`}>
              Logout
            </span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors mr-4 lg:hidden"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {menuItems.find(item => item.id === activeModule)?.name || 'Dashboard'}
                </h2>
                <p className="text-gray-600">
                  Manage your business reconciliations and employees
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Welcome back,</p>
                <p className="text-sm text-gray-600">{user.name}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">
                  {user.name.charAt(0)}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {renderContent()}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Configuration Modal */}
      {showConfiguration && (
        <ConfigurationSettings
          user={user}
          onClose={() => setShowConfiguration(false)}
        />
      )}
    </div>
  );
};

export default OwnerDashboard;