import React, { useState } from 'react';
import { UserCheck, AlertCircle, UserPlus, CheckCircle, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginForm: React.FC = () => {
  const [nationalId, setNationalId] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const { login, register, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!nationalId.trim() || !name.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (isRegistering) {
      const result = await register(nationalId.trim(), name.trim());
      if (result.success) {
        setSuccess(result.message);
        setIsRegistering(false);
        setNationalId('');
        setName('');
      } else {
        setError(result.message);
      }
    } else {
      const success = await login(nationalId.trim(), name.trim());
      if (!success) {
        setError('Invalid credentials. Please check your username and password, or register if you don\'t have an account.');
      }
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setSuccess('');
    setNationalId('');
    setName('');
  };

  return (
    <div className="min-h-screen container-3d flex items-center justify-center p-4 relative">
      {/* Fashion-inspired floating accents */}
      <div className="fashion-accent"></div>
      <div className="fashion-accent"></div>
      <div className="fashion-accent"></div>
      <div className="fashion-accent"></div>
      
      <div className="w-full max-w-md">
        <div className="card-3d p-8">
          {/* Header with Logo */}
          <div className="text-center mb-8">
            <div className="mx-auto w-48 h-20 mb-6 flex items-center justify-center">
              <img 
                src="/nadiya-logo.png" 
                alt="Nadiya's Logo" 
                className="h-16 w-auto object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-3">Employee Voice</h1>
            <p className="text-gray-600 text-sm leading-relaxed">
              {isRegistering 
                ? 'Create a member account to submit complaints, suggestions & ideas'
                : 'Login to submit complaints, suggestions & ideas'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="nationalId" className="block text-sm font-medium text-gray-700 mb-2">
                  {isRegistering ? 'National ID Number' : 'Username / National ID'}
                </label>
                <input
                  type="text"
                  id="nationalId"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  className="w-full px-4 py-3 input-3d text-gray-800 placeholder-gray-500 focus:outline-none"
                  placeholder={isRegistering ? "Enter your National ID" : "Enter username or National ID"}
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  {isRegistering ? 'Full Name' : 'Password / Full Name'}
                </label>
                <input
                  type={isRegistering ? "text" : "password"}
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 input-3d text-gray-800 placeholder-gray-500 focus:outline-none"
                  placeholder={isRegistering ? "Enter your full name" : "Enter password or full name"}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-300 text-red-700 rounded-lg">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-300 text-green-700 rounded-lg">
                <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-500" />
                <span className="text-sm">{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full button-3d text-white py-4 px-6 font-medium focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {isRegistering ? (
                    <>
                      <UserPlus className="w-5 h-5" />
                      Create Member Account
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-5 h-5" />
                      Sign In
                    </>
                  )}
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={toggleMode}
              disabled={isLoading}
              className="text-gray-600 hover:text-gray-800 font-medium transition-colors disabled:opacity-50 text-sm"
            >
              {isRegistering 
                ? 'Already have an account? Sign in'
                : 'Don\'t have an account? Register as member'
              }
            </button>
          </div>

          {/* Information boxes */}
          <div className="mt-6 space-y-3">
            {isRegistering && (
              <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg">
                <p className="text-xs text-amber-800 text-center leading-relaxed">
                  <strong className="text-amber-900">Member Registration:</strong> You will be registered as a member. Admin privileges can only be granted by existing administrators.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;