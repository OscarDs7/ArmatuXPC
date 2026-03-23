import { useEffect, useState } from "react";
import { obtenerMisArmados } from "../services/api";
import "../estilos/Proyectos.css";

export default function ProyectosExistentes () {
  const [proyectos, setProyectos] = useState([]);
  const uid = localStorage.getItem("userUid"); // Recuperamos el UID guardado

  useEffect(() => {
    if (uid) {
      obtenerMisArmados(uid)
        .then(data => setProyectos(data))
        .catch(err => console.log(err));
    }
  }, [uid]);

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
            <strong>Componentes:</strong>
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

          <button className="btn-detalle" onClick={() => verDetalle(p.armadoId)}>
            Ver Configuración Completa
          </button>
        </div>
      ))}
    </div>
  </div>
)};