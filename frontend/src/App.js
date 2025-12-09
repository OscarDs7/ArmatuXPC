import { Routes, Route } from "react-router-dom";

import MenuRoles from "./interfaces/MenuRoles";
import LoginUsuario from "./interfaces/LoginUser";
import LoginAdmin from "./interfaces/LoginAdmin";
import CheckAdmin from "./interfaces/CheckAdmin";
import CheckUser from "./interfaces/CheckUser";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MenuRoles />} />
      <Route path="/login-usuario" element={<LoginUsuario />} />
      <Route path="/login-admin" element={<LoginAdmin />} />
      <Route path="/roles" element={<MenuRoles />} />
      <Route path="/check-admin" element={<CheckAdmin />} />
      <Route path="/check-user" element={<CheckUser />} />
    </Routes>
  );
}

export default App;
