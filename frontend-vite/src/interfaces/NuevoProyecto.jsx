import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../estilos/NuevoProyecto.css";
import gabinete from "../assets/gabinete.png"; 

export default function NuevoProyecto() {

  const navigate = useNavigate();

  const [selectedComponent, setSelectedComponent] = useState(null);

  const [pcActual, setPcActual] = useState({
  CPU: null,
  Motherboard: null,
  RAM: null,
  GPU: null,
  Almacenamiento: null,
  "Fuente de poder": null,
  Refrigeración: null
  });

  const componentes = [
    "CPU",
    "Motherboard",
    "RAM",
    "GPU",
    "Almacenamiento",
    "Fuente de poder",
    "Refrigeración"
  ];

  const catalogoComponentes = {
  CPU: [
    "Intel i5 12400 ",
    "Intel i7 12700 ",
    "AMD Ryzen 5 5600X ",
    "AMD Ryzen 7 5800X "
  ],

  Motherboard: [
    "ASUS B550 ",
    "MSI B450 ",
    "Gigabyte X570 "
  ],

  RAM: [
    "Corsair 16GB DDR4 ",
    "Kingston Fury 16GB ",
    "G.Skill 32GB DDR4 "
  ],

  GPU: [
    "Nvidia RTX 3060 ",
    "Nvidia RTX 4070 ",
    "AMD RX 6700XT "
  ],

  Almacenamiento: [
    "Samsung SSD 1TB ",
    "WD NVMe 1TB ",
    "Kingston SSD 500GB "
  ],

  "Fuente de poder": [
    "Corsair 650W ",
    "EVGA 700W ",
    "Cooler Master 750W "
  ],

  Refrigeración: [
    "Cooler Master Hyper 212 ",
    "NZXT Kraken X53 ",
    "Noctua NH-D15 "
  ]
  };

  const agregarComponente = (modelo) => {
  setPcActual({
    ...pcActual,
    [selectedComponent]: modelo
  });
  };

  return (
    <div className="nuevo-proyecto-container">

      {/* HEADER */}
      <header className="nuevo-header">
        <button 
          className="btn-volver"
          onClick={() => navigate("/dashboard-user")}
        >
          ← Volver
        </button>

        <h1>Crear nuevo proyecto</h1>
      </header>


      {/* ZONA PRINCIPAL */}
      <div className="nuevo-main">

        {/* LISTA COMPONENTES */}
        <div className="componentes-menu">
          <h3>Componentes</h3>

          {componentes.map((comp) => (
            <button
              key={comp}
              className={`comp-btn ${selectedComponent === comp ? "active" : ""}`}
              onClick={() => setSelectedComponent(comp)}
            >
              {comp}
            </button>
          ))}
        </div>


        {/* IMAGEN CENTRAL */}
        <div className="gabinete-view">

          <img src={gabinete} alt="Gabinete PC" />

          <div className="pc-resumen">
            <h2>Componentes seleccionados</h2>

            <ul>
              {Object.entries(pcActual).map(([componente, modelo]) => (
                <li key={componente}>
                  <strong>{componente}:</strong>{" "}
                  {modelo ? modelo : "No seleccionado"}
                </li>
              ))}
            </ul>
            
          </div>
            
        </div>


        {/* PANEL DERECHO */}
        <div className="component-details">
          {selectedComponent ? (
            <>
              <h3>{selectedComponent}</h3>
              <ul className="lista-modelos">
                {catalogoComponentes[selectedComponent].map((modelo) => (
                  <li key={modelo} className="modelo-item">
                    <span>{modelo}</span>
                
                    <button
                      className="btn-agregar"
                      onClick={() => agregarComponente(modelo)}
                    >
                      Agregar
                    </button>
                  </li>
                ))}
              </ul>

            </>
          ) : (
            <p>Selecciona un componente para comenzar</p>
          )}
        </div>

      </div>

    </div>
  );
}