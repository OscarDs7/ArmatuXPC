import { useNavigate } from "react-router-dom";
import { User, ShieldCheck } from "lucide-react"; // Opcional: iconos para dar contexto
import "../estilos/MenuRoles.css";
import logoProyecto from "../assets/Armatuxpc.png";
import fondoProyecto from "../assets/fondo1.jpg";

export function MenuRoles() {
  const navigate = useNavigate();

  return (
    <div className="menu-container" style={{ backgroundImage: `url(${fondoProyecto})` }}>
      <div className="overlay"></div> {/* Capa para oscurecer el fondo si es muy claro */}
      
      <div className="menu-card">
        <div className="menu-header">
          <img src={logoProyecto} alt="ArmatuXPC logo" className="menu-logo" />
          <h1 className="menu-title">ArmatuXPC</h1>
          <p className="menu-subtitle">Selecciona tu tipo de acceso</p>
        </div>

        <div className="menu-buttons">
          <button className="menu-btn user-btn" onClick={() => navigate("/login-user")}>
            <div className="btn-icon"><User size={24} /></div>
            <span>Acceso Usuario</span>
          </button>

          <button className="menu-btn admin-btn" onClick={() => navigate("/login-admin")}>
            <div className="btn-icon"><ShieldCheck size={24} /></div>
            <span>Administrador</span>
          </button>
        </div>
      </div>
    </div>
  );
}