import { useState, useEffect } from "react";
import { getComponentes, getCompatibilidades, guardarCompatibilidad, eliminarCompatibilidad, actualizarCompatibilidad } from "../../services/api";

export default function GestionCompatibilidades({ onBack }) {
  const [componentes, setComponentes] = useState([]);
  const [reglas, setReglas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    componenteAId: "",
    componenteBId: "",
    esCompatible: true,
    motivo: ""
  });

    // Función para preparar la edición
    const prepararEdicion = (regla) => {
        setEditMode(true);
        setSelectedId(regla.compatibilidadId);
        setFormData({
            componenteAId: regla.componenteAId.toString(),
            componenteBId: regla.componenteBId.toString(),
            esCompatible: regla.esCompatible,
            motivo: regla.motivo
        });
        // Opcional: hacer scroll hacia arriba para ver el formulario
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Función para cancelar
    const cancelarEdicion = () => {
        setEditMode(false);
        setSelectedId(null);
        setFormData({ componenteAId: "", componenteBId: "", esCompatible: true, motivo: "" });
    };

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

  // Función para manejar el envío del formulario o la actualización de una regla
  const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.componenteAId || !formData.componenteBId) return alert("Selecciona componentes");

        const objetoParaEnviar = {
            CompatibilidadId: selectedId || 0, // Importante para el PUT
            ComponenteAId: parseInt(formData.componenteAId),
            ComponenteBId: parseInt(formData.componenteBId),
            Motivo: formData.motivo,
            EsCompatible: formData.esCompatible
        };

        try {
            if (editMode) {
            await actualizarCompatibilidad(selectedId, objetoParaEnviar);
            // Actualizamos el estado local para reflejar el cambio sin recargar
            setReglas(reglas.map(r => r.compatibilidadId === selectedId ? { ...r, ...objetoParaEnviar, compatibilidadId: selectedId } : r));
            alert("Regla actualizada con éxito");
            } else {
            const nuevaRegla = await guardarCompatibilidad(objetoParaEnviar);
            setReglas([...reglas, nuevaRegla]);
            alert("Regla creada");
            }
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
    } catch (error) {
      alert(error.message);
    }
  };

   // Diseño de loading() moderno con TailwindCSS
   if (loading) {
    return (
      <div className="w-full max-w-6xl animate-pulse">
        <div className="h-10 bg-slate-700 rounded w-1/4 mb-6"></div> {/* Botón regresar */}
        <div className="h-12 bg-slate-700 rounded w-full mb-8"></div> {/* Título */}
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-slate-800 rounded-lg w-full"></div>
          ))}
        </div>
        <p className="text-center mt-4 text-slate-500 font-mono">Sincronizando con base de datos...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-900 min-h-screen text-white">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-cyan-400 italic">ADMIN // COMPATIBILIDADES</h1>
          <p className="text-slate-400 text-sm">Configuración de reglas de validación cruzada</p>
        </div>
        <button onClick={onBack} className="bg-slate-800 px-4 py-2 rounded-lg hover:bg-slate-700 transition">Volver</button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* FORMULARIO DE INGRESO */}
        <div className="lg:col-span-1 bg-slate-800 p-6 rounded-2xl border border-slate-700 h-fit sticky top-8">
          <h2 className="text-xl font-bold mb-6 text-indigo-300 flex items-center gap-2">
            <span>{editMode ? "📝 Editando Regla" : "➕ Nueva Regla"}</span>
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Componente A</label>
              <select 
                className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                value={formData.componenteAId}
                onChange={(e) => setFormData({...formData, componenteAId: e.target.value})}
              >
                <option value="">Seleccionar...</option>
                {componentes.map(c => (
                  <option key={c.componenteId} value={c.componenteId}>[{c.tipo}] {c.nombre}</option>
                ))}
              </select>
            </div>

            <div className="text-center text-slate-600 font-black text-xl">VS</div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Componente B</label>
              <select 
                className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                value={formData.componenteBId}
                onChange={(e) => setFormData({...formData, componenteBId: e.target.value})}
              >
                <option value="">Seleccionar...</option>
                {componentes.map(c => (
                  <option key={c.componenteId} value={c.componenteId}>[{c.tipo}] {c.nombre}</option>
                ))}
              </select>
            </div>

            <div className="pt-4">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Estado de Compatibilidad</label>
              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, esCompatible: true})}
                  className={`flex-1 p-3 rounded-xl font-bold text-xs transition ${formData.esCompatible ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-400'}`}
                >
                  COMPATIBLE
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, esCompatible: false})}
                  className={`flex-1 p-3 rounded-xl font-bold text-xs transition ${!formData.esCompatible ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-400'}`}
                >
                  INCOMPATIBLE
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Motivo / Descripción</label>
              <textarea 
                placeholder="Ej: El socket no coincide o requiere actualización de BIOS..."
                className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm h-24 resize-none"
                value={formData.motivo}
                onChange={(e) => setFormData({...formData, motivo: e.target.value})}
              />
            </div>
            <button type="submit" className={`w-full font-black p-4 rounded-xl transition mt-4 ${editMode ? 'bg-amber-600 hover:bg-amber-500' : 'bg-indigo-600 hover:bg-indigo-500'}`}>
              {editMode ? "ACTUALIZAR CAMBIOS" : "GUARDAR REGLA"}
            </button>
            {editMode && (
                <button type="button" onClick={cancelarEdicion} className="w-full text-slate-400 text-xs mt-2 hover:underline">
                    Cancelar edición
                </button>
            )}
          </form>
        </div>

        {/* LISTADO DE REGLAS EXISTENTES */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-bold mb-2 text-slate-400 uppercase tracking-widest text-sm">Reglas Activas</h2>
          {reglas.length === 0 ? (
            <div className="text-slate-600 italic p-10 bg-slate-800/30 rounded-2xl border-2 border-dashed border-slate-800 text-center">
              No hay reglas de compatibilidad definidas.
            </div>
          ) : (
            reglas.map(r => {
              const compA = componentes.find(c => c.componenteId === r.componenteAId);
              const compB = componentes.find(c => c.componenteId === r.componenteBId);
              return (
                <div key={r.compatibilidadId} className="bg-slate-800 border border-slate-700 p-5 rounded-2xl flex justify-between items-center group hover:border-slate-500 transition">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">{compA?.tipo}</span>
                        <span className="text-sm font-bold text-slate-200">{compA?.nombre}</span>
                      </div>
                      <span className="text-slate-600 font-black">⚡</span>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">{compB?.tipo}</span>
                        <span className="text-sm font-bold text-slate-200">{compB?.nombre}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ${r.esCompatible ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {r.esCompatible ? 'ES COMPATIBLE' : 'INCOMPATIBLE'}
                      </span>
                      <p className="text-xs text-slate-400 italic">"{r.motivo || 'Sin observaciones'}"</p>
                    </div>
                  </div>
                  <button 
                        onClick={() => prepararEdicion(r)}
                        className="p-2 text-amber-500 hover:bg-amber-500/10 rounded-lg"
                        title="Editar regla"
                    >
                        ✏️
                    </button>
                  <button 
                    onClick={() => handleDelete(r.compatibilidadId)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition"
                    title="Eliminar regla"
                  >
                    🗑️
                  </button>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}