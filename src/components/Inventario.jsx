import React, { useState, useEffect } from "react";

const Inventario = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Función para formatear precios de manera segura
  const formatPrice = (price) => {
    const num = Number(price);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  // Función para normalizar los datos del producto
  const normalizeProduct = (product) => ({
    codigo_barras: product.codigo_barras?.toString() || 'N/A',
    nombre: product.nombre || 'Sin nombre',
    precio: product.precio ? Number(product.precio) : 0,
    stock: product.stock ? Number(product.stock) : 0,
    categoria: product.categoria || 'Sin categoría'
  });

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/productos?simple=true");
        
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Verificación profunda de la estructura de datos
        if (!Array.isArray(data) && (!data || !Array.isArray(data.productos))) {
          throw new Error("Formato de datos inválido recibido del servidor");
        }

        const productosData = Array.isArray(data) ? data : data.productos;
        
        // Normalizamos todos los productos
        const normalizedProducts = productosData.map(normalizeProduct);
        
        setProductos(normalizedProducts);
        setError(null);
      } catch (err) {
        console.error("Error al cargar productos:", err);
        setError(err.message);
        setProductos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  const filteredProductos = productos.filter(producto => {
    const searchLower = searchTerm.toLowerCase();
    return (
      producto.nombre.toLowerCase().includes(searchLower) ||
      producto.codigo_barras.toString().toLowerCase().includes(searchLower)
    );
  });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando inventario...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Error al cargar el inventario</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className="inventario-container">
      <header className="inventario-header">
        <h2>Inventario</h2>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar por nombre o código de barras..."
            value={searchTerm}
            onChange={handleSearchChange}
            aria-label="Buscar productos"
          />
          <span className="search-icon">🔍</span>
        </div>
      </header>
      
      <div className="productos-table-container">
        {filteredProductos.length > 0 ? (
          <table className="productos-table">
            <thead>
              <tr>
                <th>Código de Barras</th>
                <th>Nombre</th>
                <th>Precio (USD)</th>
                <th>Stock</th>
                <th>Categoría</th>
              </tr>
            </thead>
            <tbody>
              {filteredProductos.map((producto) => (
                <tr key={`${producto.codigo_barras}-${producto.nombre}`}>
                  <td data-label="Código">{producto.codigo_barras}</td>
                  <td data-label="Nombre">{producto.nombre}</td>
                  <td data-label="Precio">${formatPrice(producto.precio)}</td>
                  <td data-label="Stock" className={producto.stock <= 5 ? 'low-stock' : ''}>
                    {producto.stock}
                  </td>
                  <td data-label="Categoría">{producto.categoria}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-products-message">
            <p>
              {searchTerm 
                ? 'No se encontraron productos que coincidan con tu búsqueda' 
                : 'No hay productos disponibles en el inventario'
              }
            </p>
            {!searchTerm && (
              <button className="add-product-button">
                Agregar Primer Producto
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventario;