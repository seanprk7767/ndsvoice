import React, { useState, useEffect } from 'react';
import { Key, Clock, Shield, User, RefreshCw, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { TokenService, AuthToken } from '../services/tokenService';
import { useAuth } from '../context/AuthContext';

const TokenManagement: React.FC = () => {
  const { user, authToken } = useAuth();
  const [tokens, setTokens] = useState<AuthToken[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role === 'admin') {
      loadTokens();
    }
  }, [user]);

  const loadTokens = async () => {
    setIsLoading(true);
    try {
      const tokensData = await TokenService.getActiveTokens();
      setTokens(tokensData);
    } catch (error) {
      console.error('Error loading tokens:', error);
      setError('Failed to load tokens');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivateToken = async (token: string) => {
    if (token === authToken) {
      setError('Cannot deactivate your own active token');
      return;
    }

    if (window.confirm('Are you sure you want to deactivate this token? The user will be logged out.')) {
      try {
        const result = await TokenService.deactivateToken(token);
        if (result.success) {
          setSuccess('Token deactivated successfully');
          loadTokens();
        } else {
          setError(result.error || 'Failed to deactivate token');
        }
      } catch (error) {
        console.error('Error deactivating token:', error);
        setError('Failed to deactivate token');
      }
    }
  };

  const handleCleanupExpired = async () => {
    try {
      const result = await TokenService.cleanupExpiredTokens();
      if (result.success) {
        setSuccess(`Cleaned up ${result.cleaned} expired tokens`);
        loadTokens();
      } else {
        setError(result.error || 'Failed to cleanup expired tokens');
      }
    } catch (error) {
      console.error('Error cleaning up tokens:', error);
      setError('Failed to cleanup expired tokens');
    }
  };

  const formatTimeRemaining = (expiresAt: Date) => {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    
    if (diff <= 0) {
      return 'Expired';
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const isTokenExpired = (expiresAt: Date) => {
    return expiresAt.getTime() <= new Date().getTime();
  };

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Admin Access Required</h3>
        <p className="text-gray-600">Only administrators can view token management.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Token Management</h2>
          <p className="text-gray-600">Monitor and manage authentication tokens</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadTokens}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleCleanupExpired}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition-all duration-200"
          >
            <Trash2 className="w-4 h-4" />
            Cleanup Expired
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{success}</span>
          <button onClick={() => setSuccess('')} className="ml-auto text-green-600 hover:text-green-800">×</button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
          <button onClick={() => setError('')} className="ml-auto text-red-600 hover:text-red-800">×</button>
        </div>
      )}

      {/* Token Authentication Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Key className="w-6 h-6 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Token-Based Authentication</h3>
            <p className="text-blue-800 text-sm mb-3">
              The system now uses secure authentication tokens for user sessions. Each token is valid for 24 hours and automatically refreshes.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white/50 rounded-lg p-3">
                <p className="font-medium text-blue-900">✓ Security Features:</p>
                <ul className="text-blue-800 mt-1 space-y-1">
                  <li>• 32-character random tokens</li>
                  <li>• 24-hour expiration time</li>
                  <li>• Automatic token refresh</li>
                  <li>• Server-side validation</li>
                </ul>
              </div>
              <div className="bg-white/50 rounded-lg p-3">
                <p className="font-medium text-blue-900">Token Management:</p>
                <ul className="text-blue-800 mt-1 space-y-1">
                  <li>• View all active sessions</li>
                  <li>• Force logout users</li>
                  <li>• Clean expired tokens</li>
                  <li>• Monitor token usage</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Key className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Tokens</p>
              <p className="text-2xl font-semibold text-gray-900">
                {tokens.filter(t => !isTokenExpired(t.expiresAt)).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Clock className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Expired Tokens</p>
              <p className="text-2xl font-semibold text-gray-900">
                {tokens.filter(t => isTokenExpired(t.expiresAt)).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Admin Sessions</p>
              <p className="text-2xl font-semibold text-gray-900">
                {tokens.filter(t => t.userRole === 'admin' && !isTokenExpired(t.expiresAt)).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tokens List */}
      {isLoading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading tokens...</p>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tokens.map((token) => {
                  const expired = isTokenExpired(token.expiresAt);
                  const isCurrentToken = token.token === authToken;
                  
                  return (
                    <tr key={token.id} className={`hover:bg-gray-50 ${expired ? 'opacity-60' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-lg ${token.userRole === 'admin' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                            {token.userRole === 'admin' ? (
                              <Shield className="w-4 h-4 text-purple-600" />
                            ) : (
                              <User className="w-4 h-4 text-blue-600" />
                            )}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {token.userName}
                              {isCurrentToken && <span className="ml-2 text-xs text-green-600">(You)</span>}
                            </div>
                            <div className="text-xs text-gray-500">ID: {token.userId.substring(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {token.token.substring(0, 8)}...{token.token.substring(-4)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          token.userRole === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {token.userRole}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{token.expiresAt.toLocaleString()}</div>
                        <div className={`text-xs ${expired ? 'text-red-600' : 'text-gray-500'}`}>
                          {expired ? 'Expired' : `${formatTimeRemaining(token.expiresAt)} remaining`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          expired 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {expired ? 'Expired' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {!expired && !isCurrentToken && (
                          <button
                            onClick={() => handleDeactivateToken(token.token)}
                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                            title="Deactivate token"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        {isCurrentToken && (
                          <span className="text-green-600 text-xs">Current Session</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {tokens.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tokens found</h3>
              <p className="text-gray-600">No authentication tokens are currently active</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TokenManagement;