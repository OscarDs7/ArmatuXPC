import { useEffect, useState } from "react";
import { getComunidad } from "../services/api";
import "../estilos/Comunidad.css";
import { useNavigate } from "react-router-dom";

export default function Comunidad() {
  const [publicaciones, setPublicaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getComunidad()
      .then((data) => {
        setPublicaciones(data);
        setCargando(false);
      })
      .catch((err) => {
        console.error("Error al cargar la comunidad:", err);
        setCargando(false);
      });
  }, []);

  // Función para manejar el uso de una plantilla
  const handleUsarPlantilla = (proyecto) => {
  // Redirigimos al configurador pasando los componentes en el estado de la navegación
  navigate("/nuevo-proyecto", { 
    state: { 
      componentesPlantilla: proyecto.componentes,
      nombreOriginal: proyecto.nombreArmado 
    } 
  });
};

  if (cargando) return <div className="loader">Cargando comunidad... 🚀</div>;

  return (
    <div className="comunidad-container">
      <header className="comunidad-header">
        <button className="btn-volver" onClick={() => navigate("/dashboard-user")}>
          ← Volver
        </button>
        <h1 className="comunidad-title">Explora la Comunidad 🌐</h1>
        <p>Inspírate con los armados de otros usuarios y crea tu PC ideal.</p>
      </header>

      <div className="comunidad-grid">
        {publicaciones.length === 0 ? (
          <p className="no-data">Aún no hay armados publicados. ¡Sé el primero!</p>
        ) : (
          publicaciones.map((p) => (
            <div key={p.armadoId} className="card-publicacion">
              <div className="card-header">
                <span className="autor-tag">👤 {p.autorNombre || "Anónimo"}</span>
                <span className="fecha-tag">{new Date(p.fechaCreacion).toLocaleDateString()}</span>
              </div>
              
              <div className="card-body">
                <h3>{p.nombreArmado}</h3>
                <div className="resumen-componentes">
                  {p.componentes.slice(0, 4).map((c, i) => (
                    <div key={i} className="mini-tag">
                      <strong>{c.tipo}:</strong> {c.nombre}
                    </div>
                  ))}
                  {p.componentes.length > 4 && (
                    <span className="ver-mas">+{p.componentes.length - 4} componentes más...</span>
                  )}
                </div>
              </div>

              <div className="card-footer">
                <div className="precio-total">
                  Total: <span>${p.componentes.reduce((acc, c) => acc + c.precio, 0).toLocaleString()} MXN</span>
                </div>
                <button className="btn-usar-plantilla" onClick={() => handleUsarPlantilla(p)}>
                  Usar como Plantilla
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}