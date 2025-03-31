import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Main from './components/Main';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import Cobros from './components/Cobros';
import Entradas from './components/Entradas';
import Salidas from './components/Salidas';
import Inventario from './components/Inventario';
import Usuarios from './components/Usuarios';
import Login from './components/Login';
import './styles.css';

// Crear contexto de autenticación
const AuthContext = React.createContext();

// Proveedor de autenticación
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/check-auth', {
          credentials: 'include'
        });
        const data = await response.json();
        if (data.isAuthenticated) {
          setUser(data.user);
        } else {
          navigate('/login');
        }
      } catch (err) {
        console.error('Error verificando autenticación:', err);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const login = async (username, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        navigate('/');
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err) {
      return { success: false, error: 'Error de conexión' };
    }
  };

  const logout = async () => {
    await fetch('http://localhost:5000/api/logout', {
      credentials: 'include'
    });
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Componente de ruta privada
const PrivateRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  
  if (loading) {
    return <div className="loading-screen">Cargando...</div>;
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

// Componente principal de la aplicación
const AppContent = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const { logout } = React.useContext(AuthContext);

  const handleViewChange = (view) => {
    setCurrentView(view.toLowerCase());
  };

  const renderView = () => {
    switch(currentView) {
      case 'dashboard': return <Dashboard />;
      case 'cobros': return <Cobros />;
      case 'entradas': return <Entradas />;
      case 'salidas': return <Salidas />;
      case 'inventario': return <Inventario />;
      case 'usuario': return <Usuarios />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="grid-container">
      <Header onLogout={logout} />
      <Sidebar onViewChange={handleViewChange} />
      <Main>{renderView()}</Main>
      <Footer />
    </div>
  );
};

// Componente raíz con enrutamiento
const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/*" 
            element={
              <PrivateRoute>
                <AppContent />
              </PrivateRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};
export { AuthContext };
export default App;