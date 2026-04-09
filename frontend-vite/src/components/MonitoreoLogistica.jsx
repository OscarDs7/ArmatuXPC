import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Cpu, Users, Link, ArrowLeft } from "lucide-react";

import ComponentesAdmin from "./monitoreo/ComponentesAdmin";
import ArmadosUsuarios from "./monitoreo/ArmadosUsuarios";
import CompatibilidadesAdmin from "./monitoreo/CompatibilidadesAdmin";

export default function MonitoreoLogistica({ onBack }) {

  const [vista, setVista] = useState("menu");
  const navigate = useNavigate();

  const cardStyle =
    "flex flex-col justify-center items-start gap-3 p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer";

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center p-10">

      <h1 className="text-4xl font-bold mb-10 tracking-wide text-center">
        🚀 Monitoreo y Logística
      </h1>

      {vista === "menu" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">

          {/* COMPONENTES */}
          <div
            onClick={() => setVista("componentes")}
            className={`${cardStyle} bg-gradient-to-br from-indigo-500 to-indigo-700`}
          >
            <Cpu size={40} />
            <h2 className="text-xl font-semibold">Administrar Componentes</h2>
            <p className="text-sm opacity-80">
              Gestiona, edita y controla los componentes disponibles
            </p>
          </div>

          {/* ARMADOS */}
          <div
            onClick={() => setVista("armados")}
            className={`${cardStyle} bg-gradient-to-br from-blue-500 to-blue-700`}
          >
            <Users size={40} />
            <h2 className="text-xl font-semibold">Armados de Usuarios</h2>
            <p className="text-sm opacity-80">
              Visualiza configuraciones creadas por los usuarios
            </p>
          </div>

          {/* COMPATIBILIDADES */}
          <div
            onClick={() => setVista("compatibilidades")}
            className={`${cardStyle} bg-gradient-to-br from-purple-500 to-purple-700`}
          >
            <Link size={40} />
            <h2 className="text-xl font-semibold">Compatibilidades</h2>
            <p className="text-sm opacity-80">
              Administra relaciones entre componentes
            </p>
          </div>

          {/* REGRESAR */}
          <div
            onClick={() => {
              if (onBack) onBack();
              else navigate("/dashboard-admin");
            }}
            className={`${cardStyle} bg-slate-700 hover:bg-slate-600`}
          >
            <ArrowLeft size={40} />
            <h2 className="text-xl font-semibold">Regresar</h2>
            <p className="text-sm opacity-80">
              Volver al panel principal
            </p>
          </div>

        </div>
      )}

      {vista === "componentes" && (
        <ComponentesAdmin onBack={() => setVista("menu")} />
      )}

      {vista === "armados" && (
        <ArmadosUsuarios onBack={() => setVista("menu")} />
      )}

      {vista === "compatibilidades" && (
        <CompatibilidadesAdmin onBack={() => setVista("menu")} />
      )}

    </div>
  );
}