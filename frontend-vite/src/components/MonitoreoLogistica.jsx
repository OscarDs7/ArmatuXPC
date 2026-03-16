import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ComponentesAdmin from "./monitoreo/ComponentesAdmin";
import ArmadosUsuarios from "./monitoreo/ArmadosUsuarios";
import CompatibilidadesAdmin from "./monitoreo/CompatibilidadesAdmin";

export default function MonitoreoLogistica({ onBack }) {

  const [vista, setVista] = useState("menu");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center p-8">

      <h1 className="text-2xl font-semibold mb-6">
        Monitoreo y Logística
      </h1>

      {vista === "menu" && (
        <div className="flex flex-col gap-4 w-72">

          <button
            onClick={() => setVista("componentes")}
            className="bg-indigo-600 p-3 rounded-lg hover:bg-indigo-700"
          >
            Administrar Componentes
          </button>

          <button
            onClick={() => setVista("armados")}
            className="bg-indigo-600 p-3 rounded-lg hover:bg-indigo-700"
          >
            Ver Armados de Usuarios
          </button>

          <button
            onClick={() => setVista("compatibilidades")}
            className="bg-indigo-600 p-3 rounded-lg hover:bg-indigo-700"
          >
            Compatibilidades
          </button>

          <button
            onClick= {() => {
              if (onBack) onBack();
              else navigate("/dashboard-admin");
            }}

            className="bg-slate-700 p-3 rounded-lg hover:bg-slate-600"
          >
            Regresar
          </button>

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