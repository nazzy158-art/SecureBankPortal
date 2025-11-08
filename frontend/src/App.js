import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/Dashboard';
import EmployeeDashboard from './components/employee/EmployeeDashboard';
import ProtectedRoute from './components/common/ProtectedRoute';
import { checkBackendConnection } from './utils/connectionTest';
import './index.css';

// Role-based dashboard router
function DashboardRouter() {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Route based on user role
  if (user.role === 'employee') {
    return <EmployeeDashboard />;
  }
  
  return <Dashboard />;
}

function App() {
  useEffect(() => {
    // Test backend connection on app start
    checkBackendConnection();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;