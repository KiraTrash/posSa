import React, { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Main from "./components/Main";
import Footer from "./components/Footer";
import Dashboard from "./components/Dashboard"; // Importa el componente Dashboard
import Cobros from "./components/Cobros"; // Importa el componente Cobros
import "./styles.css";

const App = () => {
  // Estado para controlar la vista actual
  const [currentView, setCurrentView] = useState("dashboard"); // Por defecto, mostramos el Dashboard

  // Función para cambiar la vista
  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  // Renderizar el componente correspondiente
  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard />;
      case "cobros":
        return <Cobros />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="grid-container">
      <Header />
      <Sidebar onViewChange={handleViewChange} />{" "}
      {/* Pasamos la función para cambiar la vista */}
      <Main>{renderView()}</Main> {/* Renderizamos la vista actual */}
      <Footer />
    </div>
  );
};

export default App;
