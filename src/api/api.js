export const authFetch = async (url, options = {}) => {
    const response = await fetch(`http://localhost:5000${url}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
  
    if (response.status === 401) {
      // Sesión expirada o inválida
      window.location.href = '/login';
      return;
    }
  
    return response;
  };