import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/logout', {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        navigate('/login');
      } else {
        console.error('Error al cerrar sesión');
      }
    } catch (err) {
      console.error('Error en el logout:', err);
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        {/* Contenedor del logo y texto */}
        <div className="logo-container">
          <img src="/assets/logo.png" alt="Logo" className="logo" />
          <div className="brand-text">
            <h1 className="app-title">Vault 4 POS</h1>
            <p className="app-subtitle">Sistema de Punto de Venta</p>
          </div>
        </div>
        {/* Botón de logout en la esquina superior derecha */}
        <button
          className="logout-button"
          onClick={handleLogout}
          style={{
            padding: '8px 15px',
            background: '#F44336',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
            width: 'auto',
            height: 'auto',
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
};

export default Header;
