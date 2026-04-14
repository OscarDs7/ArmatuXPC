import { useNavigate } from "react-router-dom";
import BackButton from "../utilidades/BackButton"; // Botón para regresar al menú de roles

export default function MenuInstructivos() {

  const navigate = useNavigate();

  const componentes = [
    { nombre: " 1 Fuente de Poder", ruta: "/Fuente", icono: "🔌" },
    { nombre: "2 Placa Madre", ruta: "/Placa", icono: "🖥️" },
    { nombre: "3 Disipador", ruta: "/Ventilador", icono: "❄️" },
    { nombre: "4 CPU (Procesador)", ruta: "/Cpu", icono: "🧠" },
    { nombre: "5 Tarjeta Gráfica", ruta: "/Grafica", icono: "🎮" },
    { nombre: "6 Memoria RAM", ruta: "/Ram", icono: "🔗" },
    { nombre: "7 Disco Duro / SSD", ruta: "/Almacenamiento", icono: "🗄️" }
    
  ];

  return (

   <div className="min-h-screen bg-linear-to-b from-[#0f172a] via-[#1e3a8a] to-[#0f172a] text-white flex flex-col p-6">


      <div className="max-w-6xl mx-auto">

        <BackButton to="/dashboard-user" label="Regresar" className = "back-button" />

        <h1 className="text-4xl font-extrabold text-white text-center mb-10">
          Simulador de Ensamblaje de PC
        </h1>

        <p className="text-center text-slate-100 mb-10">
          Selecciona el instructivo que deseas visualizar 
        </p>

        <div className="grid grid-cols-3 gap-6">

          {componentes.map((comp, index) => (

            <div
              key={index}
              onClick={() => navigate(comp.ruta)}
              className="cursor-pointer bg-slate-900/60 backdrop-blur-xl p-8 rounded-3xl border border-slate-700 hover:border-cyan-500 transition-all duration-300 hover:scale-105 hover:shadow-xl text-center"
            >

              <div className="text-5xl mb-4">
                {comp.icono}
              </div>

              <h2 className="text-3xl font-extrabold mb-6 text-white!">
                {comp.nombre}
              </h2>

              <p className="text-slate-400 mt-2 text-sm">
                Ver instructivo
              </p>

            </div>

          ))}

        </div>

      </div>

    </div>

  );

}