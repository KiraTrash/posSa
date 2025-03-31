import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles.css';

const Usuarios = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Obtener datos del usuario actual
        const response = await fetch('/api/users/me', {
          headers: {
            'Authorization': `Bearer ${currentUser.token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Error al obtener datos del usuario');
        }
        
        const data = await response.json();
        setUserData(data);
        
        // Si el usuario es admin, obtener todos los usuarios
        if (data.rol === 'admin') {
          const allUsersResponse = await fetch('/api/users', {
            headers: {
              'Authorization': `Bearer ${currentUser.token}`,
            },
          });
          
          if (!allUsersResponse.ok) {
            throw new Error('Error al obtener lista de usuarios');
          }
          
          const allUsersData = await allUsersResponse.json();
          setAllUsers(allUsersData);
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [currentUser]);

  if (loading) {
    return <div className="loading">Cargando información de usuario...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="usuarios-container">
      <h2>Información de Usuario</h2>
      
      <div className="current-user-card">
        <h3>Tu perfil</h3>
        <div className="user-info">
          <p><strong>Usuario:</strong> {userData.username}</p>
          <p><strong>Rol:</strong> {userData.rol}</p>
          <p><strong>Estado:</strong> {userData.activo ? 'Activo' : 'Inactivo'}</p>
          <p><strong>Miembro desde:</strong> {new Date(userData.creado_en).toLocaleDateString()}</p>
        </div>
      </div>
      
      {userData.rol === 'admin' && (
        <div className="all-users-section">
          <h3>Administrar Usuarios</h3>
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.rol}</td>
                  <td>{user.activo ? 'Activo' : 'Inactivo'}</td>
                  <td>{new Date(user.creado_en).toLocaleDateString()}</td>
                  <td>
                    <button className="btn-edit">Editar</button>
                    <button className="btn-deactivate">
                      {user.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Usuarios;