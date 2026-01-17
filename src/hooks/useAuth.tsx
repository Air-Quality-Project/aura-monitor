import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '@/types';
import { setAuthToken, getAuthToken } from '@/services/api';
import { mockUser } from '@/data/mockData';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Demo mode - check if using mock token
const DEMO_TOKEN = 'mock-jwt-token';
const isDemoMode = () => getAuthToken() === DEMO_TOKEN;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: getAuthToken(),
    isAuthenticated: false,
    isLoading: true,
  });

  // Check for existing token on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      
      if (token) {
        // Demo mode - use mock user without API call
        if (token === DEMO_TOKEN) {
          setState({
            user: { ...mockUser, createdAt: mockUser.createdAt },
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }
        
        // Production mode - verify token with API
        // For now, just clear invalid tokens
        setAuthToken(null);
        setState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    // Demo credentials check
    if (email === 'demo@airpulse.io' && password === 'demo123') {
      setAuthToken(DEMO_TOKEN);
      setState({
        user: { ...mockUser, createdAt: mockUser.createdAt },
        token: DEMO_TOKEN,
        isAuthenticated: true,
        isLoading: false,
      });
      return;
    }
    
    throw new Error('Invalid credentials. Try demo@airpulse.io / demo123');
  };

  const register = async (name: string, email: string, password: string) => {
    // In demo mode, just simulate success
    // In production, this would call the API
    throw new Error('Registration is disabled in demo mode. Use the demo credentials.');
  };

  const logout = () => {
    setAuthToken(null);
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const updateUser = (user: User) => {
    setState(prev => ({ ...prev, user }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
