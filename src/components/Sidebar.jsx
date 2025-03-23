import React from "react";

const Sidebar = ({ onViewChange }) => {
  // Función para manejar el clic en una opción del menú
  const handleMenuItemClick = (item) => {
    // Convertimos el nombre del menú a un valor válido para el estado `currentView`
    const view = item.toLowerCase(); // Ejemplo: "Cobros" -> "cobros"
    onViewChange(view); // Llamamos a la función para cambiar la vista
  };

  return (
    <aside className="sidebar">
      <h2>Menú</h2>

      {/* Botón de Inicio */}
      <button
        onClick={() => handleMenuItemClick("dashboard")} // Navegar al Dashboard
        style={{
          width: "100%",
          background: "#3498db",
          color: "#fff",
          border: "none",
          padding: "10px",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "14px",
          marginBottom: "10px",
          transition: "background 0.3s ease",
        }}
        onMouseEnter={(e) => (e.target.style.background = "#2980b9")}
        onMouseLeave={(e) => (e.target.style.background = "#3498db")}
      >
        Inicio
      </button>

      {/* Lista de opciones del menú */}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {["Cobros", "Entradas", "Salidas", "Inventario", "Usuario"].map(
          (item, index) => (
            <li
              key={index}
              style={{
                padding: "10px 0",
                borderBottom: "1px solid #34495e",
                cursor: "pointer",
                transition: "background 0.3s ease",
              }}
              onClick={() => handleMenuItemClick(item)} // Cambiar la vista al hacer clic
              onMouseEnter={(e) => (e.target.style.background = "#34495e")}
              onMouseLeave={(e) => (e.target.style.background = "transparent")}
            >
              {item}
            </li>
          )
        )}
      </ul>

      {/* Sección de contacto */}
      <div style={{ marginTop: "20px", fontSize: "14px" }}>
        <p>Contacto:</p>
        <a
          href="mailto:soporte@vault4pos.com"
          style={{ color: "#3498db", textDecoration: "none" }}
        >
          soporte@vault4pos.com
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
