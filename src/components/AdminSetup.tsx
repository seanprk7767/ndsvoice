import React, { useState, useEffect } from 'react';
import { Shield, UserPlus, CheckCircle, AlertCircle } from 'lucide-react';
import { UserService } from '../services/userService';

const AdminSetup: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    nationalId: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [hasAdminUsers, setHasAdminUsers] = useState(false);
  const [checkingAdmins, setCheckingAdmins] = useState(true);

  useEffect(() => {
    checkForAdminUsers();
  }, []);

  const checkForAdminUsers = async () => {
    try {
      const hasAdmins = await UserService.hasAdminUsers();
      setHasAdminUsers(hasAdmins);
    } catch (error) {
      console.error('Error checking for admin users:', error);
    } finally {
      setCheckingAdmins(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!formData.name.trim() || !formData.nationalId.trim()) {
      setError('Please fill in all fields.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await UserService.createUser({
        name: formData.name.trim(),
        nationalId: formData.nationalId.trim(),
        role: 'admin',
      });

      if (result.success) {
        setSuccess(true);
        setFormData({ name: '', nationalId: '' });
      } else {
        setError(result.error || 'Failed to create admin user. Please try again.');
      }
    } catch (error) {
      console.error('Error creating admin user:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingAdmins) {
    return (
      <div className="min-h-screen container-3d flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="card-3d p-8 text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Checking System Status</h1>
            <p className="text-gray-600">
              Connecting to database and checking for existing administrators...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (hasAdminUsers) {
    return (
      <div className="min-h-screen container-3d flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="card-3d p-8 text-center">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">System Already Configured</h1>
            <p className="text-gray-600 mb-6">
              Admin users already exist in the system. Please use the login form to access your account.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full button-3d text-white py-3 px-4 font-medium"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen container-3d flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="card-3d p-8 text-center">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Admin Created Successfully!</h1>
            <p className="text-gray-600 mb-6">
              Your admin account has been created in Supabase. You can now log in to start using Employee Voice.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full button-3d text-white py-3 px-4 font-medium"
            >
              Continue to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen container-3d flex items-center justify-center p-4 relative">
      {/* Fashion-inspired floating accents */}
      <div className="fashion-accent"></div>
      <div className="fashion-accent"></div>
      <div className="fashion-accent"></div>
      <div className="fashion-accent"></div>
      
      <div className="w-full max-w-md">
        <div className="card-3d p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Setup Admin Account</h1>
            <p className="text-gray-600">
              Create the first admin account to get started with Employee Voice
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 input-3d text-gray-800 placeholder-gray-500 focus:outline-none"
                placeholder="Enter admin full name"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="nationalId" className="block text-sm font-medium text-gray-700 mb-1">
                National ID Number
              </label>
              <input
                type="text"
                id="nationalId"
                value={formData.nationalId}
                onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                className="w-full px-4 py-3 input-3d text-gray-800 placeholder-gray-500 focus:outline-none"
                placeholder="Enter admin National ID"
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-300 text-red-700 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full button-3d text-white py-3 px-4 font-medium focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Admin Account
                </>
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-300 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">What happens next?</h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Admin account will be created in the database</li>
              <li>• You can log in immediately after creation</li>
              <li>• Additional users can register themselves as members</li>
              <li>• You can promote members to admin later if needed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSetup;