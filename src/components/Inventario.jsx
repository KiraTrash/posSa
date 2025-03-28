import React, { useState, useEffect } from "react";

const Inventario = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/productos");
        if (!response.ok) throw new Error("Error al cargar los productos");
        const data = await response.json();
        
        const productosFormateados = data.map(producto => ({
          ...producto,
          precio: Number(producto.precio) || 0
        }));
        
        setProductos(productosFormateados);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  const filteredProductos = productos.filter(producto =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (producto.codigo_barras && producto.codigo_barras.includes(searchTerm))
  );

  if (loading) return <div className="loading">Cargando inventario...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="inventario-container">
      <h2>Inventario</h2>
      
      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar por nombre o código..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <table className="productos-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Categoría</th>
          </tr>
        </thead>
        <tbody>
          {filteredProductos.length > 0 ? (
            filteredProductos.map((producto, index) => (
              <tr 
                key={producto.codigo_barras || index} 
                className={index % 2 === 0 ? "even-row" : "odd-row"}
              >
                <td>{producto.codigo_barras}</td>
                <td>{producto.nombre}</td>
                <td>${producto.precio.toFixed(2)}</td>
                <td className={producto.stock < 10 ? "low-stock" : ""}>
                  {producto.stock}
                </td>
                <td>{producto.categoria}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="no-results">
                No se encontraron productos
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Inventario;