import { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import axios from '../utils/axios';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  });

  const [loading, setLoading] = useState(true);

  // Cargar usuario al montar
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const { data } = await axios.get('/auth/profile');
          setUser(data);
          localStorage.setItem('user', JSON.stringify(data));
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const register = async (userData) => {
    try {
      const { data } = await axios.post('/auth/register', userData);
      
      // ⚠️ CAMBIO: NO guardamos token porque no está verificado
      return { 
        success: true, 
        message: data.message,
        emailSent: data.emailSent 
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al registrar'
      };
    }
  };

  const login = async (email, password) => {
    try {
      const { data } = await axios.post('/auth/login', { email, password });
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setUser(data);
      
      return { success: true };
    } catch (error) {
      const errorData = error.response?.data;
      
      return { 
        success: false, 
        message: errorData?.message || 'Error al iniciar sesión',
        needsVerification: errorData?.needsVerification || false,
        email: errorData?.email
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    window.location.href = '/';
  };

  const updateProfile = async (userData) => {
    try {
      const { data } = await axios.put('/auth/profile', userData);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al actualizar perfil'
      };
    }
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};