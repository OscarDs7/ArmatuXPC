import React from "react";
import { useNavigate } from "react-router-dom";
import adminImg from "../assets/LogoAdmin.png";

export default function GestionCuentasAdmin() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-950 via-slate-900 to-black text-white px-6 py-12">

      {/* Header */}
      <div className="max-w-4xl mx-auto mb-12 bg-centered">
        <h1 className="text-4xl font-semibold mb-2 bg-centered">
          Gestión de cuentas
        </h1>
        <p className="text-slate-400">
          Administra y controla las cuentas del sistema
        </p>
      </div>

      {/* Contenedor principal */}
      <div className="max-w-2xl mx-auto bg-slate-800/70 backdrop-blur-md 
                      rounded-3xl shadow-2xl border border-slate-700 
                      p-10 flex flex-col items-center">

        {/* Imagen */}
        <img
          src={adminImg}
          alt="Administrador"
          className="w-40 mb-10 opacity-90"
        />

        {/* Botones */}
        <div className="w-full space-y-6">

          <button
            onClick={() => navigate("/crear-admin")}
            className="w-full py-4 rounded-xl 
                       bg-slate-700 hover:bg-indigo-600 
                       transition-all duration-300 
                       text-lg font-medium shadow-lg"
          >
            Crear nueva cuenta de administrador
          </button>

          <button
            onClick={() => navigate("/administrar-cuentas")}
            className="w-full py-4 rounded-xl 
                       bg-slate-700 hover:bg-indigo-600 
                       transition-all duration-300 
                       text-lg font-medium shadow-lg"
          >
            Administrar cuentas
          </button>

        </div>

        {/* Botón regresar */}
        <button
          onClick={() => navigate("/dash-admin")}
          className="mt-12 px-8 py-3 rounded-xl 
                     bg-sky-600 hover:bg-sky-700 
                     transition shadow-lg"
        >
          Regresar
        </button>

      </div>
    </div>
  );
}