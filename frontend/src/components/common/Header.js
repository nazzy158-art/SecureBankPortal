import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmed = window.confirm('Are you sure you want to log out?');
    if (confirmed) {
      logout();                 // clear token + user
      navigate('/login');       // redirect to login page
    }
  };

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          {/* Left Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-center sm:text-left">
            <h1 className="text-2xl font-bold tracking-tight">
              International Payments Portal
            </h1>

            {user && (
              <p className="text-blue-100 text-sm mt-1 sm:mt-0">
                Welcome back, <span className="font-semibold">{user.full_name}</span>
              </p>
            )}
          </div>

          {/* Right Section */}
          {user && (
            <div className="flex items-center space-x-4 mt-3 sm:mt-0">
              <span className="text-blue-100 text-sm">
                Account: <strong>{user.account_number || 'N/A'}</strong>
              </span>

              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-300"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
