import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load token from storage on app start
  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      // Add a small delay to ensure AsyncStorage is initialized
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (storageError) {
        console.warn('AsyncStorage not available yet, skipping token restore:', storageError.message);
      }
    } catch (e) {
      console.error('Error during bootstrap:', e);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
      });
      const { token: newToken, user: newUser } = response.data;
      
      // Try to save token, but don't fail if storage is unavailable
      try {
        await AsyncStorage.setItem('token', newToken);
      } catch (storageError) {
        console.warn('Could not save token to storage:', storageError.message);
      }
      
      setToken(newToken);
      setUser(newUser);
      return { token: newToken, user: newUser };
    } catch (error) {
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      const { token: newToken, user: newUser } = response.data;
      
      // Try to save token, but don't fail if storage is unavailable
      try {
        await AsyncStorage.setItem('token', newToken);
      } catch (storageError) {
        console.warn('Could not save token to storage:', storageError.message);
      }
      
      setToken(newToken);
      setUser(newUser);
      return { token: newToken, user: newUser };
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
    } catch (storageError) {
      console.warn('Could not remove token from storage:', storageError.message);
    }
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        register,
        login,
        logout,
        isSignedIn: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
