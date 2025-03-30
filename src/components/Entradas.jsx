import React, { useState, useEffect } from "react";
import Modal from 'react-modal';

const Entradas = () => {
  // Estados para el formulario
  const [codigoBarras, setCodigoBarras] = useState("");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");
  const [categoria, setCategoria] = useState("");
  const [fechaEntrada, setFechaEntrada] = useState(new Date().toISOString().slice(0, 16));
  
  // Estados para feedback y modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Categorías predefinidas
  const categorias = [
    "Electrónica", "Higiene", "Dulces", "Limpieza", 
    "Bebidas", "Oficina", "Cuidado personal", "Huevos", 
    "Lácteos", "Botanas"
  ];

  // Validar formulario
  const validateForm = () => {
    // Validar que los campos obligatorios no estén vacíos
    if (!codigoBarras || !nombre || !precio || !stock) {
        showFeedback("Por favor complete los campos obligatorios", false);
        return false;
    }
    
    // Validar que el precio sea un número positivo
    const precioNum = parseFloat(precio);
    if (isNaN(precioNum) || precioNum <= 0) {
        showFeedback("El precio debe ser un número positivo válido", false);
        return false;
    }
    
    // Validar que el stock sea un entero positivo
    const stockInt = parseInt(stock);
    if (isNaN(stockInt) || stockInt < 0) {
        showFeedback("El stock debe ser un número entero positivo", false);
        return false;
    }
    
    // Validar formato de código de barras (opcional)
    if (codigoBarras.length < 3) {
        showFeedback("El código de barras debe tener al menos 3 caracteres", false);
        return false;
    }
    
    return true;
};

  // Mostrar feedback al usuario
  const showFeedback = (message, success) => {
    setModalMessage(message);
    setIsSuccess(success);
    setIsModalOpen(true);
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    const producto = {
      codigo_barras: codigoBarras,
      nombre: nombre,
      descripcion: descripcion || null,
      precio: parseFloat(precio),
      stock: parseInt(stock),
      categoria: categoria || null,
      fecha_creacion: fechaEntrada,
      fecha_actualizacion: fechaEntrada
    };

    try {
      const response = await fetch("http://localhost:5000/api/productos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(producto),
      });

      if (response.ok) {
        showFeedback("Producto agregado exitosamente al inventario", true);
        resetForm();
      } else {
        const errorData = await response.json();
        showFeedback(errorData.message || "Error al agregar el producto", false);
      }
    } catch (error) {
      console.error("Error:", error);
      showFeedback("Error de conexión con el servidor", false);
    } finally {
      setIsLoading(false);
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setCodigoBarras("");
    setNombre("");
    setDescripcion("");
    setPrecio("");
    setStock("");
    setCategoria("");
    setFechaEntrada(new Date().toISOString().slice(0, 16));
  };

  return (
    <div className="entradas-container">
      <h2 className="section-title">Registro de Entradas</h2>
      
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-grid">
          {/* Código de barras */}
          <div className="form-group">
            <label>Código de Barras *</label>
            <input
              type="text"
              placeholder="Ej: 7501008473706"
              value={codigoBarras}
              onChange={(e) => setCodigoBarras(e.target.value)}
              required
              className="form-input"
            />
          </div>
          
          {/* Nombre del producto */}
          <div className="form-group">
            <label>Nombre del Producto *</label>
            <input
              type="text"
              placeholder="Ej: Coca-Cola 600ml"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="form-input"
            />
          </div>
          
          {/* Precio */}
          <div className="form-group">
            <label>Precio *</label>
            <input
              type="number"
              placeholder="Ej: 18.00"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              step="0.01"
              min="0"
              required
              className="form-input"
            />
          </div>
          
          {/* Stock */}
          <div className="form-group">
            <label>Stock Inicial *</label>
            <input
              type="number"
              placeholder="Ej: 50"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              min="0"
              required
              className="form-input"
            />
          </div>
          
          {/* Categoría */}
          <div className="form-group">
            <label>Categoría</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="form-input"
            >
              <option value="">Seleccione una categoría</option>
              {categorias.map((cat, index) => (
                <option key={index} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          {/* Descripción */}
          <div className="form-group full-width">
            <label>Descripción</label>
            <textarea
              placeholder="Descripción del producto..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="form-input"
              rows="3"
            />
          </div>
          
          {/* Fecha de entrada */}
          <div className="form-group">
            <label>Fecha de Entrada</label>
            <input
              type="datetime-local"
              value={fechaEntrada}
              onChange={(e) => setFechaEntrada(e.target.value)}
              className="form-input"
            />
          </div>
        </div>
        
        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "Procesando..." : "Agregar Producto"}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="btn btn-cancel"
          >
            Limpiar Formulario
          </button>
        </div>
      </form>
      
      {/* Modal de feedback */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="feedback-modal"
        overlayClassName="feedback-overlay"
      >
        <div className={`modal-content ${isSuccess ? "success" : "error"}`}>
          <h3>{isSuccess ? "Éxito" : "Error"}</h3>
          <p>{modalMessage}</p>
          <button
            onClick={() => setIsModalOpen(false)}
            className={`btn ${isSuccess ? "btn-success" : "btn-cancel"}`}
          >
            Aceptar
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Entradas;