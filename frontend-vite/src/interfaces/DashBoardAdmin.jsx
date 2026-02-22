import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function DashBoardAdmin() {
  const location = useLocation();
  const navigate = useNavigate();
  const nombre = location.state?.nombre || "Administrador";

  const cards = [
    { title: "Gestión de cuentas", icon: "⚙️", path: "/gestion-cuentas-admin" },
    { title: "Gestión de Catálogo", icon: "📦", path: "/gestion-catalogo-admin" },
    { title: "Monitoreo y logística", icon: "📊", path: "/monitoreo-logistica-admin" },
    { title: "Métricas y reportes", icon: "📈", path: "/metricas-reportes-admin" },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-950 via-slate-900 to-black text-white px-6 py-10">

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-semibold mb-2">
          Inicio Administrador
        </h1>
        <p className="text-lg text-slate-300">
          Bienvenido <span className="font-bold text-white">{nombre}</span>, has iniciado sesión ✔️
        </p>
      </div>

      {/* Grid */}
      <div className="max-w-5xl mx-auto grid gap-8 sm:grid-cols-1 md:grid-cols-2">

        {cards.map((card, index) => (
          <div
            key={index}
            onClick={() => navigate(card.path)}

            className="bg-slate-800/80 backdrop-blur-md p-8 rounded-2xl shadow-xl 
                       hover:shadow-2xl hover:-translate-y-2 
                       transition-all duration-300 cursor-pointer 
                       text-center border border-slate-700"
          >
            <div className="text-5xl mb-4">{card.icon}</div>
            <h3 className="text-xl font-medium">{card.title}</h3>
          </div>
        ))}

      </div>

      {/* Botón */}
      <div className="text-center mt-12">
        <button
          onClick={() => navigate("/login-admin")}
          className="px-8 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 
                     transition-all duration-300 shadow-lg"
        >
          Regresar
        </button>
      </div>

    </div>
  );
}