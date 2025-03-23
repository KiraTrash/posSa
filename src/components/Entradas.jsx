import React, { useState } from "react";

const Entradas = () => {
  // Estado para manejar los datos del formulario
  const [idProducto, setIdProducto] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [fechaEntrada, setFechaEntrada] = useState(new Date().toISOString().slice(0, 16)); // Fecha y hora actual

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar que los campos no estén vacíos
    if (!idProducto || !cantidad || !fechaEntrada) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    // Crear el objeto con los datos de la entrada
    const entrada = {
      id_producto: idProducto,
      cantidad: cantidad,
      fecha_entrada: fechaEntrada,
    };

    try {
      // Enviar los datos a la API (simulado aquí)
      const response = await fetch("http://localhost:5000/api/entradas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entrada),
      });

      if (response.ok) {
        alert("Entrada registrada exitosamente.");
        // Limpiar el formulario
        setIdProducto("");
        setCantidad(1);
        setFechaEntrada(new Date().toISOString().slice(0, 16));
      } else {
        alert("Error al registrar la entrada.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al conectar con el servidor.");
    }
  };

  return (
    <div>
      <h2>Registro de Entradas</h2>

      {/* Formulario para agregar entradas */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {/* Campo: ID del Producto */}
          <label>
            ID del Producto:
            <input
              type="number"
              placeholder="ID del Producto"
              value={idProducto}
              onChange={(e) => setIdProducto(e.target.value)}
              required
              style={{ padding: "5px", width: "100%" }}
            />
          </label>

          {/* Campo: Cantidad */}
          <label>
            Cantidad:
            <input
              type="number"
              placeholder="Cantidad"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              min="1"
              required
              style={{ padding: "5px", width: "100%" }}
            />
          </label>

          {/* Campo: Fecha de Entrada */}
          <label>
            Fecha de Entrada:
            <input
              type="datetime-local"
              value={fechaEntrada}
              onChange={(e) => setFechaEntrada(e.target.value)}
              required
              style={{ padding: "5px", width: "100%" }}
            />
          </label>

          {/* Botón de Agregar */}
          <button
            type="submit"
            style={{
              padding: "10px",
              background: "#3498db",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Agregar Entrada
          </button>
        </div>
      </form>
    </div>
  );
};

export default Entradas;