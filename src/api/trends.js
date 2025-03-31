// src/api/trends.js
import { getMockTrendsData } from './mockTrends';

export const fetchGoogleTrendsData = async (keyword = 'comida rapida') => {
  // En desarrollo, usa siempre datos mock
  if (process.env.NODE_ENV === 'development') {
    console.log('Usando datos mock para desarrollo');
    return getMockTrendsData(keyword);
  }

  try {
    const response = await fetch(
      `http://localhost:5000/api/google-trends?keyword=${encodeURIComponent(keyword)}`
    );
    
    if (!response.ok) {
      console.warn('Error en la API, usando datos mock como fallback');
      return getMockTrendsData(keyword);
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('Error al obtener tendencias:', error);
    return getMockTrendsData(keyword); // Fallback a mock
  }
};