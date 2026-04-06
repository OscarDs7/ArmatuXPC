import { useEffect, useState } from "react";
import { getArmados, togglePublicado, eliminarArmadoAdmin } from "../../services/api";

export default function ArmadosUsuarios({ onBack }) {
  const [armados, setArmados] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = async () => {
    try {
      const data = await getArmados();
      console.log("DATOS DE LA API:", data[0]); // Mira esto en la consola del navegador (F12)
      setArmados(data);
      setFiltered(data);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    const res = armados.filter(a => 
      a.nombreArmado?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.autorNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.usuarioId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.componentes?.some(c => c.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFiltered(res);
  }, [searchTerm, armados]);

  const handleToggle = async (id) => {
    try {
      const result = await togglePublicado(id);
      setArmados(prev => prev.map(a => 
        a.armadoId === id ? { ...a, esPublicado: result.nuevoEstado } : a
      ));
    } catch (error) {
      alert("Error al moderar: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este armado? Esta acción es irreversible.")) return;
    try {
      await eliminarArmadoAdmin(id);
      setArmados(prev => prev.filter(a => a.armadoId !== id));
    } catch (error) {
      alert("Error al eliminar: " + error.message);
    }
  };

  const stats = {
    total: armados.length,
    publicos: armados.filter(a => a.esPublicado).length,
    dineroTotal: armados.reduce((acc, a) => acc + a.componentes.reduce((sum, c) => sum + c.precio, 0), 0)
  };

  if (loading) return <div className="p-10 text-white font-mono">Accediendo a la base de datos...</div>;

 return (
  <div className="p-8 bg-slate-900 min-h-screen text-white font-sans">
    {/* HEADER: Más limpio y con mejor contraste */}
    <header className="mb-10 flex justify-between items-end border-b border-slate-800 pb-6">
      <div>
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-cyan-400 italic">
          ADMIN // PANEL DE CONTROL
        </h1>
        <p className="text-slate-500 text-sm mt-1 tracking-wide uppercase">
          Monitoreo y moderación de configuraciones
        </p>
      </div>
      <button 
        onClick={onBack} 
        className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-6 py-2 rounded-full border border-slate-700 transition-all active:scale-95 flex items-center gap-2 text-sm font-bold"
      >
        <span>←</span> Volver
      </button>
    </header>

    {/* DASHBOARD: Tarjetas con diseño de cristal (Glassmorphism) */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      {[
        { label: "Total Armados", val: stats.total, color: "border-indigo-500", icon: "📊" },
        { label: "Publicados", val: stats.publicos, color: "border-green-500", icon: "🌐" },
        { label: "Valor Total", val: `$${stats.dineroTotal.toLocaleString()}`, color: "border-yellow-500", icon: "💰" }
      ].map((stat, i) => (
        <div key={i} className={`bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border-l-4 ${stat.color} shadow-xl hover:translate-y-1 transition-transform`}>
          <div className="flex justify-between items-start">
            <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">{stat.label}</p>
            <span className="opacity-50">{stat.icon}</span>
          </div>
          <p className="text-3xl font-black mt-2 text-slate-100">{stat.val}</p>
        </div>
      ))}
    </div>

    {/* BUSCADOR: Efecto focus mejorado */}
    <div className="mb-8 sticky top-4 z-10">
      <div className="relative group">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">🔍</span>
        <input 
          type="text"
          placeholder="Buscar por nombre de PC, Nombre de usuario, ID de usuario o componente específico..."
          className="w-full bg-slate-900/80 backdrop-blur-md border border-slate-700 pl-12 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all shadow-2xl placeholder:text-slate-600"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>

    {/* LISTADO: Tarjetas con mejor separación de datos */}
    <div className="grid gap-6">
      {filtered.length > 0 ? (
        filtered.map(a => (
          <div key={a.armadoId} className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl flex flex-col lg:flex-row gap-6 hover:bg-slate-800/60 hover:border-slate-600 transition-all shadow-lg group">
            
            {/* Info Principal */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-bold text-xl text-slate-100 group-hover:text-indigo-300 transition-colors">
                  {a.nombreArmado}
                </h3>
                <span className={`text-[10px] px-3 py-1 rounded-full font-black tracking-tighter ${
                  a.esPublicado 
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                  : 'bg-slate-700 text-slate-400'
                }`}>
                  {a.esPublicado ? 'PÚBLICO' : 'BORRADOR'}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-mono mb-4">
                <p>ID: <span className="text-slate-300">{a.usuarioId}</span></p>
                <p>| Autor: <span className="text-indigo-400">{a.autorNombre || 'Anónimo'}</span></p>
              </div>

              {/* Grid de Componentes: Más legible */}
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2 py-4 border-t border-slate-700/50">
                {a.componentes.map((comp, idx) => (
                  <div key={idx} className="bg-slate-900/40 border border-slate-700/30 p-2 rounded-lg hover:border-slate-500 transition-colors">
                    <p className="text-[10px] text-slate-300 font-medium truncate italic" title={comp.nombre}>
                      {comp.nombre}
                    </p>
                    <p className="text-[11px] text-indigo-400 font-black mt-0.5">
                      ${comp.precio.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-2 text-[10px] font-bold text-slate-500 flex justify-between items-center">
                <span className="uppercase tracking-widest">{a.componentes.length} piezas detectadas</span>
                <span className="text-indigo-400 text-sm italic">Subtotal: ${a.componentes.reduce((s,c) => s+c.precio,0).toLocaleString()}</span>
              </div>
            </div>

            {/* Panel de Acciones Laterales */}
            <div className="flex flex-row lg:flex-col justify-center gap-3 min-w-35 border-t lg:border-t-0 lg:border-l border-slate-700/50 pt-4 lg:pt-0 lg:pl-6">
              <button 
                onClick={() => handleToggle(a.armadoId)}
                className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-black transition-all border ${
                  a.esPublicado 
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500 hover:text-slate-900' 
                  : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-slate-900'
                }`}
              >
                {a.esPublicado ? 'DESACTIVAR' : 'APROBAR PC'}
              </button>
              
              <button 
                onClick={() => handleDelete(a.armadoId)}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-black bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/5"
              >
                ELIMINAR
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-800/20 rounded-3xl border-2 border-dashed border-slate-800">
          <span className="text-5xl mb-4 opacity-20">🔎</span>
          <p className="text-slate-500 text-lg font-medium">No hay coincidencias para "{searchTerm}"</p>
          <button onClick={() => setSearchTerm("")} className="mt-2 text-indigo-400 hover:underline text-sm">Limpiar filtros</button>
        </div>
      )}
    </div>
  </div>
);

}