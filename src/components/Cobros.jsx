import React, { useState } from "react";

const Cobros = () => {
  // Estado para manejar los productos agregados
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);

  // Estado para el formulario de agregar productos
  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);

  // Función para agregar un producto
  const addProduct = (e) => {
    e.preventDefault();

    const newProduct = {
      id: productId,
      name: productName,
      quantity: parseInt(quantity),
      price: parseFloat(price),
      total: parseInt(quantity) * parseFloat(price),
    };

    // Agregar el producto a la lista
    setProducts([...products, newProduct]);

    // Actualizar el total general
    setTotal(total + newProduct.total);

    // Limpiar el formulario
    setProductId("");
    setProductName("");
    setQuantity(1);
    setPrice(0);
  };

  // Función para finalizar el cobro
  const handleCheckout = () => {
    alert(`Cobro realizado por un total de $${total.toFixed(2)}`);
    setProducts([]);
    setTotal(0);
  };

  return (
    <div>
      <h2>Punto de Venta</h2>

      {/* Formulario para agregar productos */}
      <form onSubmit={addProduct} style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <input
            type="text"
            placeholder="ID del Producto"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            required
            style={{ padding: "5px", flex: 1 }}
          />
          <input
            type="text"
            placeholder="Nombre del Producto"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
            style={{ padding: "5px", flex: 2 }}
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
            onChange={(e) => setPrice(e.target.value)}
            step="0.01"
            required
            style={{ padding: "5px", flex: 1 }}
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
