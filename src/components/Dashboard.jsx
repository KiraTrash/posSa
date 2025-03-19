import React, { useState, useEffect } from "react";

const Dashboard = () => {
  // Estado para la hora actual
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString()
  );

  // Efecto para actualizar la hora cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    // Limpiar el intervalo al desmontar el componente
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Bienvenido a Vault 4 POS</p>

      {/* Mostrar la hora actual */}
      <div style={{ margin: "20px 0" }}>
        <h3>Hora actual:</h3>
        <p style={{ fontSize: "24px", fontWeight: "bold" }}>{currentTime}</p>
      </div>

      {/* Estadísticas básicas */}
      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <div
          style={{
            flex: 1,
            padding: "20px",
            backgroundColor: "#ecf0f1",
            borderRadius: "8px",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h3>Total de ventas hoy</h3>
          <p style={{ fontSize: "20px", fontWeight: "bold" }}>$1,500.00</p>
        </div>
        <div
          style={{
            flex: 1,
            padding: "20px",
            backgroundColor: "#ecf0f1",
            borderRadius: "8px",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h3>Productos en inventario</h3>
          <p style={{ fontSize: "20px", fontWeight: "bold" }}>120</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
