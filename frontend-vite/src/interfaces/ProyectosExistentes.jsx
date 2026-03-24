import { useEffect, useState } from "react";
import { obtenerMisArmados } from "../services/api";
import "../estilos/Proyectos.css";

export default function ProyectosExistentes() {
  const [proyectos, setProyectos] = useState([]);
  // 💡 Nuevo estado para controlar qué proyecto se ve en el modal
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  
  const uid = localStorage.getItem("userUid");

  useEffect(() => {
    if (uid) {
      obtenerMisArmados(uid)
        .then(data => setProyectos(data))
        .catch(err => console.log(err));
    }
  }, [uid]);

  // Función para cerrar el modal
  const cerrarModal = () => setProyectoSeleccionado(null);

  return (
    <div className="proyectos-container">
      <h2>Mis PCs Armadas 🖥️</h2>

      <div className="proyectos-grid">
        {proyectos.map((p) => (
          <div key={p.armadoId} className="proyecto-card">
            <div className="proyecto-header">
              <h3 className="proyecto-nombre">{p.nombreArmado}</h3>
              <p className="proyecto-fecha">
                📅 Creado el: {new Date(p.fechaCreacion).toLocaleDateString('es-MX')}
              </p>
            </div>

            <div className="proyecto-body">
              <strong>Componentes principales:</strong>
              <div style={{ marginTop: '8px' }}>
                {p.componentes.slice(0, 3).map((c, index) => (
                  <span key={index} className="componente-tag">
                    {c.nombre}
                  </span>
                ))}
                {p.componentes.length > 3 && (
                  <span className="componente-tag">+{p.componentes.length - 3} más</span>
                )}
              </div>
            </div>

            {/* 💡 Corregido: Ahora asignamos el proyecto al estado al dar clic */}
            <button className="btn-detalle" onClick={() => setProyectoSeleccionado(p)}>
              Ver Configuración Completa
            </button>
          </div>
        ))}
      </div>

      {/* ===============================
          LÓGICA DEL MODAL (VENTANA EMERGENTE)
          =============================== */}
      {proyectoSeleccionado && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            
            {/* Botón X para cerrar ventana emergente */}
            <button className="btn-cerrar" onClick={cerrarModal}>X</button>

            <div className="modal-header">
              <h2>{proyectoSeleccionado.nombreArmado}</h2>
            </div>

            <table className="tabla-detalles">
              <thead>
                <tr>
                  <th>Componente</th>
                  <th>Modelo</th>
                  <th>Precio</th>
                </tr>
              </thead>
              <tbody>
                {proyectoSeleccionado.componentes.map((c, index) => {
                // Mapeo exacto del Enum (TipoComponente.cs) de C# a clases de CSS
                const obtenerClaseTipo = (tipo) => {
                  switch (tipo) {
                    case "CPU": return "tipo-cpu";
                    case "GPU": return "tipo-gpu";
                    case "MemoriaRAM": return "tipo-ram";
                    case "Almacenamiento": return "tipo-storage";
                    case "FuentePoder": return "tipo-psu";
                    case "PlacaBase": return "tipo-motherboard";
                    case "Gabinete": return "tipo-case";
                    case "Refrigeracion": return "tipo-cooler";
                    default: return "tipo-default";
                  }
                };

                return (
                  <tr key={index}>
                    <td>
                      <span className={`badge-tipo ${obtenerClaseTipo(c.tipo)}`}>
                        {c.tipo}
                      </span>
                    </td>
                    <td>{c.nombre}</td>
                    <td><strong>${c.precio.toLocaleString()}</strong></td>
                  </tr>
                );
              })}
              </tbody>
            </table>

            <div className="total-row">
              <span>Total Estimado:</span>
              <span>
                  ${proyectoSeleccionado.componentes
                      .reduce((acc, c) => acc + c.precio, 0)
                      .toLocaleString('es-MX')} MXN
              </span>
          </div>
          
          </div>
        </div>
      )}
    </div>
  );
}