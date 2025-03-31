import React, { useState, useEffect } from "react";
import { 
  BarChart, Bar, 
  XAxis, YAxis, 
  CartesianGrid, Tooltip,
  ResponsiveContainer 
} from "recharts";
import { fetchGoogleTrendsData } from "../api/trends";

const Dashboard = () => {
  const [currentTime] = useState(new Date().toLocaleTimeString());
  const [trendsData, setTrendsData] = useState([]);
  const [selectedKeyword, setSelectedKeyword] = useState('comida rapida');
  const [isLoading, setIsLoading] = useState(false);
  const [isMockData, setIsMockData] = useState(false);

  // Datos para las cards
  const dashboardStats = [
    { title: "Total de ventas hoy", value: "$1,500.00", change: "+2.5%" },
    { title: "Productos en inventario", value: "120", change: "-5" },
    { 
      title: "Tendencia actual", 
      value: selectedKeyword, 
      change: isMockData ? "🟡 Mock" : "🟢 Real" 
    }
  ];

  // Cargar datos de tendencias
  useEffect(() => {
    const loadTrendsData = async () => {
      setIsLoading(true);
      try {
        const result = await fetchGoogleTrendsData(selectedKeyword);
        setTrendsData(result.data.slice(0, 14)); // Últimas 2 semanas
        setIsMockData(result.isMock);
      } catch (error) {
        console.error("Error loading trends:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTrendsData();
  }, [selectedKeyword]);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Dashboard</h1>
      <p style={{ color: '#666' }}>Bienvenido a Vault 4 POS</p>

      {/* Cards superiores */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        margin: '20px 0'
      }}>
        {dashboardStats.map((stat, index) => (
          <div key={index} style={{
            padding: '15px',
            borderRadius: '8px',
            background: 'white',
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
            borderLeft: `4px solid ${index === 0 ? '#4CAF50' : index === 1 ? '#F44336' : '#FFC107'}`
          }}>
            <h3 style={{ marginTop: 0, fontSize: '16px', color: '#555' }}>
              {stat.title}
            </h3>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {stat.value}
              </span>
              <span style={{
                color: stat.change.includes('+') ? '#4CAF50' : 
                      stat.change.includes('-') ? '#F44336' : '#FFC107',
                fontWeight: 'bold'
              }}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Selector de tendencia */}
      <div style={{
        margin: '30px 0',
        padding: '15px',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
      }}>
        <h3 style={{ marginTop: 0 }}>Tendencias de búsqueda</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <select
            value={selectedKeyword}
            onChange={(e) => setSelectedKeyword(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              minWidth: '200px'
            }}
          >
            <option value="comida rapida">Comida rápida</option>
            <option value="abarrotes">Abarrotes</option>
            <option value="supermercado">Supermercado</option>
            <option value="tienda">Tienda</option>
          </select>
          
          <div style={{
            padding: '6px 10px',
            background: isMockData ? '#FFF3E0' : '#E8F5E9',
            borderRadius: '4px',
            color: isMockData ? '#E65100' : '#2E7D32',
            fontSize: '14px'
          }}>
            {isMockData ? 'Usando datos de prueba' : 'Datos en tiempo real'}
          </div>
        </div>
      </div>

      {/* Gráfico de tendencias */}
      <div style={{
        padding: '20px',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        marginBottom: '30px'
      }}>
        {isLoading ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            padding: '40px'
          }}>
            <p>Cargando datos...</p>
          </div>
        ) : trendsData.length > 0 ? (
          <>
            <h3 style={{ marginTop: 0 }}>
              Interés de búsqueda: "{selectedKeyword}"
            </h3>
            <div style={{ height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    interval={Math.ceil(trendsData.length / 7)} 
                  />
                  <YAxis 
                    domain={[0, 100]}
                    tickCount={6}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{
                      background: '#fff',
                      borderRadius: '6px',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                      border: 'none'
                    }}
                    formatter={(value) => [`Interés: ${value}`, 'Fecha']}
                  />
                  <Bar 
                    dataKey="value" 
                    name="Interés" 
                    fill="#4285F4" 
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p style={{ 
              fontSize: '12px', 
              color: '#777', 
              textAlign: 'right',
              margin: '10px 0 0'
            }}>
              {isMockData ? 'Datos simulados para desarrollo' : 'Datos actualizados: ' + new Date().toLocaleString()}
            </p>
          </>
        ) : (
          <p>No hay datos disponibles</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;