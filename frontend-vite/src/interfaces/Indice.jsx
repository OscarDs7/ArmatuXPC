import { useNavigate } from "react-router-dom";

export default function MenuInstructivos() {

  const navigate = useNavigate();

  const componentes = [
    { nombre: "Fuente de Poder", ruta: "/Fuente", icono: "🔌" },
    { nombre: "Placa Madre", ruta: "/Placa", icono: "🖥️" },
    { nombre: "Disipador", ruta: "/Ventilador", icono: "❄️" },
    { nombre: "CPU (Procesador)", ruta: "/Cpu", icono: "🧠" },
    { nombre: "Tarjeta Gráfica", ruta: "/Grafica", icono: "🎮" },
    { nombre: "Memoria RAM", ruta: "/Ram", icono: "🔗" },
    { nombre: "Disco Duro / SSD", ruta: "/Almacenamiento", icono: "🗄️" }
    
  ];

  return (

   <div className="min-h-screen bg-linear-to-br from-blue-300 via-blue-400 to-blue-500 flex flex-col p-6">


      <div className="max-w-6xl mx-auto">
        <button
          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-200 transition shadow-lg"
          onClick={() => navigate("/dashboard-user")} >
          <h3 className="">Regresar</h3>
        </button>

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