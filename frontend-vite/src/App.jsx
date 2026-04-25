import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { MenuRoles } from "./interfaces/MenuRoles";

/* Componentes para el funcionamiento completo y seguro de las interfaces */
import Chatbot from "./components/Chatbot";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

/* Interfaces de Admin */
import MonitoreoLogistica from "./components/MonitoreoLogistica";
import LoginAdmin from "./interfaces/LoginAdmin";
import DashBoardAdmin from "./interfaces/DashBoardAdmin";;
import GestionCuentasAdmin from "./interfaces/GestionCuentasAdmin";
import AgregarComponenteAdmin from "./interfaces/GestionCatalogo";
import CrearCuentaAdmin from "./interfaces/CrearCuentaAdmin";
import AdministrarCuentas from "./interfaces/AdministrarCuentas";
import MetricasReportes from "./interfaces/MetricasReportes";

/* Interfaces de Usuario */
import LoginUsuario from "./interfaces/LoginUser";
import DashBoardUser from "./interfaces/DashBoardUser";
import NuevoProyecto from "./interfaces/NuevoProyecto";
import ProyectosExistentes from "./interfaces/ProyectosExistentes";
import Comunidad from "./interfaces/Comunidad";
import ComprarTokens from "./interfaces/ComprarTokens";
import PagoExitoso from "./interfaces/PagoExitoso";
import QuienesSomos from "./interfaces/QuienesSomos";

import Memorias from "./interfaces/Memorias";
import Placa from "./interfaces/Placa";
import Rams from "./interfaces/Rams";
import CPU from "./interfaces/CPU";
import Fuente from "./interfaces/Fuente";
import Ventilador from "./interfaces/Ventilador";
import Indice from "./interfaces/Indice";
import Grafica from "./interfaces/Grafica";

function App() {
  const [chatAbierto, setChatAbierto] = useState(false);

  return (
    <>
      <Toaster position="top-right" />

      <Routes>
        <Route path="/" element={<MenuRoles />} />
        <Route path="/login-user" element={<LoginUsuario />} />
        <Route path="/login-admin" element={<LoginAdmin />} />
        <Route path="/quienes-somos" element={<QuienesSomos />} />

        {/* Usuario */}
        <Route
          path="/dashboard-user"
          element={
            <ProtectedRoute>
              <DashBoardUser setChatAbierto={setChatAbierto} />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/dashboard-admin"
          element={
            <AdminRoute>
              <DashBoardAdmin />
            </AdminRoute>
          }
        />

        <Route
          path="/gestion-cuentas"
          element={
            <AdminRoute>
              <GestionCuentasAdmin />
            </AdminRoute>
          }
        />

        <Route
          path="/crear-cuenta-admin"
          element={
            <AdminRoute>
              <CrearCuentaAdmin />
            </AdminRoute>
          }
        />

        <Route
          path="/administrar-cuentas"
          element={
            <AdminRoute>
              <AdministrarCuentas />
            </AdminRoute>
          }
        />

        <Route
          path="/gestion-catalogo-admin"
          element={
            <AdminRoute>
              <AgregarComponenteAdmin />
            </AdminRoute>
          }
        />

        <Route
          path="/monitoreo-logistica-admin"
          element={
            <AdminRoute>
              <MonitoreoLogistica />
            </AdminRoute>
          }
        />

        <Route
          path="/metricas-reportes"
          element={
            <AdminRoute>
              <MetricasReportes />
            </AdminRoute>
          }
        />

        {/* Usuario protegido */}
        <Route
          path="/nuevo-proyecto"
          element={
            <ProtectedRoute>
              <NuevoProyecto />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mis-armados"
          element={
            <ProtectedRoute>
              <ProyectosExistentes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/comunidad"
          element={
            <ProtectedRoute>
              <Comunidad />
            </ProtectedRoute>
          }
        />

        <Route
          path="/comprar-tokens"
          element={
            <ProtectedRoute>
              <ComprarTokens />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pago-exitoso"
          element={
            <ProtectedRoute>
              <PagoExitoso />
            </ProtectedRoute>
          }
        />

        {/* Modelado */}
        <Route path="/Indice" element={<Indice />} />
        <Route path="/Almacenamiento" element={<Memorias />} />
        <Route path="/Ram" element={<Rams />} />
        <Route path="/CPU" element={<CPU />} />
        <Route path="/Fuente" element={<Fuente />} />
        <Route path="/Ventilador" element={<Ventilador />} />
        <Route path="/Grafica" element={<Grafica />} />
        <Route path="/Placa" element={<Placa />} />
      </Routes>

      <Chatbot abierto={chatAbierto} setAbierto={setChatAbierto} />
    </>
  );
}

export default App;