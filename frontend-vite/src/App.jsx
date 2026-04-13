import { Routes, Route } from "react-router-dom";

import { MenuRoles } from "./interfaces/MenuRoles";
import LoginUsuario from "./interfaces/LoginUser";
import LoginAdmin from "./interfaces/LoginAdmin";
import DashBoardAdmin from "./interfaces/DashBoardAdmin";
import DashBoardUser from "./interfaces/DashBoardUser";
import TestBackendBasico from "./interfaces/TestBackendBasico";
import TestBackendMedio from "./interfaces/TestBackendMedio";
import TestBackendCompleto from "./interfaces/TestBackendCompleto";
import GestionCuentasAdmin from "./interfaces/GestionCuentasAdmin";
import AgregarComponenteAdmin from "./interfaces/GestionCatalogo";
import CrearCuentaAdmin from "./interfaces/CrearCuentaAdmin";
import AdministrarCuentas from "./interfaces/AdministrarCuentas";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import MonitoreoLogistica from "./components/MonitoreoLogistica";
import PruebaThree from "./interfaces/PruebaThree";
import NuevoProyecto from "./interfaces/NuevoProyecto";
import ProyectosExistentes from "./interfaces/ProyectosExistentes";
import Memorias from "./interfaces/Memorias";
import Placa from "./interfaces/Placa";
import Rams from "./interfaces/Rams";
import CPU from "./interfaces/CPU";
import Fuente from "./interfaces/Fuente";
import Ventilador from "./interfaces/Ventilador";
import Indice from "./interfaces/Indice";
import Grafica from "./interfaces/Grafica";
import QuienesSomos from "./interfaces/QuienesSomos";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MenuRoles />} />
      <Route path="/login-user" element={<LoginUsuario />} />
      <Route path="/login-admin" element={<LoginAdmin />} />

      {/* Rutas protegidas para usuarios autenticados */}
      <Route
        path="/dashboard-user"
        element={
          <ProtectedRoute>
            <DashBoardUser />
          </ProtectedRoute>
        }
      />
      <Route path="/quienes-somos" element={<QuienesSomos />} />
      
      {/* Rutas protegidas para administradores */}
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
      <Route path="/nuevo-proyecto" element={
        <ProtectedRoute>
          <NuevoProyecto />
          </ProtectedRoute>
        } 
      />
      <Route path="/mis-armados" element={
        <ProtectedRoute>
          <ProyectosExistentes />
          </ProtectedRoute>
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

      {/* Rutas de prueba para backend */}
      <Route path="/test-backend-basico" element={<TestBackendBasico />} />
      <Route path="/test-backend-medio" element={<TestBackendMedio />} />
      <Route path="/test-backend-completo" element={<TestBackendCompleto />}    
      />

      {/* Ruta de prueba para Three.js */}
      <Route path="/prueba-three" element={<PruebaThree />} />  

      {/* Rutas de modelado 3D de los componentes (guía interactiva) */}
      <Route path="/Indice" element={<Indice/>} />
      <Route path="/Almacenamiento" element={<Memorias />} />
      <Route path="/Ram" element={<Rams/>} />
      <Route path="/CPU" element={<CPU/>} />
      <Route path="/Fuente" element={<Fuente/>} />
      <Route path="/Ventilador" element={<Ventilador/>} />
      <Route path="/Grafica" element={<Grafica/>} />
      <Route path="/Placa" element={<Placa />} />
    </Routes>
  );  
} 

export default App
