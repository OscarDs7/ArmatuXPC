import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../utilidades/firebase";
import gabinete from "../assets/gabinete.png"; 
import { filtroComponente, guardarArmado, evaluarCompatibilidadTiempoReal } from "../services/api"; 
import "../estilos/NuevoProyecto.css";

export default function NuevoProyecto() {
  const navigate = useNavigate(); // Hook para navegación programática
  const location = useLocation(); // Hook para acceder al estado pasado por navigate
  // Estados principales del componente
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [listaComponentes, setListaComponentes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const [imagenCentral, setImagenCentral] = useState(null);
  const [modoGuia, setModoGuia] = useState(true);
  const [incompatibilidades, setIncompatibilidades] = useState([]);
  const [pasoTutorial, setPasoTutorial] = useState(0);
  const [mostrarTutorial, setMostrarTutorial] = useState(true);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [tokens, setTokens] = useState(0); // ✨ Nuevo estado para tokens

  // Estados para la persistencia del proyecto en localStorage: UID de sesión, nombre del usuario y clave de almacenamiento específica para este proyecto
  const uidSession = localStorage.getItem("userUid");
  const nombreUsuario = localStorage.getItem("userName") || "Usuario Anónimo";
  const STORAGE_KEY = `pc_borrador_${uidSession}`; // Llave única por usuario para guardar el progreso del último proyecto en localStorage
  // Estado de autoguardado que el usuario puede activar o desactivar según su preferencia (por defecto activado para no perder progreso)
  const [autoGuardado, setAutoGuardado] = useState(true);

  // Guardaremos el ID del componente que está expandido
  const [expandidoId, setExpandidoId] = useState(null); 

  // Determinamos el modo (por defecto es "nuevo" si entra directo por URL)
  const modo = location.state?.modo || "nuevo";

  // Estado que representa el armado actual del PC: cada propiedad es un tipo de componente y su valor es el modelo seleccionado (o null si no hay selección)
  const [pcActual, setPcActual] = useState({
    CPU: null, Motherboard: null, RAM: null, GPU: null,
    Almacenamiento: null, "Fuente de poder": null,
    Refrigeracion: null, Gabinete: null
  });

  // Mapeo para traducir el nombre del componente al tipo esperado por el backend
  const mapTipo = {
    CPU: "CPU", GPU: "GPU", RAM: "MemoriaRAM",
    Almacenamiento: "Almacenamiento", "Fuente de poder": "FuentePoder",
    Motherboard: "PlacaBase", Refrigeracion: "Refrigeracion", Gabinete: "Gabinete"
  };

  // Definimos los pasos del tutorial con sus selectores y textos explicativos (son pasos introductorios para guiar al usuario en su primera visita)
  const pasos = [
  {
    selector: ".modo-panel",
    texto: "Aquí puedes cambiar entre modo guía (paso a paso ordenadamente) y libre (elige cualquier componente sin orden)."
  },
  {
    selector: ".modo-switch",
    texto: "Usa este switch para alternar el modo (guía / libre)"
  },
  {
    selector: ".lista-componentes",
    texto: "En el panel de componentes selecciona un tipo de componente para ver los modelos disponibles"
  },
  {
    selector: ".vista-gabinete",
    texto: "Aquí se mostrará una vista general de tu PC, que irá cambiando según lo que selecciones"
  },
  {
    selector: ".component-details",
    texto: "En este panel derecho verás los modelos disponibles para el componente seleccionado"
  },
  {
    selector: ".resumen-pc",
    texto: "Aquí verás un resumen de los componentes seleccionados en tu PC y su consumo energético"
  },
];

  // Cada vez que cambie el componente seleccionado, obtenemos su lista desde el backend
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

  // ---  Bloquear scroll cuando el modal está abierto y desbloquearlo al cerrarlo --- //
useEffect(() => {
  if (imagenSeleccionada) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'unset';
  }
}, [imagenSeleccionada]);

// ---  Función para alternar los cambios en la imagen central del Gabinete cuando seleccione uno diferente --- //
  useEffect(() => {
    if (pcActual.Gabinete?.imagenUrl) {
      setImagenCentral(pcActual.Gabinete.imagenUrl);
    } else {
      setImagenCentral(null);
    }
  }, [pcActual.Gabinete]);

  // ---  Función para comprobar compatibilidad de componentes en tiempo real --- //
  useEffect(() => {
  const evaluar = async () => {
    try {
      const ids = Object.values(pcActual)
        .filter(Boolean)
        .map(comp => comp.componenteId);

      if (ids.length < 2) {
        setIncompatibilidades([]);
        return;
      }

      const resultado = await evaluarCompatibilidadTiempoReal(ids);

      // 🔥 SOLO guarda si hay errores
      if (resultado.length > 0) {
        setIncompatibilidades(resultado);
      } else {
        setIncompatibilidades([]); // limpia automáticamente
      }

    } catch (error) {
      console.error("Error evaluando compatibilidad:", error);
    }
  };

  evaluar();
}, [pcActual]);

// ---  Función para resaltar el componente relacionado al paso actual del tutorial --- //
useEffect(() => {
  // 1. Si el tutorial está apagado, no hacemos nada
  if (!mostrarTutorial) return;

  const pasoActual = pasos[pasoTutorial]; // Obtenemos el paso actual según el índice
  if (!pasoActual) return; // Si el paso no existe (por ejemplo, si el array de pasos cambia), evitamos errores

  const elemento = document.querySelector(pasoActual.selector); // Buscamos el elemento en el DOM usando el selector definido en el paso

  if (elemento) {
    elemento.scrollIntoView({ behavior: "smooth", block: "center" });
    elemento.classList.add("highlight");

    // 2. Esta función de limpieza se ejecutará:
    //    - Cuando cambies de paso (remueve el highlight del anterior)
    //    - Cuando el componente se desmonte
    //    - CUANDO 'mostrarTutorial' cambie a false
    return () => elemento.classList.remove("highlight");
  } else {
    // Si no encuentra el elemento, mejor no resetear a 0 forzosamente 
    // a menos que sea un error crítico.
    console.warn(`Selector no encontrado: ${pasoActual.selector}`);
  }

}, [pasoTutorial, mostrarTutorial]); 

// ---  Función para verificar si el usuario ya ha visto el tutorial y evitar mostrarlo de nuevo --- //
useEffect(() => {
  const visto = localStorage.getItem("tutorialVisto");
  if (visto) setMostrarTutorial(false);
}, []);

// Función para finalizar el tutorial y guardar la preferencia del usuario en localStorage
const finalizarTutorial = () => {
  localStorage.setItem("tutorialVisto", "true");
  setMostrarTutorial(false); // Ocultamos el tutorial
  setPasoTutorial(0); // Limpia el paso para futuras sesiones si decides reabrirlo
};

  // Función para resolver incompatibilidades: por simplicidad, vamos a quitar el componente que causa el conflicto (el segundo en la regla)
  const resolverIncompatibilidad = () => {
    if (incompatibilidades.length === 0) return;

    const conflicto = incompatibilidades[0];

    setPcActual(prev => {
      const nuevo = { ...prev };

      Object.keys(nuevo).forEach(key => {
        if (nuevo[key]?.nombre === conflicto.componenteB) {
          nuevo[key] = null;
        }
      });

      return nuevo;
    });
  };

  // Método para validar si un componente está en error por incompatibilidad: lo usamos para marcar en rojo los componentes que tienen conflictos
  const esComponenteIncompatible = (componente) => {
    return incompatibilidades.some(inc =>
      inc.componenteA === componente?.nombre ||
      inc.componenteB === componente?.nombre
    );
  };

  // --- LÓGICA DE PERSISTENCIA ---

  // 1. Efecto de Carga Inicial
  useEffect(() => {
    if (modo === "continuar") {
      const guardado = localStorage.getItem(STORAGE_KEY);
      if (guardado) {
        setPcActual(JSON.parse(guardado)); // Cargamos el progreso guardado
        // Opcional: Desactivar tutorial si está continuando
        setMostrarTutorial(false);
      }
    } else if (modo === "nuevo") {
      // Si el modo es "nuevo", podrías querer limpiar el storage anterior
      // o simplemente dejar el estado inicial vacío.
      localStorage.removeItem(STORAGE_KEY); // Limpiamos cualquier progreso anterior al iniciar un nuevo proyecto
    }
    setCargandoDatos(false); // Ya no estamos cargando después de intentar cargar el proyecto

  }, [modo, uidSession]); // Re-ejecuta si cambia el modo o el usuario (por seguridad)

  // 2. Efecto de Auto-guardado (Siempre activo)
  useEffect(() => {
    // Si todavía estamos cargando los datos iniciales, no guardamos nada (evita sobrescribir el progreso al cargar)
    if (cargandoDatos || !uidSession || !autoGuardado) return;

    // Si ya terminamos de cargar, entonces sí guardamos cada cambio automáticamente
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pcActual));
    console.log("Progreso guardado automáticamente:", pcActual);
  }, [pcActual, cargandoDatos, uidSession, autoGuardado]);

