import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../estilos/DashBoardUser.css";
import logoProyecto from "../assets/Logo.png"; 
import { signOut } from "firebase/auth";
import { auth } from "../utilidades/firebase";
import { motion } from "framer-motion";
import menu from "../assets/menu.png";
import heroImage from "../assets/hero-pc.jpg";
import heroImage1 from "../assets/armar-pc.jpg";
import heroImage2 from "../assets/componentes.jpg";
import heroImage3 from "../assets/configurador-PC.jpg";
import heroImage4 from "../assets/borrador-PC.jpg";
import heroImage5 from "../assets/armados-PCs.jpg";
import heroImage6 from "../assets/comunidad2.jpg";
import heroImage7 from "../assets/comprar-tokens.jpg";


export default function DashBoardUser({ setChatAbierto }) {
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

  // Configuración de animación reutilizable
  const fadeInVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white flex flex-col">
      
      {/* HEADER PRINCIPAL RESPONSIVE */}
      <header className="dash-user-header grid grid-cols-[80px_1fr_80px] lg:grid-cols-[120px_1fr_120px] xl:grid-cols-[150px_1fr_150px] items-center gap-4 bg-blue-950/80 backdrop-blur-md p-4 lg:p-8 rounded-2xl border border-white/20 shadow-2xl relative transition-all duration-300">
        
        {/* IZQUIERDA: Botón Menú (Escalable) */}
        <div className="flex items-center">
          <button
            className="relative group transition-all duration-300 hover:scale-110 flex items-center 
                      justify-center w-14 h-14 lg:w-24 lg:h-24 bg-blue-700/30 rounded-2xl 
                      border border-blue-400/20 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="text-2xl md:text-3xl lg:text-5xl xl:text-6xl">
              <img src={menu} alt="Armado de PC" />
            </span>
            
            {/* Tooltip del menú lateral */}
            <span className="absolute hidden lg:group-hover:block 
                  top-[110%] left-1/4 -translate-x-1/4
                  w-max bg-blue-600 text-white text-[10px] md:text-xs 
                  uppercase tracking-widest font-bold px-4 py-2 
                  rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.6)] z-100 
                  border border-blue-400/30 pointer-events-none 
                  transition-all duration-300">
                Abrir menú de navegación
            </span>
          </button>
        </div>

        {/* CENTRO: Título (Escalable) */}
        <div className="flex flex-col items-center text-center px-4">
          <h1 className="text-2xl md:text-2xl lg:text-6xl xl:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-300 drop-shadow-lg">
            ArmatuXPC
          </h1>
          <p className="hidden sm:block mt-3 text-[10px] md:text-sm lg:text-base 
                        xl:text-lg text-blue-200/70 italic max-w-xs md:max-w-md 
                        lg:max-w-2xl leading-relaxed">
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
                      transition-all duration-300 group-hover:scale-110"
          />
          {/* Tooltip del Logo */}
          <span className="absolute hidden lg:group-hover:block 
                top-[110%] left-1/2 -translate-x-1/2 
                w-max bg-blue-600 text-white text-[10px] md:text-xs 
                uppercase tracking-widest font-bold px-4 py-2 
                rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.6)] z-[100] 
                border border-blue-400/30 pointer-events-none 
                transition-all duration-300"
          >
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
          <button onClick={() => { setMenuOpen(false); navigate("/comprar-tokens"); }}>
            Comprar tokens
          </button>
          <button onClick={() => { setMenuOpen(false); navigate("/quienes-somos"); }}>
            Quiénes somos
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

      {/* CONTENIDO PRINCIPAL DE BIENVENIDA E INFO */}
      <main className="w-full bg-[#040427] text-white overflow-hidden flex-1">

        {/* --- CÍRCULOS DE LUZ --- */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          {/* Círculo Azul Superior Izquierda */}
          <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-blue-600/10 rounded-full blur-[120px]" />
          
          {/* Círculo Púrpura en el medio derecha */}
          <div className="absolute top-[40%] right-[-5%] w-100 h-100 bg-purple-600/10 rounded-full blur-[100px]" />
          
          {/* Círculo Cyan inferior izquierda */}
          <div className="absolute bottom-[10%] left-[5%] w-87.5 h-87.5 bg-cyan-500/10 rounded-full blur-[110px]" />
        </div>

        {/* HERO SECTION - ANCHO COMPLETO Y RESPONSIVE */}
        <section className="relative w-full h-[70vh] -mt-20 flex items-center justify-center text-center px-4">
          <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, repeat: Infinity, repeatType: "mirror" }}
            src={heroImage} 
            alt="Armado de PC" 
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-linear-to-b from-[#0a0a0c] via-transparent to-[#0a0a0c" />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative z-10 text-center px-4"
          >
            <h2 className="text-4xl md:text-6xl font-extralight text-blue-100/80 mb-4">
              Bienvenido, <span className="font-bold text-white block md:inline bg-clip-text bg-linear-to-r from-blue-400 to-purple-500">
                {nombre}
              </span> 👋
            </h2>
          </motion.div>
        </section>

        {/* CONTENIDO EN CONTENEDOR LIMITADO */}
        <div className="max-w-6xl mx-auto px-6 space-y-32 py-20">
          
          {/* SECCIÓN 1: ¿QUÉ ES? - QUIÉNES SOMOS (TEXTO IZQ - IMAGEN DER) */}
          <motion.section 
            variants={fadeInVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div className="space-y-6 p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl">
              <h2 className="text-4xl font-bold text-blue-400">¿Qué es ArmatuXPC?</h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                ArmatuXPC es una plataforma educativa diseñada para enseñar a los usuarios 
                a armar sus propias computadoras de escritorio paso a paso, de manera personalizada e interactiva.
              </p>
              <div className="flex justify-center">
                <button 
                  onClick={() => navigate("/quienes-somos")} 
                  className="px-6 py-3 bg-blue-500/30 border border-blue-400/50 text-white rounded-lg shadow-lg hover:bg-blue-500/50 transition-all justify-center flex items-center gap-2 cursor-pointer"
                >
                  Conocenos mejor
                </button>
              </div>
            </div>  
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="rounded-2xl overflow-hidden border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
              <img 
                src={heroImage1} 
                alt="Conocenos mejor" 
                className="w-full hover:scale-105 transition-transform duration-500"
               />
            </motion.div>
          </motion.section>

       {/* SECCIÓN 2: GUÍA INTERACTIVA 3D (IMAGEN IZQ - TEXTO DER) */}
        <motion.section 
          variants={fadeInVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 gap-12 items-center"
        >
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="order-2 md:order-1 rounded-2xl overflow-hidden border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.2)]">  
            <img 
              src={heroImage2} 
              alt="Guía Interactiva" className="w-full" />
          </motion.div>

          <div className="order-1 md:order-2 space-y-6 p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl">
            <h2 className="text-4xl font-bold text-purple-400">Aprende paso a paso</h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              Nuestra guía interactiva te permite comprender cada componente dentro de tu PC, su manera de instalarlo o desinstalarlo, y cómo se relaciona con el resto del sistema. ¡Aprende haciendo!
            </p>
            <div className="flex justify-center">
              <button 
                onClick={() => navigate("/Indice")} 
                className="px-6 py-3 bg-blue-500/30 border border-blue-400/50 text-white rounded-lg shadow-lg hover:bg-blue-500/50 transition-all justify-center flex items-center gap-2 cursor-pointer"
              >
                Ver guía interactiva
              </button>
            </div>
          </div>
        </motion.section>

          {/* SECCIÓN 3: CONFIGURADOR DE PC - NUEVO PROYECTO (TEXTO IZQ - IMAGEN DER) */}
          <motion.section
            variants={fadeInVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div className="space-y-6 p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl">
              <h2 className="text-4xl font-bold text-cyan-400">Configurador de PCs</h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                Arma tu propia PC personalizada en un entorno virtual, experimenta con diferentes configuraciones y recibe feedback instantáneo sobre compatibilidad y rendimiento.
              </p>
              <div className="flex justify-center">
                <button 
                  onClick={() => navigate("/nuevo-proyecto", { state: { modo: "nuevo" } })} 
                  className="px-6 py-3 bg-blue-500/30 border border-blue-400/50 text-white rounded-lg shadow-lg hover:bg-blue-500/50 transition-all justify-center flex items-center gap-2 cursor-pointer"
                >
                  Probar configurador
                </button>
              </div>
            </div>
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="rounded-2xl overflow-hidden border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
              <img src={heroImage3} alt="Configurador PC" className="w-full" />
            </motion.div>
          </motion.section>

          {/* SECCIÓN 4: BORRADOR DE PROYECTO (IMAGEN IZQ - TEXTO DER) */}
          <motion.section
            variants={fadeInVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="order-2 md:order-1 rounded-2xl overflow-hidden border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
              <img
                 src={heroImage4} 
                 alt="Borrador automático" 
                 className="w-full" />
            </motion.div>

            <div className="order-1 md:order-2 space-y-6 p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl">
              <h2 className="text-4xl font-bold text-green-400">Continuar Borrador</h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                Retoma tu último proyecto donde lo dejaste. Nuestra función de borrador automático guarda tu progreso para que puedas continuar armando tu PC personalizada en cualquier momento.
              </p>
              <div className="flex justify-center">
                <button 
                  onClick={() => navigate("/nuevo-proyecto", { state: { modo: "continuar" } })} 
                  className="px-6 py-3 bg-blue-500/30 border border-blue-400/50 text-white rounded-lg shadow-lg hover:bg-blue-500/50 transition-all justify-center flex items-center gap-2 cursor-pointer"
                >
                  Continuar mi proyecto
                </button>
              </div>

            </div>
          </motion.section>
        
          {/* SECCIÓN 5: PROYECTOS EXISTENTES (TEXTO IZQ - IMAGEN DER) */}
          <motion.section
            variants={fadeInVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div className="space-y-6 p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl">
              <h2 className="text-4xl font-bold text-yellow-400">Ve tus armados</h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                Revisa y gestiona tus proyectos existentes, edita tus armados anteriores o publica tus configuraciones para que otros usuarios puedan inspirarse en ellas. ¡Comparte tu creatividad con la comunidad!
              </p>
              <div className="flex justify-center">
                <button 
                  onClick={() => navigate("/mis-armados")} 
                  className="px-6 py-3 bg-blue-500/30 border border-blue-400/50 text-white rounded-lg shadow-lg hover:bg-blue-500/50 transition-all justify-center flex items-center gap-2 cursor-pointer"
                >
                  Ver proyectos existentes
                </button>
              </div>
            </div>
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="rounded-2xl overflow-hidden border border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
              <img src={heroImage5} alt="Proyectos Existentes" className="w-full" />
            </motion.div>
          </motion.section>

          {/* SECCIÓN 6: COMUNIDAD (IMAGEN IZQ - TEXTO DER) */}
          <motion.section
            variants={fadeInVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="order-2 md:order-1 rounded-2xl overflow-hidden border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
              <img
                 src={heroImage6} 
                 alt="Comunidad" 
                 className="w-full" />
            </motion.div>

            <div className="order-1 md:order-2 space-y-6 p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl">
              <h2 className="text-4xl font-bold text-green-400">Comunidad</h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                Comparte tus configuraciones, inspírate con los armados de otros usuarios y crea tu PC ideal. Nuestra comunidad es el lugar perfecto para aprender, compartir y crecer como entusiasta del armado de PCs.
              </p>
              <div className="flex justify-center">
                <button 
                  onClick={() => navigate("/comunidad")} 
                  className="px-6 py-3 bg-blue-500/30 border border-blue-400/50 text-white rounded-lg shadow-lg hover:bg-blue-500/50 transition-all justify-center flex items-center gap-2 cursor-pointer"
                >
                  Explorar comunidad
                </button>
              </div>

            </div>
          </motion.section>

          {/* SECCIÓN 7: COMPRA DE TOKENS (TEXTO IZQ - IMAGEN DER) */}
          <motion.section
            variants={fadeInVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div className="space-y-6 p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl">
              <h2 className="text-4xl font-bold text-yellow-400">Compra de Tokens</h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                Adquiere tokens para desbloquear más espacios de armado para nuevas configuraciones y proyectos adicionales. Personaliza tu experiencia y lleva tu creatividad al siguiente nivel con nuestros planes de tokens flexibles.
              </p>
              <div className="flex justify-center">
                <button 
                  onClick={() => navigate("/comprar-tokens")} 
                  className="px-6 py-3 bg-blue-500/30 border border-blue-400/50 text-white rounded-lg shadow-lg hover:bg-blue-500/50 transition-all justify-center flex items-center gap-2 cursor-pointer"
                >
                  Ver planes de tokens
                </button>
              </div>
            </div>
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="rounded-2xl overflow-hidden border border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
              <img src={heroImage7} alt="Comprar Tokens" className="w-full" />
            </motion.div>
          </motion.section>

        </div>
      </main>

      {/* BOTÓN CHATBOT IA */}
      <button 
        className="dash-chatbot-btn"
        onClick={() => setChatAbierto(true)}
      >
        🤖
      </button>
    </div>
  );
}