import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import LoginForm from './components/LoginForm';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AdminSetup from './components/AdminSetup';
import { UserService } from './services/userService';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [needsAdminSetup, setNeedsAdminSetup] = useState(false);
  const [isCheckingSetup, setIsCheckingSetup] = useState(true);

  useEffect(() => {
    checkAdminSetup();
  }, []);

  const checkAdminSetup = async () => {
    try {
      // Check if any admin users exist
      const hasAdmins = await UserService.hasAdminUsers();
      setNeedsAdminSetup(!hasAdmins);
    } catch (error) {
      console.error('Error checking admin setup:', error);
      setNeedsAdminSetup(true);
    } finally {
      setIsCheckingSetup(false);
    }
  };

  if (isCheckingSetup) {
    return (
      <div className="min-h-screen liquid-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 glass rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2 glow">Initializing Employee Voice</h2>
          <p className="text-white/70">Connecting to database...</p>
        </div>
      </div>
    );
  }

  if (needsAdminSetup && !user) {
    return <AdminSetup />;
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen">
      <Header />
      <Dashboard />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;