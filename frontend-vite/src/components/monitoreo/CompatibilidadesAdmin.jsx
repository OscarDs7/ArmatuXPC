import { useState, useEffect } from "react";
import { getComponentes, getCompatibilidades, guardarCompatibilidad, eliminarCompatibilidad, actualizarCompatibilidad } from "../../services/api";
import { toast } from 'react-hot-toast';

export default function GestionCompatibilidades({ onBack }) {
  const [componentes, setComponentes] = useState([]);
  const [reglas, setReglas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos"); // "todos", "compatibles", "incompatibles"
  // Obtenemos una lista de tipos únicos: ["CPU", "Motherboard", "RAM", ...]
  const tiposDisponibles = [...new Set(componentes.map(c => c.tipo))].sort();
  // Estado para el filtro por tipo
  const [filtroTipo, setFiltroTipo] = useState("todos");

  // Estado del formulario
  const [formData, setFormData] = useState({
    componenteAId: "",
    componenteBId: "",
    esCompatible: true,
    motivo: ""
  });

  // 1. CARGA DE DATOS
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [comps, regs] = await Promise.all([getComponentes(), getCompatibilidades()]);
        setComponentes(comps);
        setReglas(regs);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. LÓGICA DE FILTRADO MEJORADA
  // Filtramos las reglas basándonos en los nombres de los componentes reales y el tipo de filtro
  const reglasFiltradas = reglas.filter(r => {
    const compA = componentes.find(c => c.componenteId === r.componenteAId);
    const compB = componentes.find(c => c.componenteId === r.componenteBId);
    
    const nameA = compA?.nombre.toLowerCase() || "";
    const nameB = compB?.nombre.toLowerCase() || "";
    const tipoA = compA?.tipo || "";
    const tipoB = compB?.tipo || "";
    const term = busqueda.toLowerCase();

    // 1. Filtro por Texto
    const coincideTexto = nameA.includes(term) || nameB.includes(term) || r.motivo?.toLowerCase().includes(term);

    // 2. Filtro por Estado
    const coincideEstado = 
      filtroEstado === "todos" || 
      (filtroEstado === "compatibles" && r.esCompatible) || 
      (filtroEstado === "incompatibles" && !r.esCompatible);

    // 3. Filtro por Tipo (si el tipo buscado está en el componente A o en el B)
    const coincideTipo = 
      filtroTipo === "todos" || 
      tipoA === filtroTipo || 
      tipoB === filtroTipo;

    return coincideTexto && coincideEstado && coincideTipo;
  });

  // Método para extraer datos de la regla para su actualización
  const prepararEdicion = (regla) => {
    setEditMode(true);
    setSelectedId(regla.compatibilidadId);
    setFormData({
      componenteAId: regla.componenteAId.toString(),
      componenteBId: regla.componenteBId.toString(),
      esCompatible: regla.esCompatible,
      motivo: regla.motivo
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicion = () => {
    setEditMode(false);
    setSelectedId(null);
    setFormData({ componenteAId: "", componenteBId: "", esCompatible: true, motivo: "" });
  };

  // Función para enviar datos de nueva regla o actualización de una existente
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1.Validación de componentes seleccionados
    if (!formData.componenteAId || !formData.componenteBId) return alert("Selecciona componentes");

    // 2. Validación de Motivo Obligatorio para Incompatibilidad
    if (!formData.esCompatible && (!formData.motivo || formData.motivo.trim().length < 5)) {
        return alert("⚠️ Por seguridad, debes ingresar un motivo detallado de por qué estos componentes son incompatibles.");
    }

    const objetoParaEnviar = {
      CompatibilidadId: selectedId || 0,
      ComponenteAId: parseInt(formData.componenteAId),
      ComponenteBId: parseInt(formData.componenteBId),
      Motivo: formData.motivo.trim(),
      EsCompatible: formData.esCompatible
    };

    try {
      if (editMode) {
        // 1. Llamada a la API
        await actualizarCompatibilidad(selectedId, objetoParaEnviar);
        // 2. Sincronización manual del estado local
        setReglas(prevReglas => 
          prevReglas.map(r => 
            r.compatibilidadId === selectedId 
              ? { ...r, ...objetoParaEnviar, compatibilidadId: selectedId } 
              : r
          )
        );
        toast.success("Regla actualizada con éxito!");
      } else {
        // 1. La API devuelve la regla con su ID real y relaciones
        const nuevaRegla = await guardarCompatibilidad(objetoParaEnviar);
        // 2. Añadimos al estado usando el operador spread (...)
        setReglas(prevReglas => [...prevReglas, nuevaRegla]);
        toast.success("Regla creada con éxito!");
      }

      // LA CLAVE: Volver a pedir las reglas al servidor después de guardar
      // Esto traerá los nombres de los componentes actualizados y refrescará la lista
      const reglasActualizadas = await getCompatibilidades(); 
      setReglas(reglasActualizadas); 

      cancelarEdicion();

    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar esta regla?")) return;
    try {
      await eliminarCompatibilidad(id);
      setReglas(reglas.filter(r => r.compatibilidadId !== id));
      toast.success("Regla eliminada con éxito!")
    } catch (error) {
      alert(error.message);
    }
  };

  /* LÓGICA PRO para que solo me muestre los componentes con los que no tiene conexión el ComponenteA */

  // Obtener componentes que NO tienen conexión con el Componente A seleccionado
  const componentesBDisponibles = componentes.filter(comp => {
    // 1. No puede ser el mismo componente que el A
    if (comp.componenteId === parseInt(formData.componenteAId)) return false;

    // 2. No puede existir ya una regla entre A y B (en cualquier orden)
    const existeRegla = reglas.some(r => 
      (r.componenteAId === parseInt(formData.componenteAId) && r.componenteBId === comp.componenteId) ||
      (r.componenteAId === comp.componenteId && r.componenteBId === parseInt(formData.componenteAId))
    );

    return !existeRegla;
  });

  if (loading) return <div className="p-10 text-white animate-pulse">Cargando base de datos...</div>;

  return (
    <div className="p-8 bg-slate-900 min-h-screen text-white font-sans">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-cyan-400 italic">ADMIN // COMPATIBILIDADES</h1>
          <p className="text-slate-400 text-sm">Configuración de reglas de validación cruzada</p>
        </div>
        <button onClick={onBack} className="bg-slate-800 px-4 py-2 rounded-lg hover:bg-slate-700 transition">Volver</button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* FORMULARIO */}
        <div className="lg:col-span-1 bg-slate-800 p-6 rounded-2xl border border-slate-700 h-fit sticky top-8">
          <h2 className="text-xl font-bold mb-6 text-indigo-300">
            {editMode ? "📝 Editando Regla" : "➕ Nueva Regla"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Componente A</label>
              <select 
                className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.componenteAId}
                // Modificación en el onChange del Componente A para observar reglas que ya existen para ese componente en el listado
                onChange={(e) => {
                  const idSeleccionado = e.target.value;
                  setFormData({...formData, componenteAId: idSeleccionado, componenteBId: ""}); // Reseteamos B por seguridad
                  
                  // Opcional: Filtrar la lista de abajo automáticamente
                  const nombreComp = componentes.find(c => c.componenteId === parseInt(idSeleccionado))?.nombre || "";
                  setBusqueda(nombreComp); 
                }}
              >
                <option value="">Seleccionar...</option>
                {componentes.map(c => <option key={c.componenteId} value={c.componenteId}>[{c.tipo}] {c.nombre}</option>)}
              </select>
            </div>
            <div className="text-center text-slate-600 font-black text-xl">VS</div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Componente B
                {formData.componenteAId && <span className="text-indigo-400 ml-2">({componentesBDisponibles.length} disponibles)</span>}
                </label>
              <select 
                className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.componenteBId}
                onChange={(e) => setFormData({...formData, componenteBId: e.target.value})}
                disabled={!formData.componenteAId} // Bloqueado hasta elegir el A
              >
                <option value="">
                  {!formData.componenteAId ? "Primero selecciona el Componente A..." : "Seleccionar componente compatible/incompatible..."}
                </option>
                {componentesBDisponibles.map(c => (
                  <option key={c.componenteId} value={c.componenteId}>
                    [{c.tipo}] {c.nombre}
                  </option>
                ))}
              </select>

              {formData.componenteAId && componentesBDisponibles.length === 0 && (
                <p className="text-[10px] text-amber-500 mt-1 italic">
                  ⚠️ Este componente ya tiene reglas creadas con todos los demás.
                </p>
              )}
            </div>
            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => setFormData({...formData, esCompatible: true})} className={`flex-1 p-3 rounded-xl font-bold text-xs ${formData.esCompatible ? 'bg-green-600' : 'bg-slate-700 text-slate-400'}`}>COMPATIBLE</button>
              <button type="button" onClick={() => setFormData({...formData, esCompatible: false})} className={`flex-1 p-3 rounded-xl font-bold text-xs ${!formData.esCompatible ? 'bg-red-600' : 'bg-slate-700 text-slate-400'}`}>INCOMPATIBLE</button>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Motivo / Descripción 
                {!formData.esCompatible && <span className="text-rose-500 ml-1">(Obligatorio)</span>}
              </label>
              <textarea 
                placeholder={formData.esCompatible 
                  ? "Ej: Compatible nativamente..." 
                  : "Explica por qué no funcionan (ej: El socket LGA1851 no es físicamente compatible con LGA1700)"}
                className={`w-full bg-slate-900 border p-3 rounded-xl outline-none transition-all h-24 resize-none ${
                  !formData.esCompatible && !formData.motivo 
                    ? 'border-rose-500/50 focus:ring-rose-500' 
                    : 'border-slate-700 focus:ring-indigo-500'
                }`}
                value={formData.motivo}
                onChange={(e) => setFormData({...formData, motivo: e.target.value})}
              />
            </div>
            <button type="submit" className={`w-full font-black p-4 rounded-xl transition ${editMode ? 'bg-amber-600' : 'bg-indigo-600'}`}>
              {editMode ? "ACTUALIZAR CAMBIOS" : "GUARDAR REGLA"}
            </button>
          </form>
        </div>

        {/* LISTADO CON BÚSQUEDA */}
        <div className="lg:col-span-2 space-y-4">

          <h2 className="font-bold text-slate-400 uppercase tracking-widest text-sm">Reglas Activas ({reglasFiltradas.length})</h2>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                        
            {/* FILTRO POR TIPO DE ESTADO */}
            <div className="flex flex-wrap gap-2 mb-4">
                <button 
                  onClick={() => setFiltroEstado("todos")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${filtroEstado === 'todos' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                  TODOS
                </button>
                <button 
                  onClick={() => setFiltroEstado("compatibles")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${filtroEstado === 'compatibles' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                  COMPATIBLES
                </button>
                <button 
                  onClick={() => setFiltroEstado("incompatibles")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${filtroEstado === 'incompatibles' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                  INCOMPATIBLES
                </button>
            </div>

            {/* BÚSQUEDA POR TEXTO */}
            <input 
              type="text" 
              placeholder="🔍 Buscar por componente o motivo..." 
              className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm w-full md:w-68"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />

            {/* FILTRO POR TIPO DE COMPONENTE */}
            <div className="w-full md:w-48">
              <select 
                className="w-full bg-slate-800 border border-slate-700 px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-300"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
              >
                <option value="todos">Todos los tipos</option>
                {tiposDisponibles.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>
          </div>

          {reglasFiltradas.length === 0 ? (
            <div className="text-slate-600 italic p-10 bg-slate-800/30 rounded-2xl border-2 border-dashed border-slate-800 text-center">
              No se encontraron reglas que coincidan con la búsqueda.
            </div>
          ) : (
            reglasFiltradas.map(r => {
              const compA = componentes.find(c => c.componenteId === r.componenteAId);
              const compB = componentes.find(c => c.componenteId === r.componenteBId);
              return (
                <div key={r.compatibilidadId} 
                  className={`bg-slate-800 border p-5 rounded-2xl flex justify-between items-center group transition-all duration-300 ${
                      r.esCompatible 
                        ? 'border-slate-700 hover:border-green-500/50' 
                        : 'border-rose-900/30 hover:border-rose-500/50 shadow-lg shadow-rose-900/5'
                    }`}
                  >
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-indigo-400 font-bold uppercase">{compA?.tipo}</span>
                        <span className="text-sm font-bold text-slate-200">{compA?.nombre}</span>
                      </div>
                      <span className="text-slate-600 font-black">⚡</span>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-indigo-400 font-bold uppercase">{compB?.tipo}</span>
                        <span className="text-sm font-bold text-slate-200">{compB?.nombre}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] px-3 py-1 rounded-full font-black tracking-wider transition-colors ${
                        r.esCompatible 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {r.esCompatible ? '✅ COMPATIBLE' : '❌ INCOMPATIBLE'}
                      </span>
                      
                      {/* Motivo con estilo condicional */}
                      <p className={`text-xs italic ${r.esCompatible ? 'text-slate-400' : 'text-rose-300/70'}`}>
                        "{r.motivo || 'Sin observaciones'}"
                      </p>
                  </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => prepararEdicion(r)} className="p-2 bg-slate-700 hover:bg-amber-600 rounded-lg transition" title="Editar">✏️</button>
                    <button onClick={() => handleDelete(r.compatibilidadId)} className="p-2 bg-slate-700 hover:bg-red-600 rounded-lg transition" title="Eliminar">🗑️</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}