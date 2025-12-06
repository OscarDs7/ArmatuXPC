import { Routes, Route } from "react-router-dom";

import MenuRoles from "./interfaces/MenuRoles";
import LoginUsuario from "./interfaces/LoginUser";
import LoginAdmin from "./interfaces/LoginAdmin";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MenuRoles />} />
      <Route path="/login-usuario" element={<LoginUsuario />} />
      <Route path="/login-admin" element={<LoginAdmin />} />
      <Route path="/roles" element={<MenuRoles />} />
    </Routes>
  );
}

export default App;