// --- FIN DE LA LÓGICA DE PERSISTENCIA ---

// -- Función de guardado manual -- //
const guardarProgresoManual = () => {
  if (!uidSession) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pcActual));
  alert("💾 Progreso guardado manualmente en este navegador.");
};

  // ESCUCHA DE TOKENS EN TIEMPO REAL
  useEffect(() => {
    if (!uidSession) return;

    // Creamos una conexión en tiempo real con el documento del usuario
    const unsub = onSnapshot(doc(db, "Usuario", uidSession), (docSnap) => {
      if (docSnap.exists()) {
        setTokens(docSnap.data().TokensDisponibles || 0);
      }
    });

    return () => unsub(); // Limpiamos la conexión al salir del componente
  }, [uidSession]);

const componentes = [
  "Gabinete",
  "Fuente de poder",
  "Motherboard",
  "Refrigeracion",
  "CPU",
  "GPU",
  "RAM",
  "Almacenamiento"
];

const ordenComponentes = [
  "Gabinete",
  "Fuente de poder",
  "Motherboard",
  "Refrigeracion",
  "CPU",
  "GPU",
  "RAM",
  "Almacenamiento"
];

// Función para determinar si un componente está desbloqueado o no según el modo y el orden
const estaDesbloqueado = (comp) => {
  //  Si está en modo libre → todo desbloqueado
  if (!modoGuia) return true;

  const index = ordenComponentes.indexOf(comp);

  if (index === 0) return true;

  const anterior = ordenComponentes[index - 1];

  return pcActual[anterior] !== null;
};

  // Función para agregar un componente al armado actual
  const agregarComponente = (componente) => {
    setPcActual({ ...pcActual, [selectedComponent]: componente });
    setExpandidoId(null);
  };

  // Función para quitar un componente del armado actual
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
    // 1. Verificación de Seguridad (Doble validación: compatibilidad y energía, para evitar que el usuario intente guardar algo que sabemos que no funcionará)
    if (incompatibilidades.length > 0) {
      alert("No puedes guardar: Existen piezas incompatibles en tu configuración.");
      return;
    }

    if (!energiaValida) {
      alert("No puedes guardar: El consumo energético es demasiado alto para la fuente seleccionada.");
      return;
    }

    // 2. Validación de sesión activa (necesitamos el UID para asociar el armado al usuario)
    if (!uidSession) {
      alert("No se detectó sesión activa.");
      return;
    }

    // 3. Validación de tokens disponibles (si el usuario no tiene tokens, no puede guardar un nuevo proyecto)
    if (tokens === 0) {
      alert("No tienes tokens disponibles para guardar un nuevo proyecto. Elimina uno de tus proyectos existentes para liberar espacio o adquiere más tokens. ¡Gracias por ser parte de ArmatuXPC! 🚀");
      return;
    }

    // --- VALIDACIÓN DE COMPONENTES ESENCIALES ---
    const esenciales = ["CPU", "Motherboard", "RAM", "Fuente de poder", "Gabinete"];
    const faltantes = esenciales.filter(tipo => !pcActual[tipo]);

    if (faltantes.length > 0) {
      alert(`Para un armado funcional, aún te falta seleccionar: ${faltantes.join(", ")}`);
      return;
    }

    // --- SOLICITUD DE NOMBRE ---
    const nombrePrompt = window.prompt("Dale un nombre a tu creación:", nombreProyecto || "Mi PC Nueva");
    if (!nombrePrompt) return;

    // --- ESTRUCTURA PARA EL DTO DE C# ---
    // Obtenemos todos los componentes seleccionados (ignoramos los nulos)
    const componentesPayload = Object.entries(pcActual)
      .filter(([key, value]) => value !== null)
      .map(([key, comp]) => {
        // Si esto imprime 0 o undefined, el error persistirá
        console.log(`Verificando ID para ${key}:`, comp.componenteId);
        return {
          componenteId: parseInt(comp.componenteId),
          cantidad: 1
        };
      });

    // Si algún ID es NaN o 0, detenemos el proceso
    if (componentesPayload.some(c => !c.componenteId)) {
      alert("Error: Uno de los componentes de la plantilla no tiene un ID válido.");
      return;
    }

    // Construimos el objeto que espera el backend para guardar el armado
    const nuevoArmado = {
      usuarioId: uidSession,
      nombreArmado: nombrePrompt,
      nombreUsuario: nombreUsuario,
      componentes: componentesPayload
    };

    // 3. Enviamos la solicitud al backend para guardar el armado
    try {
      setLoading(true);
      await guardarArmado(nuevoArmado);
      alert("🚀 ¡Proyecto guardado exitosamente!");
      localStorage.removeItem(`pc_borrador_${uidSession}`); // Limpiamos el borrador específico del usuario
      navigate("/mis-armados"); // Redirige a la lista de proyectos del usuario
    } catch (error) {
      // Si el backend lanza el BadRequest que vimos en tu C# (Error energético)
      console.error("Error del servidor:", error);
      alert(`Error al guardar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // El armado es inválido si: 
  // 1. Hay incompatibilidades en el array
  // 2. La energía no es válida
  // 3. Está cargando
  const tieneErrores = incompatibilidades.length > 0 || !energiaValida;
  const puedeGuardar = !tieneErrores && !loading;

  
  // --- Estados para recibir solicitud de plantilla desde la Comunidad y cargarla automáticamente en el configurador --- //
  const [nombreProyecto, setNombreProyecto] = useState("");

  // --- Si venimos de la comunidad con una plantilla, cargamos los componentes en el estado local del configurador --- //
  useEffect(() => {
  if (location.state && location.state.componentesPlantilla) {
    const { componentesPlantilla, nombreOriginal } = location.state;

    const nuevaConfiguracion = {
      CPU: null, Motherboard: null, RAM: null, GPU: null,
      Almacenamiento: null, "Fuente de poder": null,
      Refrigeracion: null, Gabinete: null
    };

    componentesPlantilla.forEach(comp => {
      const categoriaEnPC = Object.keys(mapTipo).find(key => mapTipo[key] === comp.tipo);
      
      if (categoriaEnPC) {
        // NORMALIZACIÓN CRÍTICA
        nuevaConfiguracion[categoriaEnPC] = {
          ...comp,
          // Intentamos obtener el ID de todas las formas posibles que pueda venir del JSON
          componenteId: comp.componenteId || comp.id || comp.ComponenteId,
          // Hacemos lo mismo para la imagen
          imagenUrl: comp.imagenUrl || comp.imagen || comp.ImagenUrl
        };
      }
    });
    // Actualizamos el estado del configurador con la plantilla recibida
    setPcActual(nuevaConfiguracion);
    setNombreProyecto(`Copia de ${nombreOriginal}`);
    setModoGuia(false);
    window.history.replaceState({}, document.title); // Limpiamos el estado de la URL para evitar recargas accidentales con la plantilla
  }
}, [location]);
  // FIN de la lógica de carga automática desde la comunidad (esto permite que al hacer click en "Usar esta plantilla" en la comunidad, se abra el configurador con esa plantilla ya cargada y lista para editar)

  
  // Renderizamos el componente //
  return (
    <div className="nuevo-proyecto-container">
      <header className="nuevo-header">
        <button className="btn-volver" onClick={() => navigate("/dashboard-user")}>← Volver</button>
        {/* El título cambia según el modo */}
        <h1>{modo === "continuar" ? "Continuar Proyecto" : "Crear Nuevo Proyecto"}</h1>
      </header>

      {/* Diseño UI de Autoguardado y botón de Guardado manual */ }
      <div className="project-controls-bar">
        <div className="status-group">
          {/* Switch de Autoguardado */}
          <div className="flex items-center gap-2 mr-4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={autoGuardado}
                onChange={() => setAutoGuardado(!autoGuardado)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            <span className="text-sm font-medium text-gray-700">
              Autoguardado {autoGuardado ? "ON" : "OFF"}
            </span>
          </div>

          {/* Indicador de Estado */}
          <div className="status-indicator">
            {autoGuardado ? (
              <span className="flex items-center text-green-600 text-sm">
                <span className="dot-green mr-2">●</span> Cambios guardados
              </span>
            ) : (
              <span className="flex items-center text-gray-500 text-sm">
                <span className="dot-gray mr-2">●</span> Modo manual
              </span>
            )}
          </div>
        </div>

        <div className="action-group">
          {/* Botón de Guardado Manual (Solo se resalta si el autoguardado está OFF) */}
          <button 
            onClick={guardarProgresoManual}
            className={`btn-manual-save ${!autoGuardado ? 'active' : 'disabled'}`}
            title="Guardar progreso actual"
          >
            💾 Guardar Borrador
          </button>
        </div>
      </div>
      
      <div className="nuevo-main">
        {/* SIDEBAR IZQUIERDO */}
        <div className="componentes-menu bg-amber-200 p-4 rounded-lg">
          <div className="bg-blue-200 p-3 rounded-lg mt-3 modo-panel">
            <span>
              {modoGuia ? "🧭 Modo guía" : "🎮 Modo libre"}
              <p style={{ fontSize: "0.9rem", marginTop: "5px" }}>
              {modoGuia 
                ? "Modo guía activado: sigue el orden recomendado"
                : "Modo libre: puedes elegir cualquier componente"}
            </p>
            </span>
          </div>
        <div className="modo-switch">
          <span className={`${modoGuia ? "text-green-400 font-bold" : "text-gray-400"}`}>
            🧭 Guía
          </span>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={!modoGuia}
              onChange={() => setModoGuia(!modoGuia)}
            />
            <span className="slider"></span>
          </label>
          <span className={`${!modoGuia ? "text-green-400 font-bold" : "text-gray-400"}`}>
            🎮 Libre
          </span>
        </div>

       <div className="lista-componentes">
          <h3><strong>Componentes</strong></h3>
          {/* Listamos los componentes disponibles en el menú lateral */}
          {componentes.map((comp) => {
          const bloqueado = !estaDesbloqueado(comp);

          return (
            <button 
              key={comp}
              className={`comp-btn 
                ${selectedComponent === comp ? "active" : ""} 
                ${bloqueado ? "bloqueado" : ""}
              `}
              onClick={() => !bloqueado && setSelectedComponent(comp)}
              disabled={bloqueado}
            >
              {comp} {bloqueado && <span className="lock-icon">🔒</span>}
            </button>
          );
        })}
          </div>
        </div>

        {/* VISTA CENTRAL */}
        <div className="central-view">
           {/* Mostrar mensaje cuando ya no quedan tokens */}
            {tokens === 0 && (
              <div className="aviso-tokens-container">
                <div className="aviso-tokens-card">
                  <div className="aviso-header">
                    <span className="aviso-icon">⚠️</span>
                    <h3>Límite de Armados Alcanzado</h3>
                  </div>
                  
                  <p className="aviso-texto">
                    Has alcanzado el límite de armados (3/3). Para guardar este nuevo proyecto, 
                    necesitas liberar un espacio de armado o ampliar tu capacidad comprando más tokens. 
                    <br />
                    <strong> ¡Gracias por ser parte de ArmatuXPC! 🚀</strong>
                  </p>

                  <div className="aviso-acciones">
                    <button 
                      className="btn-accion-tokens comprar" 
                      onClick={() => navigate("/comprar-tokens")}
                    >
                      💳 Comprar más tokens
                    </button>
                    
                    <button 
                      className="btn-accion-tokens gestionar" 
                      onClick={() => navigate("/mis-armados")}
                    >
                      🗑️ Gestionar mis armados
                    </button>
                  </div>
                </div>
              </div>
            )}

          <div className="gabinete-view vista-gabinete">
            {/* El contenedor principal debe ser relativo */}
              <div className="gabinete-container-relativo">
                <img 
                  src={imagenCentral || gabinete} 
                  alt="Gabinete PC" 
                  className="imagen-central"
                />
                {/* Mapeamos los componentes para renderizar los globos */}
                {Object.entries(pcActual).map(([tipo, componente]) => {
                  // Solo mostramos globos para componentes seleccionados (no nulos)
                  // y opcionalmente excluimos el Gabinete mismo si ya es la imagen central
                  if (!componente || tipo === "Gabinete") return null;

                  // Verificamos si este componente específico tiene conflictos
                  const tieneError = esComponenteIncompatible(componente);

                  return (
                    <div 
                      key={tipo} 
                      // Usamos una clase dinámica para posicionar cada tipo (ej: globo-cpu)
                      className={`globito-componente globo-${tipo.toLowerCase().replace(/ /g, '-')}`}
                    >
                      {/* Contenido del globo */}
                      <div className="globito-content">
                        {/* Si hay error, podemos añadir un pequeño badge de advertencia sobre la imagen */}
                        <div className="globito-img-container">
                          <img src={componente.imagenUrl} alt={componente.nombre} className="globito-img" />
                          {tieneError && <span className="error-badge">!</span>}
                        </div>

                        <div className="globito-info">
                          <span className="globito-tipo">{tipo}{tieneError && <span className="error-badge">!</span>}</span>
                          <span className="globito-nombre">{componente.nombre}</span>
                        </div>
                      </div>
                      {/* Línea conectora (opcional, da un toque pro) */}
                              <div className="globito-linea"></div>
                            </div>
                          );
                        })}
                        </div>
                        
                    </div> {/* Fin del contenedor relativo para los globos */}

                    {/* RESUMEN DEL ARMADO Y BOTÓN DE GUARDAR */}   
                    <div className="pc-resumen resumen-pc">
                      <h2>Resumen del armado</h2>
                        {modo === "continuar" && (
                          <p style={{ color: "#3b82f6", fontSize: "0.8rem", marginBottom: "10px" }}>
                            ℹ️ Estas viendo tu progreso guardado localmente.
                          </p>
                        )}
                      <ul>
                        {Object.entries(pcActual).map(([key, modelo]) => (
                          <li key={key} 
                          className={`resumen-item ${esComponenteIncompatible(modelo) ? "incompatible" : ""}`}>
                            <strong>{key}:</strong> 
                            {modelo ? `${modelo.nombre} ($${modelo.precio})` : "Sin seleccionar"}

                            {/* 🔥 Indicador visual */}
                            {esComponenteIncompatible(modelo) && (
                              <span style={{ color: "red", marginLeft: "10px" }}>
                                ⚠ Incompatible
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                      {/* Barra de progreso de consumo energético */}
                      <div className="energy-bar-overlay">
                        <div className="energy-text">
                          <span>Consumo Energético: {Math.round(wattsConMargen)}W / {fuente?.capacidadWatts || 0}W (fuente de poder)</span>
                        </div>
                        <div className="energy-progress-bg">
                          <div 
                            className="energy-progress-fill"
                            style={{ 
                              width: `${Math.min((wattsConMargen / (fuente?.capacidadWatts || 1)) * 100, 100)}%`,
                              backgroundColor: energiaValida ? '#10b981' : '#ef4444'
                            }}
                          ></div>
                        </div>
                      </div>
                      {/* Detalles adicionales de consumo y validación energética */}
                      <div className="resumen-extra">
                          <p>Total: <strong>${total}</strong></p>
                          <p>Consumo Real: <strong>{watts}W</strong></p>
                          
                          {/* Mostramos el consumo recomendado con el margen del 20% */}
                          <p>Consumo Recomendado (+20%): <strong style={{ color: energiaValida ? "inherit" : "#dc2626" }}>
                                {Math.round(watts * 1.2)}W
                            </strong>
                          </p>
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
                            disabled={!puedeGuardar || tokens == 0} // Deshabilitar si hay error de energía
                          >
                            {loading ? "Procesando..." : "Guardar Proyecto"}
                          </button>
                          
                          {/* Mensajes de advertencia dinámicos */}
                          <div className="mensajes-validacion"> 
                            {!energiaValida && (
                              <p className="error-text">⚠️ El consumo excede la capacidad de la fuente.</p>
                            )}
                            {incompatibilidades.length > 0 && (
                              <p className="error-text">⚠️ Existen conflictos de compatibilidad sin resolver.</p>
                            )}
                          </div>
                      </div>
                    </div>

                    {/* INCOMPATIBILIDADES EN TIEMPO REAL */}
                    {incompatibilidades.length > 0 && (
                    <div className="alerta-error">
                      <h3>⚠️ Incompatibilidades detectadas:</h3>
                      
                      <div className="conflict-list">
                        {incompatibilidades.map((inc, index) => (
                          <div key={index} className="conflict-card">
                            <div className="conflict-header">
                              <span className="comp-name">{inc.componenteA}</span>
                              <span className="vs-icon">❌</span>
                              <span className="comp-name">{inc.componenteB}</span>
                            </div>
                            <p className="conflict-reason">{inc.motivo}</p>
                          </div>
                        ))}
                      </div>
                      <button onClick={resolverIncompatibilidad} className="btn-corregir">
                        ✨ Corregir incompatibilidades
                      </button>
                    </div>
                  )}
                        
                  {/* PANEL DERECHO: CATÁLOGO */}
                  <div className="component-details">
                    {selectedComponent ? (
                      <>
                        <h3><strong>Catálogo de {selectedComponent}</strong></h3>
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

                {/* TUTORIAL INTERACTIVO: Solo se muestra si el usuario no lo ha cerrado previamente */}
                {mostrarTutorial && (
                <div className="tutorial-overlay">
                  <div className="tutorial-box">
                    <p> <h3> <strong> Tutorial introductorio del uso de esta ventana de Armado </strong></h3></p>
                    <p>{pasos[pasoTutorial].texto}</p>

                    <div className="tutorial-buttons">
                      {/* Botón de Salto Global (Siempre visible) */}
                      <button 
                        className="btn-saltar" 
                        onClick={finalizarTutorial}
                        style={{ opacity: 0.7, fontSize: '0.8rem' }}
                      >
                        ✖ Saltar tutorial
                      </button>
                      {/* Botón de Anterior */}
                      <button 
                        onClick={() => setPasoTutorial(p => Math.max(p - 1, 0))}
                        disabled={pasoTutorial === 0}
                      >
                        ⬅ Anterior
                      </button>
                        {/* Botón de Siguiente o Finalizar */}
                      {pasoTutorial < pasos.length - 1 ? (
                        <button onClick={() => setPasoTutorial(p => p + 1)}>
                          Siguiente ➡
                        </button>
                    
                      ) : (
                        <button onClick={() => {
                          finalizarTutorial(); // Guardamos la preferencia de no mostrar el tutorial de nuevo y cerramos el tutorial
                        }}>
                          ✅ Finalizar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )} 

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
      // --- FIN DEL COMPONENTE PRINCIPAL DE CONFIGURACIÓN DE ARMADO --- //
  
} // --- FIN DEL COMPONENTE --- //