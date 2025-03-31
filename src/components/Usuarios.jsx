import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';

const Usuarios = () => {
  const [usuario, setUsuario] = useState({
    username: '',
    password: '',
    rol: 'cajero',
    activo: true
  });

  const [usuariosRegistrados, setUsuariosRegistrados] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);

  const rolesDisponibles = [
    'administrador',
    'cajero',
    'inventario'
  ];

  const cargarUsuarios = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Error al cargar usuarios');
      const data = await response.json();
      setUsuariosRegistrados(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUsuario(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');
    
    if (!usuario.username || !usuario.password) {
      setMensaje('Nombre de usuario y contraseña son obligatorios');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(usuario),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al registrar usuario');
      }

      const data = await response.json();
      setMensaje(data.message);
      await cargarUsuarios();
      
      setUsuario({
        username: '',
        password: '',
        rol: 'cajero',
        activo: true
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEliminarUsuario = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar usuario');
      }

      const data = await response.json();
      setMensaje(data.message);
      await cargarUsuarios();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="usuarios-container">
      <div className="user-info">
        {user && <p>Usuario logueado: <strong>{user.username}</strong> (Rol: {user.rol})</p>}
      </div>
      
      <h2 className="main-title">Gestión de Usuarios/Empleados</h2>
      
      {/* Contenedor para la tabla */}
      <div className="table-section">
        <h3 className="section-title">Usuarios Registrados</h3>
        {usuariosRegistrados.length === 0 ? (
          <p className="no-data">No hay usuarios registrados</p>
        ) : (
          <div className="table-container">
            <table className="usuarios-table">
              <thead>
                <tr>
                  <th>Nombre de usuario</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Fecha de Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosRegistrados.map((usr) => (
                  <tr key={usr.id}>
                    <td>{usr.username}</td>
                    <td>{usr.rol}</td>
                    <td>{usr.activo ? 'Activo' : 'Inactivo'}</td>
                    <td>{new Date(usr.creado_en).toLocaleDateString()}</td>
                    <td>
                      <button 
                        onClick={() => handleEliminarUsuario(usr.id)}
                        className="delete-btn"
                        disabled={user && user.username === usr.username}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Contenedor para el formulario */}
      <div className="form-section">
        <h3 className="section-title">Registrar Nuevo Usuario/Empleado</h3>
        <form onSubmit={handleSubmit} className="usuarios-form">
          <div className="form-row">
            <div className="form-group">
              <label>Nombre de usuario:</label>
              <input
                type="text"
                name="username"
                value={usuario.username}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Contraseña:</label>
              <input
                type="password"
                name="password"
                value={usuario.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Rol:</label>
              <select
                name="rol"
                value={usuario.rol}
                onChange={handleChange}
              >
                {rolesDisponibles.map((rol, index) => (
                  <option key={index} value={rol}>
                    {rol}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Estado:</label>
              <select
                name="activo"
                value={usuario.activo}
                onChange={(e) => setUsuario({...usuario, activo: e.target.value === 'true'})}
              >
                <option value={true}>Activo</option>
                <option value={false}>Inactivo</option>
              </select>
            </div>
          </div>
          
          <button type="submit" className="submit-btn">Registrar Usuario</button>
        </form>
        
        {mensaje && <p className="mensaje">{mensaje}</p>}
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
};
export default Usuarios;