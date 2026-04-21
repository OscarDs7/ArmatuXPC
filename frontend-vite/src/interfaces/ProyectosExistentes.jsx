// Importamos React y hooks necesarios
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// Importamos funciones de la API para manejar los armados
import { obtenerMisArmados, eliminarArmado, publicarArmado, despublicarArmado, enviarFeedback } from "../services/api";
// Importamos librerías para el contador de tokens directo de Firestore
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../utilidades/firebase";
// Importamos estilos específicos para esta sección
import "../estilos/Proyectos.css";


export default function ProyectosExistentes() {
  const [proyectos, setProyectos] = useState([]); 
  const [tokens, setTokens] = useState(null); // Cambiamos 0 por null para saber si ya cargó o no el dato de tokens desde Firestore
  // 💡 Nuevo estado para controlar qué proyecto se ve en el modal
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingTokens, setLoadingTokens] = useState(true); // Estado específico para la carga de tokens, así podemos mostrar un mensaje o loader mientras se obtiene el dato de Firestore
  // Estados para controlar cuando mostrar la ventana de feedback al usuario
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [tipoFeedback, setTipoFeedback] = useState(""); // "primero" o "tercero"

  // En un entorno real, obtendrías el nombre desde tu contexto de Auth/Firebase
  const nombreUsuario = localStorage.getItem("userName") || "Usuario de ArmatuXPC";
  
  const uid = localStorage.getItem("userUid");

  // Cálculo de capacidad total (proyectos ocupados + tokens disponibles)
  const proyectosOcupados = proyectos.length;
  const tokensRestantes = tokens; // El estado que traemos de Firestore
  const capacidadTotal = proyectosOcupados + tokensRestantes;


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
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
  }
}, [uid]);

  // ESCUCHA DE TOKENS EN TIEMPO REAL
  useEffect(() => {
    if (!uid) return;

    // Creamos una conexión en tiempo real con el documento del usuario
    const unsub = onSnapshot(doc(db, "Usuario", uid), (docSnap) => {
      if (docSnap.exists()) {
        setTokens(docSnap.data().TokensDisponibles || 0);
      }
      else {
        setTokens(0); // Si el documento no existe, asumimos que no tiene tokens disponibles
      }
      setLoadingTokens(false); // Ya cargamos el dato de tokens, sea cual sea el resultado
    });

    return () => unsub(); // Limpiamos la conexión al salir del componente
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

      // 💡 Si el proyecto que acabamos de cambiar es el que está en el modal, lo actualizamos también
      if (proyectoSeleccionado && proyectoSeleccionado.armadoId === p.armadoId) {
        setProyectoSeleccionado({ ...proyectoSeleccionado, esPublicado: !p.esPublicado });
      }

    } catch (err) {
      alert(err.message);
    }
  };

  // Función para eliminar un armado
  const eliminarArmadoYActualizar = async (armadoId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este armado?")) {
      try {
        await eliminarArmado(armadoId);

        // 1. Actualizamos el estado local PRIMERO para feedback instantáneo
        setProyectos((prevProyectos) => prevProyectos.filter(proy => proy.armadoId !== armadoId));

        // 2. Cerramos el modal si estaba abierto con ese proyecto
        if (proyectoSeleccionado?.armadoId === armadoId) {
          setProyectoSeleccionado(null);
        }

        // 3. Notificamos al usuario
        alert("Armado eliminado exitosamente. ✅");
        
      } catch (err) {
        // Si el error es el de JSON pero sabemos que el status fue 200/204, 
        // podrías manejarlo aquí, aunque lo ideal es arreglar la API como puse arriba.
        alert("Hubo un problema: " + err.message);
      }
    }
  };

  // Función para cerrar el modal
  const cerrarModal = () => setProyectoSeleccionado(null);

  // Función para redirigir a la edición del armado
  const handleEditarProyecto = (proyecto) => {
    // 1. Limpiamos cualquier borrador previo para no mezclar datos
    localStorage.removeItem("borrador_armado");

    // 2. Navegamos a NuevoProyecto pasando el objeto completo en el state de React Router
    // y también lo marcamos en localStorage por si el usuario refresca la página
    localStorage.setItem("editando_armado_id", proyecto.armadoId);
    
    navigate("/nuevo-proyecto", { 
      state: { 
        proyectoParaEditar: proyecto,
        esEdicion: true 
      } 
    });
  };

  // useEffect para detectar hitos de armado y mostrar el feedback correspondiente
  useEffect(() => {
    // 1. Creamos llaves únicas usando el uid del usuario actual (solo si hay un uid)
    if (!uid) return; 

    const llaveFb1 = `feedback_1_realizado_${uid}`;
    const llaveFb3 = `feedback_3_realizado_${uid}`;

    // 2. Usamos las llaves dinámicas para leer del storage
    const yaDioFeedback1 = localStorage.getItem(llaveFb1) === "true";
    const yaDioFeedback3 = localStorage.getItem(llaveFb3) === "true";

    // 3. Logs para monitorear (ahora verás la info real por usuario)
    console.log("Revisando hitos:", { 
      usuario: uid,
      cantidad: proyectos.length, 
      cargando: loading, 
      fb1_local: yaDioFeedback1,
      fb3_local: yaDioFeedback3
    });

    // 4. Lógica de activación
    if (!loading && proyectos.length > 0) {
      if (proyectos.length === 1 && !yaDioFeedback1) {
        setTipoFeedback("primero");
        setMostrarFeedback(true);
      } else if (proyectos.length === 3 && !yaDioFeedback3) {
        setTipoFeedback("tercero");
        setMostrarFeedback(true);
      }
    }
  }, [proyectos.length, loading, uid]);

  // Pequeño módulo o función de la lógica del feedback 
  const ModalFeedback = () => {
    const [rating, setRating] = useState(0);
    const [comentario, setComentario] = useState("");
    const [loadingFeedback, setLoadingFeedback] = useState(false); // Inicializado en false

    const handleEnviarFeedback = async () => {
      // 1. Validación de Rating si es el tercer armado
      if (tipoFeedback === "tercero" && rating === 0) {
        alert("Por favor, selecciona una calificación con estrellas.");
        return;
      }

      // 2. Validación de comentario
      if (comentario.trim().length < 10) {
        alert("Cuéntanos un poco más (mínimo 10 caracteres) para poder mejorar.");
        return;
      }

      const payload = {
        usuarioUid: uid,
        rating: tipoFeedback === "primero" ? 0 : rating,
        comentario: comentario,
        tipoHito: tipoFeedback === "primero" ? "PRIMER_ARMADO" : "TERCER_ARMADO"
      };

      try {
        setLoadingFeedback(true); // Activamos loader
        await enviarFeedback(payload);

        // Guardar el estado de feedback realizado por usuario
        const llaveAGuardar = `feedback_${tipoFeedback === "primero" ? "1" : "3"}_realizado_${uid}`;
        localStorage.setItem(llaveAGuardar, "true");
        
        setMostrarFeedback(false);
        alert("¡Mil gracias! Tu opinión nos ayuda a que ArmatuXPC crezca. 🚀");
      } catch (error) {
        console.error("Error al enviar feedback:", error);
        alert("Hubo un error al conectar con el servidor. Inténtalo más tarde.");
      } finally {
        setLoadingFeedback(false); // Desactivamos loader sin importar el resultado
      }
    };

    return (
      <div className="modal-overlay">
        <div className="modal-content feedback-modal">
          <h2>
            {tipoFeedback === "primero" 
              ? "¡Felicidades por tu primer PC! 🥳" 
              : "¡Ya eres un experto armador! 🛠️"}
          </h2>
          
          <p>
            {tipoFeedback === "primero" 
              ? "¿Cómo te sentiste armando tu primera PC personalizada" 
              : "Has completado 3 armados. ¿Qué calificación le das a la herramienta?"}
          </p>

          {/* Mostrar estrellas solo en el tercer armado */}
          {tipoFeedback === "tercero" && (
            <div className="rating-bar">
              {[1, 2, 3, 4, 5].map((star) => (
                <span 
                  key={star} 
                  className={`star ${rating >= star ? "active" : ""}`}
                  onClick={() => setRating(star)}
                >
                  ⭐
                </span>
              ))}
            </div>
          )}

          <textarea 
            className="feedback-textarea"
            value={comentario}
            placeholder="Escribe aquí tus comentarios..."
            onChange={(e) => setComentario(e.target.value)}
            disabled={loadingFeedback}
          />

          <div className="modal-actions">
            <button 
              className="btn-publicar" 
              onClick={handleEnviarFeedback}
              disabled={loadingFeedback}
            >
              {loadingFeedback ? "Enviando feedback..." : "Enviar Feedback"}
            </button>
            <button 
              className="btn-cerrar-link" 
              onClick={() => setMostrarFeedback(false)}
              disabled={loadingFeedback}
            >
              Quizás más tarde
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="proyectos-container">
      <button className="btn-volver-neon" onClick={() => navigate("/dashboard-user")}>← Volver</button>

      <h2 className="title">Mis PCs Armadas 🖥️</h2>

      {/* ✨ CONTADOR DE TOKENS VISUAL ACTUALIZADO */}
      <div className={`token-counter-badge ${!loadingTokens && tokens === 0 ? 'limite-alcanzado' : ''}`}>
        <span className="token-icon">🪙</span>
        <div className="token-info">
          <span className="token-count">
            {/* Si está cargando, mostramos "..." para evitar el 0 falso */}
            {loadingTokens ? "..." : `${proyectosOcupados} / ${capacidadTotal}`}
          </span>
          <small>
            {
              loadingTokens 
              ? "Cargando capacidad de tokens..." : 
              tokens === 0 
              ? "¡Capacidad máxima alcanzada!" 
              : `Tienes ${tokens} ${tokens === 1 ? 'espacio libre' : 'espacios libres'}`
            }
          </small>
        </div>
      </div>
      <br />

      {/* Mostrar mensaje cuando ya no quedan tokens */}
      {!loadingTokens && tokens === 0 && (
        <div className="aviso-tokens">
          ⚠️ Has alcanzado el límite de armados. Elimina uno para liberar espacio o compra más tokens para guardar más proyectos en tu cuenta. ¡Gracias por ser parte de ArmatuXPC! 🚀
        </div>
      )}

      {/* CARGANDO PROYECTOS DESDE BASE DE DATOS */}
      {loading ? (
        <div className="loader">Cargando tus proyectos...</div>
      ) : (

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
              <strong className="componentes">Componentes principales:</strong>
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

            {/* BOTÓN DE EDITAR EN LA CARD */}
            <button 
              className="btn-editar" 
              onClick={() => handleEditarProyecto(p)}
            >
              Editar Armado ✏️
            </button>

            <button className="btn-eliminar" onClick={() => eliminarArmadoYActualizar(p.armadoId)}>
              Eliminar
            </button>
          </div>
        ))}
        
      </div>
      )}

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
                const obtenerClaseTipo = (tipo) => {
                  const clases = {
                    CPU: "tipo-cpu",
                    GPU: "tipo-gpu",
                    MemoriaRAM: "tipo-ram",
                    Almacenamiento: "tipo-storage",
                    FuentePoder: "tipo-psu",
                    PlacaBase: "tipo-motherboard",
                    Gabinete: "tipo-case",
                    Refrigeracion: "tipo-cooler"
                  };
                  return clases[tipo] || "tipo-default";
                };

                return (
                  <tr key={c.componenteId || index}>
                    <td>
                      <div className="componente-info-celda">
                        <span className={`badge-tipo ${obtenerClaseTipo(c.tipo)}`}>
                          {c.tipo}
                        </span>
                      </div>
                    </td>
                    <td className="nombre-celda">{c.nombre}</td>
                    <td><strong>${c.precio.toLocaleString('es-MX')}</strong></td>
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
          <div className="modal-actions"> </div>

          </div>
        </div>
      )}

      {/* ✨ NUEVO: Modal de Feedback */}
      {mostrarFeedback && <ModalFeedback />}

    </div>
  );
}