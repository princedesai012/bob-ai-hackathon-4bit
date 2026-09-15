import { createContext, useState, useEffect, useContext } from 'react';
import * as allApis from '../services/allApis';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, verify the token here with a /me endpoint
    // For this hackathon demo, we just restore from storage
    if (token) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await allApis.login(email, password);
      if (res.data.success) {
        setToken(res.data.data.token);
        setUser(res.data.data.user);
        localStorage.setItem('token', res.data.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.data.user));
        return { success: true };
      } else {
        return { success: false, error: res.data.error.message };
      }
    } catch (err) {
      return { success: false, error: err.response?.data?.error?.message || err.message };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
