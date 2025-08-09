import React, { useState } from 'react';
import { LogOut, User, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="header-3d sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <img 
              src="/nadiya-logo.png" 
              alt="Nadiya's Logo" 
              className="h-10 w-auto object-contain filter drop-shadow-md"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <h1 className="text-xl font-bold text-gray-800 text-3d">Employee Voice</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 text-sm button-3d px-4 py-2"
              >
                <div className="flex items-center gap-2">
                  {user?.role === 'admin' ? (
                    <Shield className="w-4 h-4 text-white" />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                  <span className="font-medium text-white">{user?.name}</span>
                </div>
                <span className="text-white/70">•</span>
                <span className="capitalize text-white/90">{user?.role}</span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                    <p className="text-xs text-gray-600 capitalize">{user?.role}</p>
                  </div>
                  
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 flex items-center gap-3 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};

export default Header;