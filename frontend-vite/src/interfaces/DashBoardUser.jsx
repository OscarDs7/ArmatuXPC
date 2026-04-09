import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../estilos/DashBoardUser.css";
import logoProyecto from "../assets/Logo.png"; 
import { signOut } from "firebase/auth";
import { auth } from "../utilidades/firebase";

export default function DashBoardUser() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const nombre = location.state?.nombre || localStorage.getItem("userName") || "Usuario";

  // --- Funciones de Navegación con Estado ---
  const irANuevoProyecto = () => {
    setMenuOpen(false);
    navigate("/nuevo-proyecto", { state: { modo: "nuevo" } });
  };

  const irAContinuarProyecto = () => {
    setMenuOpen(false);

    // 1. Obtenemos el UID para saber qué borrador buscar
    const uid = localStorage.getItem("userUid");
    const STORAGE_KEY = `pc_borrador_${uid}`
    
    // 2. Buscamos el borrador específico de este usuario
    const hayGuardado = localStorage.getItem(STORAGE_KEY);

    if (hayGuardado) {
      navigate("/nuevo-proyecto", { state: { modo: "continuar" } });
    } else {
      alert("No tienes un proyecto pendiente. Iniciando uno nuevo...");
      navigate("/nuevo-proyecto", { state: { modo: "nuevo" } });
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-300 via-blue-400 to-blue-500 flex flex-col p-6">
      {/* HEADER */}
      <header className="dash-user-header">
        <div className="relative bg-blue-700 rounded-2xl">
          <button
            className="dash-menu-btn relative group"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            💻
            <span className="absolute hidden group-hover:block top-12 left-0 bg-blue-800 text-white text-xs px-2 py-1 rounded">
              Abrir menú lateral
            </span>
          </button>
        </div>

        <header className="relative w-full flex flex-col items-center py-4">
          <img 
            src={logoProyecto} 
            alt="ArmatuXPC Logo" 
            className="absolute top-4 right-6 w-20 h-20 rounded-3xl"
          />
          <h1 className="text-5xl font-bold text-blue-800 text-center">ArmatuXPC</h1>
          <p className="mt-2 text-center italic font-semibold text-white">
            Plataforma web para el correcto armado de computadoras de escritorio de manera personalizada.
          </p>
        </header>
        <div className="dash-header-spacer"></div>
      </header>

      {/* MENU LATERAL */}
      <aside className={`dash-side-menu ${menuOpen ? "open" : ""} flex flex-col justify-between h-full p-4`}>
        <div className="flex flex-col gap-5">
          {/* CAMBIO: Ahora llama a irANuevoProyecto */}
          <button onClick={irANuevoProyecto}>Nuevo proyecto</button>
          
          {/* CAMBIO: Añadimos opción de Continuar en el menú si lo deseas */}
          <button onClick={irAContinuarProyecto}>Continuar borrador</button>

          <button onClick={() => { setMenuOpen(false); navigate("/mis-armados"); }}>
            Proyectos existentes
          </button>
          <button onClick={() => { setMenuOpen(false); navigate("/comunidad"); }}>
            Comunidad
          </button>
          <button onClick={() => { setMenuOpen(false); navigate("/Indice"); }}>
            Guía Interactiva
          </button>
        </div>

        <button
          className="logout"
          onClick={() => {
            setMenuOpen(false);
            signOut(auth).then(() => {
              alert("Sesión cerrada correctamente");
              localStorage.removeItem("userUid");
              localStorage.removeItem("userName");
              localStorage.removeItem("tutorialVisto");
              navigate("/login-user");
            }).catch((error) => console.error(error));
          }}
        >
          Cerrar sesión 🚪
        </button>
      </aside>
      
      {menuOpen && <div className="dash-menu-overlay" onClick={() => setMenuOpen(false)} />}

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex flex-col items-center gap-6 mt-8">
        <h2 className="text-4xl font-semibold text-white">
          Bienvenido, {nombre} 👋
        </h2>

        {/* CARD: ÚLTIMO PROYECTO (CONTINUAR) */}
        <div 
          className="w-full max-w-3xl bg-linear-to-r from-blue-600 to-indigo-600 
                     text-white rounded-xl p-6 shadow-lg transition 
                     hover:scale-[1.02] hover:shadow-2xl cursor-pointer"
          onClick={irAContinuarProyecto}
        >
          <h3 className="text-lg font-bold">📂 Continuar último borrador</h3>
          <p>Retoma tu última configuración de armado guardado en este navegador</p>
        </div>

        {/* CARD: NUEVO PROYECTO */}
        <div 
          className="w-full max-w-3xl bg-linear-to-r from-green-500 to-teal-600 
                     text-white rounded-xl p-6 shadow-lg transition 
                     hover:scale-[1.02] hover:shadow-2xl cursor-pointer"
          onClick={irANuevoProyecto}
        >
          <h3 className="text-lg font-bold">✨ Crear nuevo proyecto</h3>
          <p>Empieza un armado de PC desde cero</p>
        </div>

        {/* OTRAS CARDS */}
        <div className="w-full max-w-3xl bg-linear-to-r from-blue-500 to-blue-600 
                        text-white rounded-xl p-6 shadow-lg transition 
                        hover:scale-[1.02] hover:shadow-2xl cursor-pointer"
             onClick={() => navigate("/mis-armados")}>
          <h3 className="text-lg font-bold">📚 Mis Armados Guardados</h3>
          <p>Consulta, edita y comparte tus proyectos finalizados en la nube</p>
        </div>

        <div className="w-full max-w-3xl bg-linear-to-r from-blue-500 to-blue-600 
                  text-white rounded-xl p-6 shadow-lg transition 
                  hover:scale-[1.02] hover:shadow-2xl cursor-pointer"
                  onClick={() => navigate("/comprar-tokens")}>
          <h3 className="text-lg font-bold">🪙 Comprar tokens</h3>
          <p>Desbloquea más espacios de armado para nuevos proyectos</p>
        </div>
      </main>

      {/* BOTÓN CHATBOT IA */}
      <button className="dash-chatbot-btn">🤖</button>
    </div>
  );
}