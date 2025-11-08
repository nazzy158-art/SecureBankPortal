import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from './common/Header';  // correct path
import PaymentForm from './payments/PaymentForm';
import PaymentHistory from './payments/PaymentHistory';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('create');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ✅ Reusable Header Component with Logout */}
      <Header />

      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* ✅ Tab Navigation */}
          <div className="border-b border-gray-200 mb-8 flex justify-between items-center">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('create')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'create'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Create Payment
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Payment History
              </button>
            </nav>
          </div>

          {/* ✅ Tab Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {activeTab === 'create' && (
              <div className="lg:col-span-2">
                <PaymentForm onPaymentCreated={() => setActiveTab('history')} />
              </div>
            )}

            {activeTab === 'history' && (
              <div className="lg:col-span-3">
                <PaymentHistory />
              </div>
            )}

            {/* ✅ Security Info Panel */}
            <div className="lg:col-span-1">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">
                  Security Features
                </h3>
                <ul className="space-y-3 text-sm text-blue-700">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    SSL/TLS Encryption
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Input Validation & Sanitization
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Password Hashing
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    SQL Injection Protection
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    XSS Attack Prevention
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
