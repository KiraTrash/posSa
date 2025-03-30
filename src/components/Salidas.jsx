import React, { useState } from 'react';
import axios from 'axios';

const Salidas = () => {
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    proveedor_nombre: '',
    monto: '',
    concepto: '',
    fecha: new Date().toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }),
    metodo_pago: 'efectivo',
    registrado_por: 'usuario' // Cambiar por tu sistema de autenticación
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccessMessage('');
      
      // Validación mejorada
      if (!formData.proveedor_nombre.trim()) {
        throw new Error('El nombre del proveedor es requerido');
      }

      const montoNumerico = parseFloat(formData.monto);
      if (isNaN(montoNumerico) || montoNumerico <= 0) {
        throw new Error('El monto debe ser un número mayor que cero');
      }

      // Preparar datos para enviar
      const datosEnvio = {
        proveedor_nombre: formData.proveedor_nombre.trim(),
        monto: parseFloat(formData.monto),
        concepto: formData.concepto.trim() || null,
        metodo_pago: formData.metodo_pago,
        registrado_por: 'usuario_actual' // Reemplazar con tu sistema de autenticación
      };

      const response = await axios.post('http://localhost:5000/api/salidas', datosEnvio);
      
      setSuccessMessage(`Salida registrada correctamente (ID: ${response.data.data?.id || 'N/A'})`);
      
      // Limpiar formulario (excepto fecha y método de pago)
      setFormData(prev => ({
        ...prev,
        proveedor_nombre: '',
        monto: '',
        concepto: ''
      }));

    } catch (error) {
      console.error('Error al registrar salida:', error);
      const errorMessage = error.response?.data?.error || 
                         error.response?.data?.message || 
                         error.message || 
                         'Error al registrar salida';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="salidas-container">
      <h2>Registro de Salidas de Efectivo</h2>
      
      {error && (
        <div className="error">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Cerrar</button>
        </div>
      )}
      
      {successMessage && (
        <div className="success">
          <p>{successMessage}</p>
          <button onClick={() => setSuccessMessage('')}>Cerrar</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="salidas-form">
        <div className="form-group">
          <label>Nombre del Proveedor *</label>
          <input
            type="text"
            name="proveedor_nombre"
            value={formData.proveedor_nombre}
            onChange={handleChange}
            required
            placeholder="Ej: Distribuidora de Alimentos"
            maxLength="100"
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label>Monto *</label>
          <input
            type="number"
            name="monto"
            value={formData.monto}
            onChange={(e) => {
              // Validación para permitir solo números y un punto decimal
              const value = e.target.value;
              if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
                handleChange(e);
              }
            }}
            step="0.01"
            min="0.01"
            required
            placeholder="Ej: 1500.50"
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label>Concepto</label>
          <input
            type="text"
            name="concepto"
            value={formData.concepto}
            onChange={handleChange}
            placeholder="Ej: Pago por mercancía"
            maxLength="100"
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label>Fecha</label>
          <input
            type="text"
            name="fecha"
            value={formData.fecha}
            readOnly
          />
        </div>

        <div className="form-group">
          <label>Método de Pago</label>
          <select 
            name="metodo_pago" 
            value={formData.metodo_pago} 
            onChange={handleChange}
            disabled={isSubmitting}
          >
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="cheque">Cheque</option>
            <option value="tarjeta">Tarjeta</option>
          </select>
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Registrando...' : 'Registrar Salida'}
        </button>
      </form>
    </div>
  );
};

export default Salidas;