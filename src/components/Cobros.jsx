import React, { useState, useEffect, useCallback } from "react";
import Modal from 'react-modal';

Modal.setAppElement('#root');

const Cobros = () => {
  // Estados
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [idSearchQuery, setIdSearchQuery] = useState("");
  const [nameSearchQuery, setNameSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [amountReceived, setAmountReceived] = useState("");
  const [change, setChange] = useState(0);

  // Función para buscar productos
  const searchProducts = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/productos/buscar?query=${query}`);
      if (!response.ok) throw new Error("Error en la búsqueda");
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error buscando productos:", error);
      alert("Error al buscar productos");
    }
  }, []);

  // Manejar búsqueda por nombre
  const handleNameSearch = (e) => {
    const query = e.target.value;
    setNameSearchQuery(query);
    if (query.length >= 2) {
      searchProducts(query);
    } else {
      setSearchResults([]);
    }
  };

  // Efecto para búsqueda por ID con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (idSearchQuery.length >= 2) {
        searchProducts(idSearchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [idSearchQuery, searchProducts]);

  // Seleccionar producto de los resultados
  const selectProduct = useCallback((product) => {
    if (!product?.codigo_barras || !product?.nombre || !product?.precio) {
      alert("Producto inválido");
      return;
    }
    setProductId(product.codigo_barras);
    setProductName(product.nombre);
    setPrice(Number(product.precio));
    setIdSearchQuery("");
    setNameSearchQuery("");
    setSearchResults([]);
  }, []);

  // Actualizar stock en la base de datos
  const updateStock = useCallback(async (productId, quantity) => {
    try {
      const response = await fetch('http://localhost:5000/api/productos/update-stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          codigo_barras: productId,
          cantidad: quantity
        })
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar el stock');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }, []);

  // Agregar producto al carrito
  const addProduct = useCallback(async (e) => {
    e.preventDefault();
    
    if (!productId || !productName) {
      alert("Por favor seleccione un producto");
      return;
    }
    
    if (isNaN(quantity)) {
      alert("La cantidad debe ser un número");
      return;
    }
    
    const parsedQuantity = parseInt(quantity);
    if (parsedQuantity <= 0) {
      alert("La cantidad debe ser mayor que cero");
      return;
    }
    
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice)) {
      alert("Precio inválido");
      return;
    }

    const newProduct = {
      id: productId,
      name: productName,
      quantity: parsedQuantity,
      price: parsedPrice,
      total: parsedQuantity * parsedPrice,
    };

    setProducts(prevProducts => [...prevProducts, newProduct]);
    setTotal(prevTotal => prevTotal + newProduct.total);
    resetForm();
  }, [productId, productName, quantity, price]);

  // Resetear formulario
  const resetForm = useCallback(() => {
    setProductId("");
    setProductName("");
    setQuantity(1);
    setPrice(0);
    setIdSearchQuery("");
    setNameSearchQuery("");
  }, []);

  // Abrir modal de checkout
  const openCheckoutModal = useCallback(() => {
    if (products.length === 0) {
      alert("No hay productos en el carrito");
      return;
    }
    setIsCheckoutModalOpen(true);
  }, [products]);

  // Cerrar modal de checkout
  const closeCheckoutModal = useCallback(() => {
    setIsCheckoutModalOpen(false);
    setAmountReceived("");
    setChange(0);
  }, []);

  // Calcular cambio
  const calculateChange = useCallback((amount) => {
    const received = parseFloat(amount);
    if (isNaN(received) || received < total) {
      setChange(0);
      return;
    }
    setChange(received - total);
  }, [total]);

  // Finalizar cobro
  const finalizeCheckout = useCallback(async () => {
    if (parseFloat(amountReceived) < total) {
      alert("El monto recibido es menor que el total");
      return;
    }

    try {
      await Promise.all(products.map(product => 
        updateStock(product.id, -product.quantity)
      ));

      alert(`Venta realizada por $${total.toFixed(2)}. Cambio: $${change.toFixed(2)}`);
      
      setProducts([]);
      setTotal(0);
      setAmountReceived("");
      setChange(0);
      setIsCheckoutModalOpen(false);
    } catch (error) {
      console.error("Error al finalizar la venta:", error);
      alert("Ocurrió un error al procesar la venta");
    }
  }, [amountReceived, change, products, total, updateStock]);

  return (
    <div className="cobros-container">
      <h2 className="section-title">Punto de Venta</h2>

      <form onSubmit={addProduct} className="product-form">
        <div className="search-container">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Buscar por código"
              value={idSearchQuery}
              onChange={(e) => setIdSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchResults.length > 0 && (
              <ul className="search-results">
                {searchResults.map((product) => (
                  <li 
                    key={product.codigo_barras}
                    onClick={() => selectProduct(product)}
                  >
                    {product.nombre} - ${Number(product.precio).toFixed(2)} (Código: {product.codigo_barras})
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="search-bar">
            <input
              type="text"
              placeholder="Buscar por nombre"
              value={nameSearchQuery}
              onChange={handleNameSearch}
              className="search-input"
            />
          </div>
        </div>

        <div className="product-form-grid">
          <input
            type="text"
            placeholder="Nombre del Producto"
            value={productName}
            readOnly
            className="product-input"
          />
          <input
            type="number"
            placeholder="Cantidad"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="1"
            required
            className="quantity-input"
          />
          <input
            type="number"
            placeholder="Precio"
            value={price}
            readOnly
            className="price-input"
          />
          <button
            type="submit"
            className="btn btn-primary"
          >
            Agregar
          </button>
        </div>
      </form>

      <table className="data-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr
              key={index}
              className={index % 2 === 0 ? "even-row" : "odd-row"}
            >
              <td>{product.id}</td>
              <td>{product.name}</td>
              <td>{product.quantity}</td>
              <td>${product.price.toFixed(2)}</td>
              <td>${product.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="total-section">
        <h3 className="total-amount">Total: ${total.toFixed(2)}</h3>
        <button
          onClick={openCheckoutModal}
          className="btn btn-success"
        >
          Finalizar Cobro
        </button>
      </div>

      <Modal
        isOpen={isCheckoutModalOpen}
        onRequestClose={closeCheckoutModal}
        contentLabel="Resumen de Venta"
        className="checkout-modal"
        overlayClassName="checkout-overlay"
      >
        <h2>Resumen de Venta</h2>
        <div className="checkout-summary">
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={index}>
                  <td>{product.name}</td>
                  <td>{product.quantity}</td>
                  <td>${product.price.toFixed(2)}</td>
                  <td>${product.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="checkout-total">
            <p>Total: <strong>${total.toFixed(2)}</strong></p>
          </div>
          <div className="payment-input">
            <label>Monto Recibido:</label>
            <input
              type="number"
              value={amountReceived}
              onChange={(e) => {
                setAmountReceived(e.target.value);
                calculateChange(e.target.value);
              }}
              min={total}
              step="0.01"
            />
          </div>
          {change > 0 && (
            <div className="change-display">
              <p>Cambio: <strong>${change.toFixed(2)}</strong></p>
            </div>
          )}
        </div>
        <div className="checkout-actions">
          <button onClick={closeCheckoutModal} className="btn btn-cancel">
            Cancelar
          </button>
          <button 
            onClick={finalizeCheckout} 
            className="btn btn-confirm"
            disabled={!amountReceived || parseFloat(amountReceived) < total}
          >
            Confirmar Venta
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Cobros;