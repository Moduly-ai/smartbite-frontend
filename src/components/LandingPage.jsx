import React from 'react';

const LandingPage = ({ onGetStarted, onSignIn }) => {
  const features = [
    {
      icon: '💰',
      title: 'Smart Cash Reconciliation',
      description: 'Automate daily cash counts with intelligent variance detection and real-time reporting.'
    },
    {
      icon: '📊',
      title: 'Real-Time Analytics',
      description: 'Track performance metrics, identify trends, and make data-driven decisions instantly.'
    },
    {
      icon: '👥',
      title: 'Multi-User Management',
      description: 'Role-based access for employees and owners with secure authentication and permissions.'
    },
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Built with modern technology for instant responses and seamless user experience.'
    },
    {
      icon: '🔒',
      title: 'Bank-Level Security',
      description: 'Enterprise-grade security with JWT authentication and encrypted data transmission.'
    },
    {
      icon: '📱',
      title: 'Mobile Optimized',
      description: 'Perfect for tablets and mobile devices - manage your restaurant from anywhere.'
    }
  ];

  const benefits = [
    'Reduce cash handling errors by up to 90%',
    'Save 2+ hours daily on reconciliation tasks',
    'Real-time visibility into cash flow',
    'Automated variance reporting and alerts',
    'Streamlined employee workflows',
    'Complete audit trail for compliance'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 opacity-95"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Transform Your Restaurant's
              <span className="block text-blue-200">Cash Management</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
              SmartBite eliminates manual cash reconciliation errors and saves hours daily with 
              intelligent automation built specifically for restaurants.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <button
                onClick={onGetStarted}
                className="bg-white text-blue-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Start Free 7-Day Trial
              </button>
              <button
                onClick={onSignIn}
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-700 transition-all duration-300"
              >
                Sign In
              </button>
            </div>
            <p className="text-blue-200 text-sm">
              ✨ No credit card required • Setup in under 5 minutes
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Cash Flow
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Designed by restaurant operators, for restaurant operators. Every feature solves real problems you face daily.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition-shadow duration-300">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-24 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                See Results From Day One
              </h2>
              <p className="text-blue-100 text-lg mb-8">
                Join hundreds of restaurants already saving time and reducing errors with SmartBite's proven cash management system.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center text-white">
                    <div className="bg-blue-500 rounded-full p-1 mr-3">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    {benefit}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-2xl">
              <div className="text-center">
                <div className="text-6xl font-bold text-blue-600 mb-2">7</div>
                <div className="text-2xl font-semibold text-gray-900 mb-4">Days Free</div>
                <p className="text-gray-600 mb-6">
                  Experience the full power of SmartBite with no limitations. 
                  Cancel anytime during your trial.
                </p>
                <button
                  onClick={onGetStarted}
                  className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors duration-300 mb-4"
                >
                  Claim Your Free Trial
                </button>
                <p className="text-sm text-gray-500">
                  No setup fees • No contracts • Cancel anytime
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-semibold text-gray-900 mb-8">
            Trusted by Restaurant Owners Worldwide
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-yellow-400 text-2xl mb-4">⭐⭐⭐⭐⭐</div>
              <p className="text-gray-600 mb-4">
                "SmartBite reduced our daily reconciliation from 2 hours to 15 minutes. The accuracy is incredible!"
              </p>
              <div className="font-semibold text-gray-900">Sarah Chen</div>
              <div className="text-gray-500">Owner, Golden Dragon Bistro</div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-yellow-400 text-2xl mb-4">⭐⭐⭐⭐⭐</div>
              <p className="text-gray-600 mb-4">
                "Finally, a solution that actually understands how restaurants work. Game changer!"
              </p>
              <div className="font-semibold text-gray-900">Mike Rodriguez</div>
              <div className="text-gray-500">Manager, Coastal Café</div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-yellow-400 text-2xl mb-4">⭐⭐⭐⭐⭐</div>
              <p className="text-gray-600 mb-4">
                "The mobile interface is perfect for our team. Everyone loves how easy it is to use."
              </p>
              <div className="font-semibold text-gray-900">Emma Thompson</div>
              <div className="text-gray-500">Owner, The Local Kitchen</div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Revolutionize Your Cash Management?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of restaurants saving time and money with SmartBite.
            Your free trial starts immediately.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onGetStarted}
              className="bg-blue-600 text-white px-10 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Start Your 7-Day Free Trial
            </button>
            <button
              onClick={onSignIn}
              className="border-2 border-gray-600 text-gray-300 px-10 py-4 rounded-lg font-semibold text-lg hover:border-gray-400 hover:text-white transition-all duration-300"
            >
              Already a Customer? Sign In
            </button>
          </div>
          <p className="text-gray-400 text-sm mt-6">
            Questions? Contact our team at hello@smartbite.app
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;