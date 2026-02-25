// src/interfaces/MenuRoles.jsx
import { useNavigate } from "react-router-dom";
import "../estilos/MenuRoles.css";
import logoProyecto from "../assets/Logo.png";
import fondoProyecto from "../assets/fondo1.jpg";

export function MenuRoles() {
  const navigate = useNavigate();

  return (
    <div
      className="menu-container"
      style={{ backgroundImage: `url(${fondoProyecto})` }}
    >
      <div className="menu-card">
        <h1 className="menu-title">ArmatuXPC</h1>

       <div className="menu-logo-container">
          <img src={logoProyecto} alt="ArmatuXPC logo" className="menu-logo" />
       </div>

        <div className="menu-buttons">
          <button className="menu-btn" onClick={() => navigate("/login-user")}>
            Usuario
          </button>

          <button className="menu-btn" onClick={() => navigate("/login-admin")}>
            Administrador
          </button>
        </div>
      </div>
    </div>
  );
}

export default MenuRoles;