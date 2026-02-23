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
import CrearCuentaAdmin from "./interfaces/CrearCuentaAdmin";
import AdministrarCuentas from "./interfaces/AdministrarCuentas";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MenuRoles />} />
      <Route path="/login" element={<LoginUsuario />} />
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
        path="/crear-cuenta"
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

      {/* Rutas de prueba para backend */}
      <Route path="/test-backend-basico" element={<TestBackendBasico />} />
      <Route path="/test-backend-medio" element={<TestBackendMedio />} />
      <Route path="/test-backend-completo" element={<TestBackendCompleto />}    
      />
    </Routes>
  );  
} 

export default App
