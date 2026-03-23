import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import gabinete from "../assets/gabinete.png"; 
import { filtroComponente, guardarArmado } from "../services/api"; 
import "../estilos/NuevoProyecto.css";

export default function NuevoProyecto() {
  const navigate = useNavigate();
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [listaComponentes, setListaComponentes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  
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

  // Bloquear scroll cuando el modal está abierto
useEffect(() => {
  if (imagenSeleccionada) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'unset';
  }
}, [imagenSeleccionada]);

  const componentes = ["CPU", "Motherboard", "RAM", "GPU", "Almacenamiento", "Fuente de poder", "Refrigeracion", "Gabinete"];

  const agregarComponente = (componente) => {
    setPcActual({ ...pcActual, [selectedComponent]: componente });
    setExpandidoId(null);
  };

  const quitarComponente = () => {
  setPcActual({
    ...pcActual,
    [selectedComponent]: null
  });
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

  // Definimos el margen de seguridad de consumo de los componentes (1.2 = +20%)
  const margen_seguridad = 1.2;

  // Calculamos si la fuente es suficiente considerando el margen
  const fuente = pcActual["Fuente de poder"];
  const wattsConMargen = watts * margen_seguridad

  // Validamos comparación
  const energiaValida = fuente
    ? fuente.capacidadWatts >= wattsConMargen
    : true; // Si no hay fuente seleccionada aún, es true para no asustar al usuario


  // --- FUNCIÓN PARA GUARDAR UN ARMADO NUEVO --- //
  const handleGuardarArmado = async () => {
    // 1. Obtenemos el usuario actual de Firebase almacenado en localStorage para mayor persistencia del dato
    const uidSession = localStorage.getItem("userUid"); // Aquí está tu string de Firebase 
    
    if (!uidSession) {
      alert("No se detectó sesión activa.");
      return;
    }

    // --- VALIDACIÓN DE COMPONENTES ESENCIALES ---
    const esenciales = ["CPU", "Motherboard", "RAM", "Fuente de poder", "Gabinete"];
    const faltantes = esenciales.filter(tipo => !pcActual[tipo]);

    if (faltantes.length > 0) {
      alert(`Para un armado funcional, aún te falta seleccionar: ${faltantes.join(", ")}`);
      return;
    }

    // --- VALIDACIÓN ENERGÉTICA ---
    if (!energiaValida) {
      alert("No puedes guardar el armado: el consumo total excede la capacidad de la fuente de poder.");
      return;
    }

    // --- SOLICITUD DE NOMBRE ---
    const nombrePrompt = window.prompt("Dale un nombre a tu creación:", "Mi PC Nueva");
    if (!nombrePrompt) return;

    // --- ESTRUCTURA PARA EL DTO DE C# ---
    // Obtenemos todos los componentes seleccionados (ignoramos los nulos)
    const componentesPayload = Object.entries(pcActual)
      .filter(([key, value]) => value !== null)
      .map(([key, comp]) => ({
        componenteId: comp.componenteId,
        cantidad: 1 
      }));

    const nuevoArmado = {
      usuarioId: uidSession,
      nombreArmado: nombrePrompt,
      componentes: componentesPayload
    };

    try {
      setLoading(true);
      await guardarArmado(nuevoArmado);
      alert("🚀 ¡Proyecto guardado exitosamente!");
      navigate("/mis-armados"); // Redirige a la lista de proyectos del usuario
    } catch (error) {
      // Si el backend lanza el BadRequest que vimos en tu C# (Error energético)
      console.error("Error del servidor:", error);
      alert(`Error al guardar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

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
                  <strong>{key}:</strong> {modelo ? `${modelo.nombre} ($${modelo.precio})` : "Sin seleccionar"}
                </li>
              ))}
            </ul>
            <div className="resumen-extra">
                <p>Total: <strong>${total}</strong></p>
                <p>Consumo Real: <strong>{watts}W</strong></p>
                
                {/* Mostramos el consumo recomendado con el margen del 20% */}
                <p>Consumo Recomendado (+20%):  
                  <strong style={{ color: energiaValida ? "inherit" : "#dc2626" }}>
                      {Math.round(watts * 1.2)}W
                  </strong>
                </p>

                <p>Capacidad Fuente: <strong>{fuente?.capacidadWatts || 0}W</strong></p>
              </div>
              <div className="mensaje-energetico">
                <p style={{ color: energiaValida ? "#059669" : "#dc2626", fontWeight: "bold", marginTop: "10px" }}>
                  {energiaValida 
                    ? "✔ Configuración Energética Segura" 
                    : "⚠ Se recomienda una fuente más potente (Margen de seguridad insuficiente)"}
                </p>
              </div>
            {/* Botón de Guardar */}
              <button 
                className="btn-guardar-final" 
                onClick={handleGuardarArmado}
                disabled={loading} // Deshabilitar si hay error de energía
              >
                {loading ? "Procesando..." : "Guardar Proyecto"}
              </button>
              {/* Mensaje de ayuda visual */}
              {!energiaValida && (
                <p style={{ color: "#dc2626", fontSize: "0.8rem", marginTop: "10px" }}>
                  ⚠️ Revisa la fuente de poder antes de guardar.
                </p>
              )}
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
                          <img 
                            src={comp.imagenUrl} 
                            alt={comp.nombre} 
                            className="card-img-small clickable"
                            onClick={() => setImagenSeleccionada(comp.imagenUrl)}
                          />
                          <div className="info-detallada">
                            <p><strong>Marca:</strong> {comp.marca}</p>
                            <p><strong>Modelo:</strong> {comp.modelo}</p>
                            <p className="precio"><strong>Precio:</strong> ${comp.precio}</p>
                            {renderWatts(comp)}
                              <div className="acciones-botones">
                                  {! pcActual[selectedComponent]? (
                                    <button 
                                      className="btn-agregar"
                                      onClick={() => agregarComponente(comp)}
                                    >
                                      Seleccionar
                                    </button>
                                  ) : (
                                    <button 
                                      className="btn-quitar"
                                      onClick={quitarComponente}
                                    >
                                      Quitar
                                    </button>
                                  )}
                                </div>
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

      {/* MODAL DE IMAGEN DEL CARDVIEW PARA AMPLIARLA */}
        {imagenSeleccionada && (
          <div 
            className="modal-overlay"
            onClick={() => setImagenSeleccionada(null)}
          >
            <div 
              className="modal-content"
              onClick={(e) => e.stopPropagation()} // 🔥 evita cerrar al hacer click dentro
            >
              <img 
                src={imagenSeleccionada} 
                alt="Vista ampliada" 
                className="modal-img"
              />

              <button 
                className="btn-cerrar-modal"
                onClick={() => setImagenSeleccionada(null)}
              >
                ✕
              </button>
              
            </div>
          </div>
        )}
       </div>
  );
}