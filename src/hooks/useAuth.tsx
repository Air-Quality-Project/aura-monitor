import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '@/types';
import { api, setAuthToken, getAuthToken } from '@/services/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: getAuthToken(),
    isAuthenticated: false,
    isLoading: true,
  });

  // 🔄 Restore session on refresh
 useEffect(() => {
  const restoreSession = async () => {
    const token = getAuthToken();

    if (!token) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const res = await api.getProfile();

      setState({
        user: res.user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      // token invalid
      setAuthToken(null);
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  restoreSession();
}, []);


  // ✅ LOGIN → BACKEND
  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);

    setAuthToken(res.token);

    setState({
      user: res.user,
      token: res.token,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  // ✅ REGISTER → BACKEND
  const register = async (name: string, email: string, password: string) => {
    const res = await api.register(name, email, password);

    setAuthToken(res.token);

    setState({
      user: res.user,
      token: res.token,
      isAuthenticated: true,
      isLoading: false,
    });
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
