import React, { useState, useEffect } from "react";

const Cobros = () => {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // Buscar productos por código o nombre
  const searchProducts = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/productos/buscar?query=${query}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error buscando productos:", error);
    }
  };

  // Manejar cambio en el campo de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Seleccionar producto de los resultados
  const selectProduct = (product) => {
    setProductId(product.codigo_barras);
    setProductName(product.nombre);
    setPrice(product.precio);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Agregar producto al carrito
  const addProduct = (e) => {
    e.preventDefault();
    if (!productId || !productName) return;

    const newProduct = {
      id: productId,
      name: productName,
      quantity: parseInt(quantity),
      price: parseFloat(price),
      total: parseInt(quantity) * parseFloat(price),
    };

    setProducts([...products, newProduct]);
    setTotal(total + newProduct.total);
    resetForm();
  };

  // Resetear formulario
  const resetForm = () => {
    setProductId("");
    setProductName("");
    setQuantity(1);
    setPrice(0);
    setSearchQuery("");
  };

  const handleCheckout = () => {
    alert(`Cobro realizado por un total de $${total.toFixed(2)}`);
    setProducts([]);
    setTotal(0);
  };

  return (
    <div>
      <h2>Punto de Venta</h2>

      <form onSubmit={addProduct} style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <input
              type="text"
              placeholder="Buscar por código o nombre"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: "5px", width: "100%" }}
            />
            {searchResults.length > 0 && (
              <ul style={{
                position: "absolute",
                zIndex: 100,
                width: "100%",
                backgroundColor: "#fff",
                border: "1px solid #ddd",
                maxHeight: "200px",
                overflowY: "auto",
                marginTop: "2px",
                padding: 0,
                listStyle: "none"
              }}>
                {searchResults.map((product) => (
                  <li 
                    key={product.codigo_barras}
                    onClick={() => selectProduct(product)}
                    style={{
                      padding: "8px",
                      cursor: "pointer",
                      borderBottom: "1px solid #eee"
                    }}
                  >
                    {product.nombre} - ${product.precio} (Código: {product.codigo_barras})
                  </li>
                ))}
              </ul>
            )}
          </div>
          <input
            type="text"
            placeholder="Nombre del Producto"
            value={productName}
            readOnly
            style={{ padding: "5px", flex: 2, backgroundColor: "#f0f0f0" }}
          />
          <input
            type="number"
            placeholder="Cantidad"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="1"
            required
            style={{ padding: "5px", flex: 1 }}
          />
          <input
            type="number"
            placeholder="Precio"
            value={price}
            readOnly
            style={{ padding: "5px", flex: 1, backgroundColor: "#f0f0f0" }}
          />
          <button
            type="submit"
            style={{
              padding: "5px 10px",
              background: "#3498db",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Agregar
          </button>
        </div>
      </form>

      {/* Tabla de productos agregados */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "20px",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#34495e", color: "#ecf0f1" }}>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>ID</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>
              Producto
            </th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>
              Cantidad
            </th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>
              Precio
            </th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr
              key={index}
              style={{ backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff" }}
            >
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                {product.id}
              </td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                {product.name}
              </td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                {product.quantity}
              </td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                ${product.price.toFixed(2)}
              </td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                ${product.total.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Total general y botón de cobro */}
      <div style={{ textAlign: "right" }}>
        <h3>Total: ${total.toFixed(2)}</h3>
        <button
          onClick={handleCheckout}
          style={{
            padding: "10px 20px",
            background: "#27ae60",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Finalizar Cobro
        </button>
      </div>
    </div>
  );
};

export default Cobros;