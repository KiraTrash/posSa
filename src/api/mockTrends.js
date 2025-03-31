// src/api/mockTrends.js
export const getMockTrendsData = (keyword = 'comida rapida') => {
    // Datos base por tipo de keyword
    const trendsBase = {
      'comida rapida': {
        avg: 65,
        variation: 15
      },
      'abarrotes': {
        avg: 40,
        variation: 10
      },
      'supermercado': {
        avg: 55,
        variation: 12
      },
      'tienda': {
        avg: 35,
        variation: 8
      }
    };
  
    // Configuración seleccionada o valores por defecto
    const config = trendsBase[keyword.toLowerCase()] || {
      avg: 50,
      variation: 10
    };
  
    // Generar 30 días de datos (último mes)
    const mockData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      
      // Valor base con variación aleatoria
      const baseValue = config.avg + (Math.random() * 2 - 1) * config.variation;
      const value = Math.max(0, Math.min(100, Math.round(baseValue))); // Asegurar entre 0-100
      
      return {
        date: date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }),
        value,
        formattedValue: value.toString()
      };
    });
  
    return {
      success: true,
      keyword,
      data: mockData,
      isMock: true,
      updatedAt: new Date().toISOString()
    };
  };