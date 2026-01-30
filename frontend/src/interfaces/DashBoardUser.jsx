import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../estilos/DashBoardUser.css";
import logoProyecto from "../imagenes/Logo.png"; // imagen del logo del proyecto

export default function UserHome() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const nombre = location.state?.nombre || "Usuario";

  return (
    <div className="dash-user-container">
      {/* HEADER */}
      <header className="dash-user-header">
      {/* BOTÓN MENÚ */}
      <button className="dash-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
        💻
      </button>

      {/* CENTRO */}
      <div className="dash-header-center">
        <img src={logoProyecto} alt="ArmatuXPC Logo" />
        <h1>ArmatuXPC</h1>
      </div>

      {/* ESPACIADOR */}
      <div className="dash-header-spacer"></div>
    </header>

      {/* MENU LATERAL */}
      <aside className={`dash-side-menu ${menuOpen ? "open" : ""}`}>
        <button onClick={() => {
          setMenuOpen(false);
          navigate("/nuevo-proyecto");
        }}>
          Nuevo proyecto
        </button>
        <button onClick={() => {
          setMenuOpen(false);
          navigate("/proyectos");
        }}>
          Proyectos existentes
        </button>

        <button onClick={() => {
          setMenuOpen(false);
          navigate("/comunidad");
        }}>
          Comunidad
        </button>

        <button
          className="logout"
          onClick={() => {
            setMenuOpen(false);
            navigate("/login-usuario");
          }}
        >
          Cerrar sesión
        </button>
      </aside>

      {menuOpen && <div className="dash-menu-overlay" onClick={() => setMenuOpen(false)} />}


      {/* CONTENIDO */}
      <main className="dash-cards-container">
        <h2>Bienvenido, {nombre} 👋</h2>

        <div className="dash-card">
          <h3>Último proyecto construido</h3>
          <p>Revisa tu última PC armada</p>
        </div>

        <div className="dash-card">
          <h3>Proyectos existentes</h3>
          <p>Consulta y edita tus armados</p>
        </div>

        <div className="dash-card">
          <h3>Comprar tokens</h3>
          <p>Desbloquea más proyectos</p>
        </div>
      </main>

      {/* BOTÓN IA */}
      <button className="dash-chatbot-btn">🤖</button>
    </div>
  );
}
