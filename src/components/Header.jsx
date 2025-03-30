const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-container">
          <img 
            src="/assets/logo.png" 
            alt="Vault 4 POS" 
            className="logo"
          />
          <div className="brand-text">
            <h1 className="app-title">Vault 4 POS</h1>
            <p className="app-subtitle">Sistema de Punto de Venta</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;