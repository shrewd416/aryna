import { User } from '@/types';

export const AuthUtils = {
  // Store auth token
  setToken: (token: string): void => {
    localStorage.setItem('authToken', token);
  },

  // Get auth token
  getToken: (): string | null => {
    return localStorage.getItem('authToken');
  },

  // Remove auth token
  removeToken: (): void => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  },

  // Store current user
  setCurrentUser: (user: User): void => {
    localStorage.setItem('currentUser', JSON.stringify(user));
  },

  // Get current user
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!AuthUtils.getToken();
  },

  // Validate strong password
  validatePassword: (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&)');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Validate mobile number
  validateMobileNumber: (mobile: string): boolean => {
    const mobileRegex = /^[6-9]\d{9}$/; // Indian mobile number format
    return mobileRegex.test(mobile);
  },

  // Format mobile number for display
  formatMobileNumber: (mobile: string): string => {
    if (mobile.length === 10) {
      return `${mobile.slice(0, 5)} ${mobile.slice(5)}`;
    }
    return mobile;
  }
};

export default AuthUtils;