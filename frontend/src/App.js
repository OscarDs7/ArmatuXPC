import { Routes, Route } from "react-router-dom";

import MenuRoles from "./interfaces/MenuRoles";
import LoginUsuario from "./interfaces/LoginUser";
import LoginAdmin from "./interfaces/LoginAdmin";
import DashBoardAdmin from "./interfaces/DashBoardAdmin";
import DashBoardUser from "./interfaces/DashBoardUser";
import TestBackendBasico from "./interfaces/TestBackendBasico";
import TestBackendMedio from "./interfaces/TestBackendMedio";
import TestBackendCompleto from "./interfaces/TestBackendCompleto";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MenuRoles />} />
      <Route path="/login-usuario" element={<LoginUsuario />} />
      <Route path="/login-admin" element={<LoginAdmin />} />
      <Route path="/roles" element={<MenuRoles />} />
      <Route path="/dash-admin" element={<DashBoardAdmin />} />
      <Route path="/dash-user" element={<DashBoardUser />} />
      <Route path="/test-backend-basico" element={<TestBackendBasico />} />
      <Route path="/test-backend-medio" element={<TestBackendMedio />} />
      <Route path="/test-backend-completo" element={<TestBackendCompleto />} />
    </Routes>
  );
}

export default App;
