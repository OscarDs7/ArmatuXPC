import React, { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, Cell, PieChart, Pie 
} from "recharts";
import { useNavigate } from "react-router-dom";
// Importamos tus servicios reales
import { getComponentes, getArmados, getComunidad } from "../services/api"; 

export default function MetricasAdmin() {
  const navigate = useNavigate();
  
  // Estados para almacenar datos reales de la API
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalComponentes: 0,
    totalArmados: 0,
    enComunidad: 0,
    valorInventario: 0,
    dataPopularidad: [],
    dataTipos: []
  });

 // Función para encontrar los componentes más usados en los armados reales
const obtenerTopComponentes = (armados) => {
  const conteo = {};

  armados.forEach(armado => {
    // Verificamos que el arreglo de componentes exista según tu captura de consola
    if (armado.componentes && Array.isArray(armado.componentes)) {
      armado.componentes.forEach(comp => {
        const nombre = comp.nombre; 
        conteo[nombre] = (conteo[nombre] || 0) + 1;
      });
    }
  });

  return Object.keys(conteo)
    .map(nombre => ({
      nombre: nombre,
      uso: conteo[nombre]
    }))
    .sort((a, b) => b.uso - a.uso)
    .slice(0, 5); 
};

// Segmentación por presupuesto sumando los componentes del array
const segmentarPresupuestos = (armados) => {
  const segmentos = { "Económico (<$15k)": 0, "Medio ($15k-$30k)": 0, "Entusiasta (>$30k)": 0 };
  
  armados.forEach(a => {
    // Calculamos el precio total dinámicamente sumando cada componente
    const precioTotal = a.componentes?.reduce((sum, c) => sum + (c.precio || 0), 0) || 0;

    if (precioTotal < 15000) segmentos["Económico (<$15k)"]++;
    else if (precioTotal <= 30000) segmentos["Medio ($15k-$30k)"]++;
    else segmentos["Entusiasta (>$30k)"]++;
  });

  return Object.keys(segmentos).map(key => ({ name: key, value: segmentos[key] }));
};

  // INDICADOR: Latencia (Carga paralela para optimizar tiempo de respuesta)
  useEffect(() => {
    const cargarEstadisticasReales = async () => {
        try {
        setLoading(true);
        const [componentes, armados] = await Promise.all([
            getComponentes(),
            getArmados()
        ]);

        setStats({
            totalComponentes: componentes.length,
            totalArmados: armados.length,
            // Usamos la propiedad real de tu captura: esPublicado
            enComunidad: armados.filter(a => a.esPublicado === true).length,
            valorInventario: componentes.reduce((sum, c) => sum + (c.precio || 0), 0),
            dataPopularidad: obtenerTopComponentes(armados),
            dataTipos: segmentarPresupuestos(armados)
        });
        } catch (error) {
        console.error("Error analizando métricas:", error);
        } finally {
        setLoading(false);
        }
    };
    cargarEstadisticasReales();
    }, []);

  const COLORS = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899"];

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Encabezado - Ux: Navegación Clara */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-sky-400 bg-clip-text text-transparent">
              Panel de Control Admin
            </h1>
            <p className="text-slate-400">Indicadores de Producto y Rendimiento</p>
          </div>
          <button 
            onClick={() => navigate(-1)}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition border border-slate-700 flex items-center gap-2"
          >
            ← Regresar
          </button>
        </div>

        {/* PARTE 1: KPIs Reales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Componentes" value={stats.totalComponentes} color="text-indigo-400" />
          <StatCard title="Proyectos Totales" value={stats.totalArmados} color="text-sky-400" />
          <StatCard title="En Comunidad" value={stats.enComunidad} color="text-emerald-400" />
          <StatCard title="Valor Activos" value={`$${stats.valorInventario.toLocaleString()}`} color="text-amber-400" />
        </div>

        {/* PARTE 2: Gráficos con Datos de la API */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Gráfico de Barras - Escalabilidad: Adaptable a N cantidad de datos */}
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-sm">
            <h3 className="text-xl font-semibold mb-6">Comparativa de Popularidad entre componentes</h3>
            <div className="h-75 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.dataPopularidad}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="nombre" stroke="#94a3b8" fontSize={10} tick={{fill: '#94a3b8'}} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px" }}
                  />
                  <Bar dataKey="uso" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico de Dona - Ux: Visualización de datos por categorías */}
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-sm">
            <h3 className="text-xl font-semibold mb-6">Estadísticas de presupuesto de cada armado</h3>
            <div className="h-75 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.dataTipos}
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.dataTipos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 text-xs">
                {stats.dataTipos.map((d, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                    <span className="text-slate-400">{d.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-lg hover:bg-slate-800/50 transition-all duration-300">
      <p className="text-slate-500 text-sm font-medium mb-1 uppercase tracking-wider">{title}</p>
      <h3 className={`text-3xl font-bold ${color}`}>{value}</h3>
    </div>
  );
}