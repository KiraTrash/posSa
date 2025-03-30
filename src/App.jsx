// App.jsx (actualizado)
import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Main from './components/Main';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import Cobros from './components/Cobros';
import Entradas from './components/Entradas';
import Salidas from './components/Salidas'; // Nuevo
import Inventario from './components/Inventario';  
import './styles.css';

const App = () => {
  const [currentView, setCurrentView] = useState('dashboard');

  const handleViewChange = (view) => {
    setCurrentView(view.toLowerCase());
  };

  const renderView = () => {
    switch(currentView) {
      case 'dashboard': return <Dashboard />;
      case 'cobros': return <Cobros />;
      case 'entradas': return <Entradas />;
      case 'salidas': return <Salidas />; // Nuevo
      case 'inventario': return <Inventario />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="grid-container">
      <Header />
      <Sidebar onViewChange={handleViewChange} />
      <Main>{renderView()}</Main>
      <Footer />
    </div>
  );
};

export default App;