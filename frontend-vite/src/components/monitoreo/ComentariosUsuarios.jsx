import React, { useEffect, useState } from 'react';
import { obtenerTodosLosFeedbacks, eliminarFeedback } from '../../services/api';
import { Trash2, Star, Calendar, User, Award, MessageSquare, ArrowLeft, Filter, ListFilter, XCircle, CheckCircle } from 'lucide-react';

export default function ComentariosUsuarios({ onBack }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para filtros
  const [filtroHito, setFiltroHito] = useState("TODOS"); // TODOS, PRIMER_ARMADO, TERCER_ARMADO
  const [filtroRating, setFiltroRating] = useState(0); // 0 significa todos

  useEffect(() => {
    cargarFeedbacks();
  }, []);

  const cargarFeedbacks = async () => {
    try {
      const data = await obtenerTodosLosFeedbacks();
      setFeedbacks(data);
    } catch (error) {
      console.error("Error al cargar feedbacks", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este comentario?")) {
      await eliminarFeedback(id);
      setFeedbacks(feedbacks.filter(f => f.id !== id));
    }
  };

  // Lógica de filtrado
  const feedbacksFiltrados = feedbacks.filter(f => {
    const cumpleHito = filtroHito === "TODOS" || f.tipoHito === filtroHito;
    const cumpleRating = filtroRating === 0 || f.rating === filtroRating;
    return cumpleHito && cumpleRating;
  });

  // Cálculos para las Cards de Resumen
  const promedioRating = feedbacks.length > 0 
    ? (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.filter(f => f.rating > 0).length || 0).toFixed(1)
    : 0;

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={`${i < rating ? "fill-yellow-400 text-yellow-400" : "text-slate-600"}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto animate-in fade-in duration-500 pb-10">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <MessageSquare className="text-pink-500" />
            Gestión de Feedback
          </h2>
          <p className="text-slate-400 mt-1">Panel administrativo de satisfacción</p>
        </div>
        <button onClick={onBack} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl transition-colors border border-slate-700">
          <ArrowLeft size={18} /> Regresar
        </button>
      </div>

      {/* CARDS DE RESUMEN */}
      {!loading && feedbacks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700">
            <p className="text-slate-400 text-sm">Total Feedback</p>
            <h3 className="text-2xl font-bold text-white">{feedbacks.length}</h3>
          </div>
          <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700">
            <p className="text-slate-400 text-sm">Rating Promedio</p>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold text-white">{promedioRating}</h3>
              <Star className="fill-yellow-400 text-yellow-400" size={20} />
            </div>
          </div>
          <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700">
            <p className="text-slate-400 text-sm">Nivel de Respuesta</p>
            <h3 className="text-2xl font-bold text-green-400">100%</h3>
          </div>
        </div>
      )}

      {/* BARRA DE FILTROS */}
      <div className="bg-slate-800/60 p-4 rounded-2xl mb-6 border border-slate-700 flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-3">
          <Filter size={18} className="text-pink-500" />
          <span className="text-sm font-medium text-slate-300">Filtrar por:</span>
        </div>

        {/* Filtro Hito */}
        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700">
          {["TODOS", "PRIMER_ARMADO", "TERCER_ARMADO"].map((tipo) => (
            <button
              key={tipo}
              onClick={() => setFiltroHito(tipo)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                filtroHito === tipo ? "bg-pink-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tipo === "TODOS" ? "Todos" : tipo === "PRIMER_ARMADO" ? "1er Armado" : "3er Armado"}
            </button>
          ))}
        </div>

        {/* Filtro Rating */}
        <div className="flex items-center gap-2">
          <ListFilter size={16} className="text-slate-500" />
          <select 
            value={filtroRating}
            onChange={(e) => setFiltroRating(Number(e.target.value))}
            className="bg-slate-900 text-slate-300 text-xs border border-slate-700 rounded-lg px-2 py-1 outline-none focus:border-pink-500"
          >
            <option value={0}>Cualquier Rating</option>
            {[5, 4, 3, 2, 1].map(n => (
              <option key={n} value={n}>{n} Estrellas</option>
            ))}
          </select>
        </div>

        <div className="ml-auto text-xs text-slate-500 italic">
          Mostrando {feedbacksFiltrados.length} resultados
        </div>
      </div>

      {/* TABLA */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 text-slate-300 uppercase text-xs tracking-wider">
                <th className="px-6 py-4 font-semibold"><div className="flex items-center gap-2"><User size={14}/> Usuario</div></th>
                <th className="px-6 py-4 font-semibold"><div className="flex items-center gap-2"><Award size={14}/> Hito</div></th>
                <th className="px-6 py-4 font-semibold">Rating</th>
                <th className="px-6 py-4 font-semibold w-1/3">Comentario</th>
                <th className="px-6 py-4 font-semibold">Ayuda</th>
                <th className="px-6 py-4 font-semibold"><div className="flex items-center gap-2"><Calendar size={14}/> Fecha</div></th>
                <th className="px-6 py-4 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {feedbacksFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center text-slate-500 font-medium">
                    No se encontraron comentarios con estos filtros.
                  </td>
                </tr>
              ) : (
                feedbacksFiltrados.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs text-indigo-400">
                      {f.usuarioUid.substring(0, 10)}...
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                        f.tipoHito === "PRIMER_ARMADO" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                      }`}>
                        {f.tipoHito === "PRIMER_ARMADO" ? "1er Armado" : "3er Armado"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {f.rating > 0 ? renderStars(f.rating) : <span className="text-slate-600 text-[12px] italic">S/R</span>}
                    </td>
                    <td className="px-6 py-4 italic text-slate-300 text-sm leading-relaxed">
                      "{f.comentario}"
                    </td>
                    <td className="px-6 py-4">
                        {f.tipoHito === "PRIMER_ARMADO" && f.completoSinAyuda !== null && (
                            <div className={`flex items-center gap-1.5 font-medium text-[11px] ${
                            f.completoSinAyuda ? "text-green-400" : "text-red-400"
                            }`}>
                            {f.completoSinAyuda ? (
                                <><CheckCircle size={14}/> Logrado</>
                            ) : (
                                <><XCircle size={14}/> Con ayuda</>
                            )}
                            </div>
                        )}
                        {f.tipoHito === "TERCER_ARMADO" && (
                            <span className="text-slate-500 text-[10px]">N/A</span>
                        )}
                        </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(f.fecha).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleEliminar(f.id)}
                        className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}