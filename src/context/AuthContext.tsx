import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, AuthContextType } from '../types';
import { UserService } from '../services/userService';
import { TokenService } from '../services/tokenService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Load token from localStorage on mount and validate it
  useEffect(() => {
    const savedToken = localStorage.getItem('employee-voice-auth-token');
    if (savedToken) {
      validateAndSetUser(savedToken);
    }
  }, []);

  const validateAndSetUser = async (token: string) => {
    try {
      const validation = await TokenService.validateToken(token);
      
      if (validation.valid && validation.user) {
        // Get full user data
        const userData = await UserService.getUserById(validation.user.id);
        
        if (userData) {
          setUser({
            id: userData.id,
            name: userData.name,
            nationalId: userData.national_id,
            role: userData.role,
            createdAt: userData.created_at ? new Date(userData.created_at) : undefined
          });
          setAuthToken(token);
          localStorage.setItem('employee-voice-auth-token', token);
        } else {
          // User not found, clear token
          localStorage.removeItem('employee-voice-auth-token');
          setAuthToken(null);
        }
      } else {
        // Invalid token, clear it
        localStorage.removeItem('employee-voice-auth-token');
        setAuthToken(null);
      }
    } catch (error) {
      console.error('Error validating token:', error);
      localStorage.removeItem('employee-voice-auth-token');
      setAuthToken(null);
    }
  };

  const login = async (nationalId: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log('Login attempt:', { nationalId, name });

      // Check for fixed admin credentials first
      if (nationalId.toLowerCase() === 'ndsvoice' && name === 'nadiyas1234') {
        console.log('Admin login attempt detected');
        
        // Check if admin user exists in database
        let adminUser = await UserService.getUserByNationalId('ndsvoice');
        
        if (!adminUser) {
          console.log('Admin user not found, creating...');
          // Admin doesn't exist, create it
          const result = await UserService.createUser({
            name: 'Employee Voice Admin',
            national_id: 'ndsvoice', 
            role: 'admin'
          });

          if (!result.success || !result.user) {
            console.error('Error creating admin user:', result.error);
            setIsLoading(false);
            return false;
          }
          adminUser = result.user;
          console.log('Admin user created successfully');
        } else {
          console.log('Admin user found in database');
        }

        // Create authentication token
        console.log('Creating authentication token...');
        const tokenResult = await TokenService.createToken(
          adminUser.id,
          adminUser.role,
          adminUser.name
        );

        if (tokenResult.success && tokenResult.token) {
          console.log('Token created successfully');
          setUser({
            id: adminUser.id,
            name: adminUser.name,
            nationalId: adminUser.national_id,
            role: adminUser.role,
            createdAt: adminUser.created_at ? new Date(adminUser.created_at) : undefined
          });
          setAuthToken(tokenResult.token);
          localStorage.setItem('employee-voice-auth-token', tokenResult.token);
          setIsLoading(false);
          return true;
        } else {
          console.error('Error creating token:', tokenResult.error);
          setIsLoading(false);
          return false;
        }
      }

      // Regular user login (National ID + Name combination)
      console.log('Regular user login attempt');
      const foundUser = await UserService.getUserByCredentials(nationalId, name);

      if (foundUser) {
        console.log('User found, creating token...');
        // Create authentication token
        const tokenResult = await TokenService.createToken(
          foundUser.id,
          foundUser.role,
          foundUser.name
        );

        if (tokenResult.success && tokenResult.token) {
          setUser({
            id: foundUser.id,
            name: foundUser.name,
            nationalId: foundUser.national_id,
            role: foundUser.role,
            createdAt: foundUser.created_at ? new Date(foundUser.created_at) : undefined
          });
          setAuthToken(tokenResult.token);
          localStorage.setItem('employee-voice-auth-token', tokenResult.token);
          setIsLoading(false);
          return true;
        } else {
          console.error('Error creating token:', tokenResult.error);
          setIsLoading(false);
          return false;
        }
      }

      console.log('User not found with provided credentials');
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const register = async (nationalId: string, name: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    try {
      // Prevent registration with admin credentials
      if (nationalId.toLowerCase() === 'ndsvoice') {
        setIsLoading(false);
        return { success: false, message: 'This username is reserved for system administration.' };
      }

      // Create new user - ALWAYS as member
      const result = await UserService.createUser({
        name: name.trim(),
        national_id: nationalId.trim(),
        role: 'member'
      });

      setIsLoading(false);

      if (result.success) {
        return { 
          success: true, 
          message: 'Member account created successfully! You can now log in. Admin privileges can only be granted by existing administrators.' 
        };
      } else {
        console.error('Registration failed:', result.error);
        return { success: false, message: result.error || 'An error occurred. Please try again.' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      setIsLoading(false);
      return { success: false, message: 'An error occurred. Please try again.' };
    }
  };

  const logout = async () => {
    if (authToken) {
      // Deactivate the token on the server
      await TokenService.deactivateToken(authToken);
    }
    
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem('employee-voice-auth-token');
  };

  const refreshToken = async (): Promise<boolean> => {
    if (!authToken) return false;

    try {
      const result = await TokenService.refreshToken(authToken);
      
      if (result.success && result.newToken) {
        setAuthToken(result.newToken);
        localStorage.setItem('employee-voice-auth-token', result.newToken);
        return true;
      } else {
        // Refresh failed, logout user
        await logout();
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      await logout();
      return false;
    }
  };

  // Auto-refresh token every 23 hours
  useEffect(() => {
    if (authToken) {
      const refreshInterval = setInterval(() => {
        refreshToken();
      }, 23 * 60 * 60 * 1000); // 23 hours

      return () => clearInterval(refreshInterval);
    }
  }, [authToken]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      register, 
      isLoading,
      authToken,
      refreshToken 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};