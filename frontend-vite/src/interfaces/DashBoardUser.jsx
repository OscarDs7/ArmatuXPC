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
    <div className="min-h-screen bg-linear-to-b from-[#0f172a] via-[#1e3a8a] to-[#0f172a] text-white flex flex-col p-6">
      {/* HEADER PRINCIPAL RESPONSIVE */}
      <header className="dash-user-header grid grid-cols-[80px_1fr_80px] lg:grid-cols-[120px_1fr_120px] xl:grid-cols-[150px_1fr_150px] items-center gap-4 bg-blue-950/80 backdrop-blur-md p-4 lg:p-8 rounded-2xl border border-white/20 shadow-2xl relative transition-all duration-300">
        
        {/* IZQUIERDA: Botón Menú (Escalable) */}
        <div className="flex justify-center items-center">
          <button
            className="dash-menu-btn relative group transition-all duration-300 hover:scale-110 flex items-center justify-center 
                      w-14 h-14 md:w-16 md:h-16 lg:w-24 lg:h-24 xl:w-28 xl:h-28 
                      bg-blue-700/40 rounded-xl lg:rounded-3xl border border-blue-400/30 
                      shadow-[0_0_15px_rgba(59,130,246,0.3)]"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="text-2xl md:text-3xl lg:text-5xl xl:text-6xl">💻</span>
            
            {/* Tooltip Adaptado */}
            <span className="absolute hidden lg:group-hover:block top-full mt-5 left-1/2 -translate-x-1/2 w-max bg-blue-600 text-white text-xs uppercase tracking-widest font-bold px-4 py-2 rounded-lg shadow-lg z-50 border border-blue-400/40">
              Abrir menú lateral
            </span>
          </button>
        </div>

        {/* CENTRO: Título (Escalable) */}
        <div className="flex flex-col items-center text-center px-4">
          <h1 className="text-2xl md:text-2xl lg:text-6xl xl:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-300 drop-shadow-lg">
            ArmatuXPC
          </h1>
          <p className="hidden sm:block mt-3 text-[10px] md:text-sm lg:text-base xl:text-lg text-blue-200/70 italic max-w-xs md:max-w-md lg:max-w-2xl leading-relaxed">
            Plataforma web para el correcto armado de computadoras de escritorio de manera personalizada.
          </p>
        </div>

        {/* DERECHA: Logo Proyecto con Tooltip */}
        <div className="relative group flex justify-center items-center">
          <img 
            src={logoProyecto} 
            alt="ArmatuXPC Logo" 
            className="w-14 h-14 md:w-16 md:h-16 lg:w-24 lg:h-24 xl:w-28 xl:h-28 
                      object-contain rounded-xl lg:rounded-3xl border border-blue-400/30 
                      shadow-[0_0_20px_rgba(59,130,246,0.5)] bg-white/5 p-2 
                      transition-all duration-300 group-hover:scale-110 cursor-help"
          />
          
          {/* Tooltip del Logo */}
          <span className="absolute hidden lg:group-hover:block top-full mt-5 left-1/2 -translate-x-1/2 w-max 
                          bg-blue-600 text-white text-[10px] md:text-xs uppercase tracking-widest font-bold 
                          px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.4)] z-50 
                          border border-blue-400/40 pointer-events-none transition-opacity duration-300">
            Logo oficial de ArmatuXPC
          </span>
        </div>
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
          Cerrar sesión
        </button>
      </aside>
      
      {menuOpen && <div className="dash-menu-overlay" onClick={() => setMenuOpen(false)} />}

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex flex-col items-center gap-6 mt-12 w-full max-w-4xl mx-auto">
        <h2 className="text-3xl font-light text-blue-100 text-center ml-4">
          Bienvenido, <span className="font-bold text-white">{nombre}</span> 👋
        </h2>

        {/* CARDS ESTILO DARK/NEON */}
        {[
          { title: "📂 Continuar último borrador", desc: "Retoma tu última configuración guardada.", action: irAContinuarProyecto },
          { title: "✨ Crear nuevo proyecto", desc: "Empieza un armado de PC desde cero.", action: irANuevoProyecto },
          { title: "📚 Mis Armados Guardados", desc: "Consulta tus proyectos en la nube.", action: () => navigate("/mis-armados") },
          { title: "🪙 Comprar tokens", desc: "Desbloquea más espacios de armado.", action: () => navigate("/comprar-tokens") }
        ].map((card, i) => (
          <div 
            key={i}
            onClick={card.action}
            className={`w-full group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 cursor-pointer border border-blue-500/20 
              ${card.primary ? 'bg-blue-900/40' : 'bg-slate-900/60'} 
              hover:border-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]`}
          >
            {/* Efecto de brillo al pasar el mouse */}
            <div className="absolute inset-0 bg-linear-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <h3 className="text-xl font-bold text-blue-300 group-hover:text-blue-100 transition-colors">
              {card.title}
            </h3>
            <p className="text-slate-400 group-hover:text-slate-200">
              {card.desc}
            </p>
          </div>
        ))}

      </main>

      {/* BOTÓN CHATBOT IA */}
      <button className="dash-chatbot-btn">🤖</button>
    </div>
  );
}