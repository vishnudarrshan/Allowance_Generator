import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Auth/Login';
import Setup from './pages/Auth/Setup';
import CalendarView from './pages/Calendar/CalendarView';
import TeamView from './pages/Manager/TeamView';
import AdminPanel from './pages/Admin/AdminPanel';
import FirstTimeSetup from './pages/FirstTime/FirstTimeSetup';
import LoadingSpinner from './components/Common/LoadingSpinner';
import AllowanceHistory from './pages/Employee/AllowanceHistory.jsx';
import AllowanceAnalytics from './pages/Manager/AllowanceAnalytics.jsx';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/setup" element={<Setup />} />
      <Route path="/first-time-setup" element={<FirstTimeSetup />} />
      
      <Route path="/" element={<Layout />}>
        <Route index element={
          <ProtectedRoute>
            <CalendarView />
          </ProtectedRoute>
        } />
        
        {/* Employee Routes */}
        <Route path="/allowance-history" element={
          <ProtectedRoute>
            <AllowanceHistory />
          </ProtectedRoute>
        } />
        
        {/* Manager Routes */}
        <Route path="/team" element={
          <ProtectedRoute requiredRole="manager">
            <TeamView />
          </ProtectedRoute>
        } />
        
        <Route path="/analytics" element={
          <ProtectedRoute requiredRole="manager">
            <AllowanceAnalytics />
          </ProtectedRoute>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <AdminPanel />
          </ProtectedRoute>
        } />
      </Route>
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;