import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GamificationProvider } from './context/GamificationContext';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import LevelUpModal from './components/LevelUpModal';
import AchievementModal from './components/AchievementModal';
import ToastNotification from './components/ToastNotification';

import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import AddExpense from './pages/AddExpense';
import Budget from './pages/Budget';
import Quests from './pages/Quests';
import Achievements from './pages/Achievements';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

import './styles/variables.css';
import './styles/global.css';
import './styles/components.css';
import './styles/pages.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        Loading session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/': return 'Dashboard';
      case '/expenses': return 'Expense Ledger';
      case '/add-expense': return 'Add Expense';
      case '/budget': return 'Budget';
      case '/quests': return 'Quests';
      case '/achievements': return 'Achievements';
      case '/profile': return 'Profile';
      default: return 'Track My Spend';
    }
  };

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Navbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          title={getPageTitle(location.pathname)}
        />
        <main className="page-wrapper">{children}</main>
      </div>
      <LevelUpModal />
      <AchievementModal />
      <ToastNotification />
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/expenses"
        element={
          <ProtectedRoute>
            <Layout>
              <Expenses />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-expense"
        element={
          <ProtectedRoute>
            <Layout>
              <AddExpense />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/budget"
        element={
          <ProtectedRoute>
            <Layout>
              <Budget />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/quests"
        element={
          <ProtectedRoute>
            <Layout>
              <Quests />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/achievements"
        element={
          <ProtectedRoute>
            <Layout>
              <Achievements />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <GamificationProvider>
        <Router>
          <AppRoutes />
        </Router>
      </GamificationProvider>
    </AuthProvider>
  );
}

export default App;
