import { useEffect, useState } from "react";
import { getComponentes, eliminarComponente, actualizarComponente } from "../../services/api";
import "../../estilos/ComponentesAdmin.css";

export default function ComponentesAdmin({ onBack }) {

  const [componentes, setComponentes] = useState([]);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const [celdaEditando, setCeldaEditando] = useState(null);
  const [valorTemporal, setValorTemporal] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState("todos");

  // Función para cargar la lista de componentes desde el backend
  const cargarComponentes = async () => {
    try {
      const data = await getComponentes();
      setComponentes(data);
    } catch (error) {
      console.error("Error cargando componentes", error);
    }
  };

  // Cargar componentes al montar el componente
  useEffect(() => {
    cargarComponentes();
  }, []);

  // Bloquear scroll cuando el modal está abierto
  useEffect(() => {
    if (imagenSeleccionada) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [imagenSeleccionada]);

    // Función para eliminar un componente por su ID
    const handleEliminar = async (id) => {

    if (!confirm("¿Eliminar componente?")) return;

    try {
        await eliminarComponente(id);
        setComponentes(prev => prev.filter(c => c.componenteId !== id));
    } catch (error) {
        console.error(error);
    }
    }; // Fin handleEliminar

    // Función para iniciar la edición de una celda específica
    const iniciarEdicion = (componente, campo) => {
      setCeldaEditando({
        id: componente.componenteId,
        campo
      });

      setValorTemporal(componente[campo]); // cargar valor actual en el estado temporal para editarlo en el input

    };

    /// ---- Función para guardar la edición de una celda específica ---- ///

    const guardarEdicion = async (componente, campo) => {
      if (guardando || componente[campo] === valorTemporal) {
        setCeldaEditando(null);
        return;
      }

      // Guardamos el valor anterior por si hay que revertir (en caso de error real)
      const valorAnterior = componente[campo];
      // Si el campo es numérico, convertimos el valor temporal a número antes de actualizar el estado
      let valorFinal = (campo === "precio" || campo === "consumoWatts" || campo === "capacidadWatts") 
                   ? Number(valorTemporal) 
                   : valorTemporal;

      // 1. ACTUALIZACIÓN OPTIMISTA (El usuario ve el cambio ya)
      setComponentes(prev =>
        prev.map(c => c.componenteId === componente.componenteId 
          ? { ...c, [campo]: valorFinal } 
          : c
        )
      );
      setCeldaEditando(null);

      try {
        setGuardando(true);
        
        // 2. Llamada al backend
        await actualizarComponente(componente.componenteId, {
          ...componente,
          [campo]: valorFinal
        });
        
        // Si llegamos aquí, todo bien (aunque el JSON sea vacío, el await ya pasó)
      } catch (error) {
        console.error("Error al sincronizar con el servidor:", error);
        
        // 3. REVERSIÓN en caso de error de red o servidor caído
        alert("Error de conexión. El cambio no se guardó en el servidor.");
        setComponentes(prev =>
          prev.map(c => c.componenteId === componente.componenteId 
            ? { ...c, [campo]: valorAnterior } 
            : c
          )
        );
      } finally {
        setGuardando(false);
      }
    };
  // fin guardarEdicion

  // Función para renderizar una celda editable para reducir código repetido en el renderizado de la tabla
  const renderCeldaEditable = (c, campoOriginal, type = "text") => {
  // 1. Identificar si estamos en la columna de energía
    const esEnergia = campoOriginal === "energia";
    
    // 2. Determinar qué propiedad del objeto usar (según el DTO de C#)
    // Si es energía, verificamos si el componente tiene capacidad (PSU) o consumo (otros)
    const campoReal = esEnergia 
      ? (c.capacidadWatts !== null && c.capacidadWatts !== undefined ? "capacidadWatts" : "consumoWatts")
      : campoOriginal;

    // 3. Obtener el valor actual para mostrar
    const valorMostrar = c[campoReal];

    return (
      <td
        onDoubleClick={() => !guardando && iniciarEdicion(c, campoReal)} 
        className={`cursor-pointer hover:bg-slate-700 transition text-center ${
          celdaEditando?.id === c.componenteId && celdaEditando?.campo === campoReal ? 'p-0' : ''
        }`}
        title="Doble click para editar"
      >
        {celdaEditando?.id === c.componenteId && celdaEditando?.campo === campoReal ? (
          <input
            value={valorTemporal}
            autoFocus
            type={type}
            disabled={guardando}
            onChange={(e) => setValorTemporal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") guardarEdicion(c, campoReal);
              if (e.key === "Escape") setCeldaEditando(null);
            }}
            onBlur={() => {
              if (valorTemporal != c[campoReal]) { // != permite comparar string con number
                guardarEdicion(c, campoReal);
              } else {
                setCeldaEditando(null);
              }
            }}
            className="bg-slate-700 p-1 rounded w-full border border-blue-400 outline-none"
          />
        ) : (
          <span>
            {campoReal === "precio" 
              ? `$${Number(c[campoReal]).toLocaleString()}` 
              : esEnergia 
                ? `${valorMostrar ?? 0} W` 
                : c[campoReal]}
          </span>
        )}
      </td>
    );
  };

  // --- NUEVA VARIABLE DINÁMICA para filtrar componentes ---
  const componentesFiltrados = componentes
    .filter(c =>
      (c.nombre || "").toLowerCase().includes(busqueda) ||
      (c.marca || "").toLowerCase().includes(busqueda) ||
      (c.modelo || "").toLowerCase().includes(busqueda)
    )
    .filter(c =>
      filtroTipo === "todos" ||
      (c.tipo || "").toString().toLowerCase().trim() === filtroTipo.toLowerCase()
    );

  return (
    <div className="w-full max-w-6xl">

      <button onClick={onBack} className="mt-6 bg-slate-700 p-3 rounded-lg hover:bg-gray-600">
        Regresar
      </button>

      <h2 className="text-xl font-semibold mb-6 bg-red text-slate-900 p-3 rounded text-center">
        Administrar Componentes
      </h2>

      <div className="flex gap-2 mb-4">
      <input
        placeholder="Buscar componente por nombre, marca o modelo..."
        className="p-2 rounded bg-slate-700 flex-1"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value.toLowerCase())} // convertir a minúsculas para búsqueda insensible a mayúsculas
      />

      <button
        onClick={() => setBusqueda("")}
        className="bg-slate-600 px-3 rounded"
      >
        Limpiar
      </button>

    </div>

    <div className="flex gap-2 mb-4 flex-wrap">
      <button
        onClick={() => setFiltroTipo("todos")}
        className={`px-3 py-1 rounded ${filtroTipo === "todos" ? "bg-blue-600" : "bg-slate-700"}`}
      >
        Todos
      </button>

      <button
        onClick={() => setFiltroTipo("cpu")}
        className={`px-3 py-1 rounded ${filtroTipo === "cpu" ? "bg-blue-600" : "bg-slate-700"}`}
      >
        CPU
      </button>

      <button
        onClick={() => setFiltroTipo("gpu")}
        className={`px-3 py-1 rounded ${filtroTipo === "gpu" ? "bg-blue-600" : "bg-slate-700"}`}
      >
        GPU
      </button>

      <button
        onClick={() => setFiltroTipo("memoriaram")}
        className={`px-3 py-1 rounded ${filtroTipo === "memoriaram" ? "bg-blue-600" : "bg-slate-700"}`}
      >
        RAM
      </button>

      <button
        onClick={() => setFiltroTipo("almacenamiento")}
        className={`px-3 py-1 rounded ${filtroTipo === "almacenamiento" ? "bg-blue-600" : "bg-slate-700"}`}
      >
        SSD
      </button>

      <button
        onClick={() => setFiltroTipo("fuentepoder")}
        className={`px-3 py-1 rounded ${filtroTipo === "fuentepoder" ? "bg-blue-600" : "bg-slate-700"}`}
      >
        Fuente
      </button>

      <button
        onClick={() => setFiltroTipo("placabase")}
        className={`px-3 py-1 rounded ${filtroTipo === "placabase" ? "bg-blue-600" : "bg-slate-700"}`}
      >
        Placa Base
      </button>

      <button
        onClick={() => setFiltroTipo("gabinete")}
        className={`px-3 py-1 rounded ${filtroTipo === "gabinete" ? "bg-blue-600" : "bg-slate-700"}`}
      >
        Gabinete
      </button>
      <button
        onClick={() => setFiltroTipo("refrigeracion")}
        className={`px-3 py-1 rounded ${filtroTipo === "refrigeracion" ? "bg-blue-600" : "bg-slate-700"}`}
      >
        Refrigeración
      </button>

    </div>

      <table className="w-full bg-slate-800 rounded-lg overflow-hidden border-collapse: separate">

        <thead 
                className={`bg-slate-700 p-1 rounded w-full border ${
          guardando ? "border-yellow-400" : "border-blue-400"
        }`}
        >
          <tr>
            <th className="p-3">ID</th>
            <th className="p-3">Imagen</th>
            <th className="text-center">Nombre</th>
            <th className="text-center">Tipo</th>
            <th className="text-center">Marca</th>
            <th className="text-center">Modelo</th>
            <th className="text-center">Precio</th>
            <th className="text-center"> Energía (W)</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {/* Renderizar componentes filtrados */}
          {componentesFiltrados.map((c, index) => (
            <tr key={c.componenteId} className="border-t border-slate-700 hover:bg-slate-600 transition">
              {/* Mostrar id de manera secuencial para tener el control de la cantidad (1,2,3, etc.) */}
              {/* 2. Muestra el índice + 1 para que empiece en 1 */}
              <td className="text-center font-semibold text-slate-400">
                {index + 1}
              </td>
              <td className="p-2">
                {c.imagenUrl && (
                  <img
                    src={c.imagenUrl}
                    className="w-16 cursor-pointer text-center mx-auto rounded hover:brightness-90 transition"
                    onClick={() => setImagenSeleccionada(c.imagenUrl)}
                  />
                )}
              </td>
              {renderCeldaEditable(c, "nombre")}
              <td className="text-center">{c.tipo}</td>
              {renderCeldaEditable(c, "marca")}
              {renderCeldaEditable(c, "modelo")}
              {renderCeldaEditable(c, "precio", "number")}
              {renderCeldaEditable(c, "energia", "number")} {/* "energia" activa la lógica especial */}

            <td className="flex justify-center p-2">

            <button
              onClick={() => handleEliminar(c.componenteId)}
              className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 transition"
            >
              Eliminar
            </button>

          </td>

          </tr> 

          ))}

        {/* FILA para avisar si no hay componentes registrados*/}
        {componentesFiltrados.length === 0 && (
          <tr>
            <td colSpan="9" className="text-center p-4">
                {busqueda || filtroTipo !== "todos" 
                    ? "No se encontraron componentes con esos filtros" 
                    : "No hay componentes registrados"}
            </td>
          </tr>
        )}
        </tbody>
      </table>
     <span className="mt-6 text-sm text-slate-400 text-center block">
        {filtroTipo === "todos" 
          ? `${componentesFiltrados.length} componentes en total` 
          : `${componentesFiltrados.length} componentes de tipo "${filtroTipo.toUpperCase()}"`}
        
        {busqueda && ` (filtrados por: "${busqueda}")`}
      </span>

      {/* Modal Imagen */}

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