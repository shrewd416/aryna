import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';
import AuthUtils from '@/utils/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in on app start
    const initializeAuth = () => {
      try {
        const token = AuthUtils.getToken();
        const currentUser = AuthUtils.getCurrentUser();
        
        if (token && currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        AuthUtils.removeToken();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (user: User, token: string) => {
    AuthUtils.setToken(token);
    AuthUtils.setCurrentUser(user);
    setUser(user);
  };

  const logout = () => {
    AuthUtils.removeToken();
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    AuthUtils.setCurrentUser(updatedUser);
    setUser(updatedUser);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};