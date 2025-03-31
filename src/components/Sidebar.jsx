import React from "react";
import { 
  FaHome, 
  FaCashRegister, 
  FaSignInAlt, 
  FaSignOutAlt, 
  FaBoxes, 
  FaUser,
  FaEnvelope 
} from "react-icons/fa";

const Sidebar = ({ onViewChange }) => {
  // Función para manejar el clic en una opción del menú
  const handleMenuItemClick = (item) => {
    const view = item.toLowerCase();
    onViewChange(view);
  };

  // Opciones del menú con sus respectivos íconos
  const menuItems = [
    { name: "Dashboard", icon: <FaHome />, view: "dashboard" },
    { name: "Cobros", icon: <FaCashRegister />, view: "cobros" },
    { name: "Entradas", icon: <FaSignInAlt />, view: "entradas" },
    { name: "Salidas", icon: <FaSignOutAlt />, view: "salidas" },
    { name: "Inventario", icon: <FaBoxes />, view: "inventario" },
    { name: "Usuario", icon: <FaUser />, view: "usuario" }
  ];

  return (
    <aside className="sidebar">
      {/* Encabezado del Sidebar */}
      <div className="sidebar-header">
        <h2 className="sidebar-title">Menú Principal</h2>
      </div>

      {/* Lista de navegación */}
      <nav className="sidebar-nav">
        <ul className="menu-list">
          {menuItems.map((item, index) => (
            <li 
              key={index} 
              className="menu-item"
              onClick={() => handleMenuItemClick(item.view)}
            >
              <div className="menu-link">
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-text">{item.name}</span>
              </div>
            </li>
          ))}
        </ul>
      </nav>

      {/* Sección de contacto */}
      <div className="sidebar-footer">
        <h3 className="contact-title">Contacto</h3>
        <a 
          href="mailto:soporte@vault4pos.com" 
          className="contact-link"
        >
          <FaEnvelope className="contact-icon" />
          soporte@vault4pos.com
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
