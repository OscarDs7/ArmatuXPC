import { Routes, Route } from "react-router-dom";

import MenuRoles from "./interfaces/MenuRoles";
import LoginUsuario from "./interfaces/LoginUser";
import LoginAdmin from "./interfaces/LoginAdmin";
import DashBoardAdmin from "./interfaces/DashBoardAdmin";
import DashBoardUser from "./interfaces/DashBoardUser";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MenuRoles />} />
      <Route path="/login-usuario" element={<LoginUsuario />} />
      <Route path="/login-admin" element={<LoginAdmin />} />
      <Route path="/roles" element={<MenuRoles />} />
      <Route path="/dash-admin" element={<DashBoardAdmin />} />
      <Route path="/dash-user" element={<DashBoardUser />} />
    </Routes>
  );
}

export default App;
