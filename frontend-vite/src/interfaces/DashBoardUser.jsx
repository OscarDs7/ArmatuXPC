import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../estilos/DashBoardUser.css";
import logoProyecto from "../assets/Logo.png"; // imagen del logo del proyecto
import { signOut } from "firebase/auth";
import { auth } from "../utilidades/firebase"; // Importa la autenticación de Firebase para cerrar sesión

export default function DashBoardUser() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const nombre = location.state?.nombre || localStorage.getItem("userName") || "Usuario";


  return (
    <div className="min-h-screen bg-linear-to-br from-blue-300 via-blue-400 to-blue-500 flex flex-col p-6">
      {/* HEADER */}
      <header className="dash-user-header">
      {/* BOTÓN MENÚ */}
      <div className="relative">
          <button
            className="dash-menu-btn relative group"
            onClick={() => {
              setMenuOpen(!menuOpen);
            }}
          >
            💻
          <span className="absolute hidden group-hover:block top-12 left-0 bg-blue-600 text-white text-xs px-2 py-1 rounded">
            Abrir menú lateral de opciones
          </span>

          </button>
        </div>

      {/* CENTRO */}
      {/* HEADER */}
      <header className="relative w-full flex flex-col items-center py-4">
        {/* Logo en la esquina superior derecha */}
        <img 
          src={logoProyecto} 
          alt="ArmatuXPC Logo" 
          className="absolute top-4 right-6 w-20 h-20 rounded-3xl"
        />

        {/* Título centrado */}
        <h1 className="text-5xl font-bold text-blue-800 text-center">
          ArmatuXPC
        </h1>

        {/* Descripción debajo del título */}
        <p className="mt-2 text-center italic font-semibold text-white">
          Plataforma web para el correcto armado de computadoras de escritorio (PCs) de manera personalizada.
        </p>
      </header>

      {/* ESPACIADOR */}
      <div className="dash-header-spacer"></div>
    </header>

      {/* MENU LATERAL */}
      <aside className={`dash-side-menu ${menuOpen ? "open" : ""} 
                 flex flex-col justify-between h-full p-4`}>
        <div className="flex flex-col gap-5">
          <button onClick={() => {
            setMenuOpen(false);
            navigate("/nuevo-proyecto");
          }}>
            Nuevo proyecto
          </button>
          <button onClick={() => {
            setMenuOpen(false);
            navigate("/mis-armados");
          }}>
            Proyectos existentes
          </button>

          <button onClick={() => {
            setMenuOpen(false);
            navigate("/comunidad");
          }}>
            Comunidad
          </button>

          <button onClick={() => {
            setMenuOpen(false);
            navigate("/Indice")
          }}>
            Guía Interactiva
          </button>
        </div>

        <button
          className="logout"
          onClick={() => {
            setMenuOpen(false);
              signOut(auth).then(() => {
                alert("Sesión cerrada correctamente");
                localStorage.clear() // limpiar datos de sesión de usuario
                navigate("/login-user"); // Redirige al menú de roles después de cerrar sesión
              } ).catch((error) => {
                console.error("Error al cerrar sesión:", error);
                alert("Error al cerrar sesión. Inténtalo de nuevo.");
              }); 
          }}
        >
          Cerrar sesión
        </button>
      </aside>

      {menuOpen && <div className="dash-menu-overlay" onClick={() => setMenuOpen(false)} />}


      {/* CONTENIDO */}
      <main className="flex flex-col items-center gap-6 mt-8">
        <h2 className="text-4xl font-semibold text-white">
          Bienvenido, {nombre} 👋
        </h2>

        <div className="w-full max-w-3xl bg-linear-to-r from-blue-500 to-blue-600 
                  text-white rounded-xl p-6 shadow-lg transition 
                  hover:scale-[1.02] hover:shadow-2xl">
          <h3 className="text-lg font-bold">Último proyecto construido</h3>
          <p>Revisa tu última PC armada</p>
        </div>

        <div className="w-full max-w-3xl bg-linear-to-r from-blue-500 to-blue-600 
                  text-white rounded-xl p-6 shadow-lg transition 
                  hover:scale-[1.02] hover:shadow-2xl">
          <h3 className="text-lg font-bold">Proyectos existentes</h3>
          <p>Consulta y edita tus armados</p>
        </div>

        <div className="w-full max-w-3xl bg-linear-to-r from-blue-500 to-blue-600 
                  text-white rounded-xl p-6 shadow-lg transition 
                  hover:scale-[1.02] hover:shadow-2xl">
          <h3 className="text-lg font-bold">Comprar tokens</h3>
          <p>Desbloquea más proyectos</p>
        </div>
      </main>

      {/* BOTÓN CHATBOT IA */}
      <button className="dash-chatbot-btn">🤖</button>
    </div>
  );
}
