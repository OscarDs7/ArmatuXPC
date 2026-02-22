// src/interfaces/MenuRoles.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "../estilos/MenuRoles.css"; // archivo de estilos externos
import logoProyecto from "../assets/Logo.png"; // imagen del logo del proyecto
import fondoProyecto from "../assets/fondo1.jpg"; // imagen de fondo del proyecto

// Componente MenuRoles
// Este componente muestra un menú con dos botones para navegar a las páginas de usuario y administrador
// Utiliza React Router para la navegación y estilos personalizados
export function MenuRoles() {
  const navigate = useNavigate();

  const goUsuario = () => {
    navigate("/login-usuario");
  };

  const goAdmin = () => {
    navigate("/login-admin");
  };

  return (
      <div  className="menu-container" style={{ backgroundImage: `url(${fondoProyecto})`, }} >
      <div className="menu-card">

        <h1 className="menu-title">ArmatuXPC</h1>

        {/* LOGO DEL PROYECTO */}
        <img src={logoProyecto} alt="ArmatuXPC logo" className="menu-logo" />

        <button className="menu-btn" onClick={goUsuario}>
          Usuario
        </button>

        <button className="menu-btn" onClick={goAdmin}>
          Administrador
        </button>

      </div>
    </div>
  );
};

export default MenuRoles;
