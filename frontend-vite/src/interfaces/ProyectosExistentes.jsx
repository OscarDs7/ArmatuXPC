import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerMisArmados, eliminarArmado, publicarArmado, despublicarArmado } from "../services/api";
import "../estilos/Proyectos.css";


export default function ProyectosExistentes() {
  const [proyectos, setProyectos] = useState([]);
  // 💡 Nuevo estado para controlar qué proyecto se ve en el modal
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // En un entorno real, obtendrías el nombre desde tu contexto de Auth/Firebase
  const nombreUsuario = localStorage.getItem("userName") || "Usuario de ArmatuXPC";
  
  const uid = localStorage.getItem("userUid");

  // Función para cargar los proyectos del usuario al montar el componente y comprobar si hay un proyecto previamente publicado para auto-seleccionarlo
  useEffect(() => {
  if (uid) {
    setLoading(true);
    obtenerMisArmados(uid)
      .then(data => {
        setProyectos(data);
        
        // LÓGICA DE AUTO-SELECCIÓN:
        const idPersistido = localStorage.getItem("ultimoProyectoPublicado");
        if (idPersistido) {
          // Buscamos el proyecto en la data recién llegada
          const encontrado = data.find(proy => proy.armadoId === parseInt(idPersistido));
          if (encontrado) {
            setProyectoSeleccionado(encontrado);
          }
        }
      })
      .catch(err => console.log(err));
  }
}, [uid]);

  // --- NUEVA LÓGICA DE PUBLICACIÓN ---
  const handleTogglePublicar = async (p) => {
    try {
      if (!p.esPublicado) {
        // Nombre limpio de espacios y caracteres especiales para URL
        const nombreAEnviar = String(nombreUsuario).split(':')[0]; // Por si acaso trae basura
        // Publicar
        await publicarArmado(p.armadoId, nombreAEnviar);
        // Guardamos la persistencia de la id del armado publicado para se mantenga seleccionado al volver a la comunidad
        localStorage.setItem("ultimoProyectoPublicado", p.armadoId);
        alert("¡Tu armado ahora es visible en la comunidad! 🎉");
      } else {
        // Despublicar
        await despublicarArmado(p.armadoId);
        // Limpiamos la persistencia ya que el armado se ha retirado de la comunidad
        localStorage.removeItem("ultimoProyectoPublicado");
        alert("Se ha retirado el armado de la comunidad.");
      }

      // Actualizamos el estado local para que el botón cambie visualmente
      setProyectos(proyectos.map(proy => 
        proy.armadoId === p.armadoId 
          ? { ...proy, esPublicado: !proy.esPublicado } 
          : proy
      ));
    } catch (err) {
      alert(err.message);
    }
  };

  // Función para cerrar el modal
  const cerrarModal = () => setProyectoSeleccionado(null);


  return (
    <div className="proyectos-container">
      <button className="btn-volver" onClick={() => navigate("/dashboard-user")}>← Volver</button>

      <h2 className="title">Mis PCs Armadas 🖥️</h2>

      <div className="proyectos-grid">
          {proyectos.map((p) => (
          <div key={p.armadoId} className={`proyecto-card ${p.esPublicado ? 'card-publicada' : ''}`}>
            {/* Badge visual de estado */}
            {p.esPublicado && <span className="badge-publicado">Publicado</span>}

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

            {/* BOTÓN DINÁMICO DE PUBLICAR/DESPUBLICAR */}
            <button 
                className={p.esPublicado ? "btn-despublicar" : "btn-publicar"} 
                onClick={() => handleTogglePublicar(p)}
            >
              {p.esPublicado ? "Quitar de Comunidad" : "Publicar en Comunidad"}
            </button>

            <button className="btn-eliminar" onClick={() => eliminarArmado(p.armadoId).then(() => {
              // Actualizamos la lista de proyectos después de eliminar
              setProyectos(proyectos.filter(proy => proy.armadoId !== p.armadoId));
            })}>
              Eliminar
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