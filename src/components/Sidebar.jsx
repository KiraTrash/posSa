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
      <h2 className="sidebar-title">Menú Principal</h2>
      
      <ul className="menu-list">
        {menuItems.map((item, index) => (
          <li key={index} className="menu-item">
            <a 
              href="#!" 
              className="menu-link"
              onClick={() => onViewChange(item.view)}
            >
              {item.icon}
              <span>{item.name}</span>
            </a>
          </li>
        ))}
      </ul>

      <div className="contact-info">
        <h3 className="contact-title">Contacto</h3>
        <a href="mailto:soporte@vault4pos.com" className="contact-email">
          <FaEnvelope />
          soporte@vault4pos.com
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
