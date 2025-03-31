import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

// Crear contexto con valores por defecto para mejor autocompletado y prevención de errores
const AuthContext = createContext({
  user: null,
  loading: true,
  error: null,
  login: async () => {},
  logout: async () => {},
  checkAuth: async () => {}
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para verificar autenticación
  const checkAuth = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/check-auth', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Error al verificar autenticación');
      }
      
      const data = await response.json();
      if (data.isAuthenticated) {
        setUser(data.user);
      } else {
        setUser(null);
      }
      return data;
    } catch (err) {
      setError(err.message);
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Efecto para verificar autenticación al montar el componente
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Función para login
  const login = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error en el login');
      }

      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para logout
  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/logout', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error al cerrar sesión');
      }

      setUser(null);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Valor del contexto
  const contextValue = {
    user,
    loading,
    error,
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado con verificación de contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  
  return context;
};