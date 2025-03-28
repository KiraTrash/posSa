import React from "react";

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-container">
          <img 
            src="/assets/logo.png" 
            alt="Logo Vault 4 POS" 
            className="logo"
          />
        </div>
        <div className="title-container">
          <h1 className="app-title">Vault 4 POS</h1>
          <p className="app-subtitle">Sistema de Punto de Venta</p>
        </div>
      </div>
    </header>
  );
};

export default Header;