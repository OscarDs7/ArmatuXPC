import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import gabinete from "../assets/gabinete.png"; 
import { filtroComponente } from "../services/api"; 
import "../estilos/NuevoProyecto.css";

export default function NuevoProyecto() {
  const navigate = useNavigate();
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [listaComponentes, setListaComponentes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Guardaremos el ID del componente que está expandido
  const [expandidoId, setExpandidoId] = useState(null); 

  const [pcActual, setPcActual] = useState({
    CPU: null, Motherboard: null, RAM: null, GPU: null,
    Almacenamiento: null, "Fuente de poder": null,
    Refrigeracion: null, Gabinete: null
  });

  const mapTipo = {
    CPU: "CPU", GPU: "GPU", RAM: "MemoriaRAM",
    Almacenamiento: "Almacenamiento", "Fuente de poder": "FuentePoder",
    Motherboard: "PlacaBase", Refrigeracion: "Refrigeracion", Gabinete: "Gabinete"
  };

  useEffect(() => {
    if (!selectedComponent) return;
    const obtenerComponentes = async () => {
      try {
        setLoading(true);
        const tipoBackend = mapTipo[selectedComponent];
        const data = await filtroComponente(tipoBackend);
        setListaComponentes(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    obtenerComponentes();
  }, [selectedComponent]);

  const componentes = ["CPU", "Motherboard", "RAM", "GPU", "Almacenamiento", "Fuente de poder", "Refrigeracion", "Gabinete"];

  const agregarComponente = (componente) => {
    setPcActual({ ...pcActual, [selectedComponent]: componente });
    setExpandidoId(null);
  };

  // Movimos la lógica de Watts dentro de una función simple para usarla en el render
  const renderWatts = (comp) => {
    const isPSU = comp.tipo === "FuentePoder";
    return (
      <p>
        <strong>{isPSU ? "Capacidad" : "Consumo"}:</strong> {isPSU ? comp.capacidadWatts : comp.consumoWatts}W
      </p>
    );
  };

  // Cálculos de precio total y consumo energético total del armado
  const total = Object.values(pcActual).filter(Boolean).reduce((acc, comp) => acc + (comp.precio || 0), 0);
  const watts = Object.values(pcActual).filter(Boolean).reduce((acc, comp) => acc + (comp.consumoWatts || 0), 0);

  return (
    <div className="nuevo-proyecto-container">
      <header className="nuevo-header">
        <button className="btn-volver" onClick={() => navigate("/dashboard-user")}>← Volver</button>
        <h1>Crear nuevo proyecto</h1>
      </header>

      <div className="nuevo-main">
        {/* SIDEBAR IZQUIERDO */}
        <div className="componentes-menu">
          <h3>Componentes</h3>
          {componentes.map((comp) => (
            <button key={comp} className={`comp-btn ${selectedComponent === comp ? "active" : ""}`} onClick={() => setSelectedComponent(comp)}>
              {comp}
            </button>
          ))}
        </div>

        {/* VISTA CENTRAL */}
        <div className="central-view">
          <div className="gabinete-view">
            <img src={gabinete} alt="Gabinete PC" />
          </div>
          <div className="pc-resumen">
            <h2>Resumen del armado</h2>
            <ul>
              {Object.entries(pcActual).map(([key, modelo]) => (
                <li key={key} className="resumen-item">
                  <strong>{key}:</strong> {modelo ? `${modelo.nombre} ($${modelo.precio})` : "Pendiente"}
                </li>
              ))}
            </ul>
            <div className="resumen-extra">
              <p>Total: <strong>${total}</strong></p>
              <p>Consumo: <strong>{watts}W</strong></p>
            </div>
          </div>
        </div>

        {/* PANEL DERECHO: CATÁLOGO */}
        <div className="component-details">
          {selectedComponent ? (
            <>
              <h3>Catálogo de {selectedComponent}</h3>
              <div className="lista-modelos">
                {loading ? <p>Cargando...</p> : 
                  listaComponentes.map((comp) => (
                    <div key={comp.componenteId} className={`card-componente ${
                        pcActual[selectedComponent]?.componenteId === comp.componenteId 
                          ? "seleccionado" 
                          : ""
                      }`}>
                      {/* Cabecera de la tarjeta: Siempre visible */}
                      <div className="card-header-simple">
                        <h4>{comp.nombre}</h4>
                        <button 
                          className="btn-expandir" 
                          onClick={() => setExpandidoId(expandidoId === comp.componenteId ? null : comp.componenteId)}
                        >
                          {expandidoId === comp.componenteId ? "− Ver menos" : "+ Detalles"}
                        </button>
                      </div>

                      {/* Cuerpo de la tarjeta: Solo si está expandido */}
                      {expandidoId === comp.componenteId && (
                        <div className="card-expanded-content">
                          <img src={comp.imagenUrl} alt={comp.nombre} className="card-img-small" />
                          <div className="info-detallada">
                            <p><strong>Marca:</strong> {comp.marca}</p>
                            <p><strong>Modelo:</strong> {comp.modelo}</p>
                            <p className="precio"><strong>Precio:</strong> ${comp.precio}</p>
                            {renderWatts(comp)}
                            <button className="btn-agregar" onClick={() => agregarComponente(comp)}>
                              Seleccionar este
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                }
              </div>
            </>
          ) : <p>Selecciona una categoría a la izquierda</p>}
        </div>
      </div>
    </div>
  );
}