import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Briefcase, ArrowLeft, Info } from "lucide-react"; // Asumiendo que usas lucide-react, si no, usa emojis
import oscar from "../assets/integrantes/Oscar.jpg";
import eduardo from "../assets/integrantes/yayo.jpeg";
import bryan from "../assets/integrantes/bryan.jpeg";
import diego from "../assets/integrantes/diego.jpeg";

export default function QuienesSomos() {
  const navigate = useNavigate();
  const [flippedIndex, setFlippedIndex] = useState(null); // Para controlar qué tarjeta está volteada

  const integrantes = [
    { 
      nombre: "Oscar Romero", 
      rol: "Project Manager/Full Stack Developer",
      correo: "a22110112@ceti.mx", 
      imagen: oscar,
      descripcion: "Líder del proyecto y encargado del desarrollo backend de la lógica del negocio, asegurando la arquitectura sólida y eficiente de la plataforma para brindar una experiencia fluida a los usuarios."
    },
    { 
      nombre: "Eduardo Medina", 
      rol: "Modelado 3D", 
      correo: "a22310398@ceti.mx",
      imagen: eduardo,
      descripcion: "Responsable del modelado 3D de los componentes de computadora, creando una guía interactiva y visual para saber cómo instalar o desinstalar cada componente de la computadora."
      },
      { 
        nombre: "Bryan Soto", 
        rol: "Inteligencia Artificial",
        correo: "a22310373@ceti.mx",
        imagen: bryan,
        descripcion: "Encargado de desarrollar el chatbot de la plataforma, utilizando inteligencia artificial para proporcionar asistencia personalizada a los usuarios en tiempo real."
      },
      { 
        nombre: "Diego Corona", 
        rol: "Frontend",
        correo: "a22310368@ceti.mx", 
        imagen: diego, 
        descripcion: "Responsable del diseño y desarrollo del frontend de la plataforma, creando una interfaz atractiva, intuitiva y fácil de usar para garantizar una experiencia de usuario excepcional."
      },
  ];

  // Función para manejar el contacto por correo
  const handleContacto = () => {
      const email = "armatuxpc26@gmail.com"; // Tu correo de soporte
      const subject = "Consulta - Proyecto ArmatuXPC";
      const body = "Hola equipo de ArmatuXPC, me gustaría obtener más información sobre...";
      
      // Abrir el cliente de correo predeterminado con un nuevo mensaje prellenado utilizando mailto o Gmail
      const urlGmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(urlGmail, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8">
      
      {/* HEADER REUTILIZADO */}
      <header className="max-w-7xl mx-auto bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-2xl flex items-center justify-between mb-12">
        <button 
          onClick={() => navigate("/dashboard-user")}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
        >
          <ArrowLeft size={18} /> Volver
        </button>
        <h1 className="text-3xl font-black bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-cyan-300">
          ArmatuXPC Team
        </h1>
        <div className="hidden md:block w-20"></div>
      </header>

      {/* INTRO SECTION */}
      <section className="max-w-3xl mx-auto text-center my-16 animate-fade-in">
        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">¿Quiénes somos?</h2>
        <div className="h-1.5 w-24 bg-linear-to-r from-blue-500 to-cyan-400 mx-auto rounded-full mb-8"></div>
        <p className="text-slate-400 text-lg leading-relaxed italic">
          Somos un equipo de estudiantes del CETI de la carrera <strong>desarrollo de software</strong> nivel ingeniería desarrollando una plataforma educativa para transformar el aprendizaje técnico en una experiencia interactiva y visual.
        </p>
      </section>

      {/* GRID DE TARJETAS CON EFECTO VOLTEO */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
        {integrantes.map((persona, index) => (
          <div 
            key={index}
            className="group h-105 [perspective:1000px] cursor-pointer"
            onClick={() => setFlippedIndex(flippedIndex === index ? null : index)}
          >
            <div className={`relative h-full w-full rounded-4xl transition-all duration-700 [transform-style:preserve-3d] ${flippedIndex === index ? '[transform:rotateY(180deg)]' : ''}`}>
              
              {/* CARA FRONTAL */}
              <div className="absolute inset-0 h-full w-full bg-slate-900/40 backdrop-blur-md border border-white/5 p-8 rounded-4xl flex flex-col items-center [backface-visibility:hidden]">
                <div className="relative mb-6">
                  <img src={persona.imagen} className="w-32 h-32 rounded-full object-cover border-4 border-slate-900 shadow-xl" alt={persona.nombre} />
                  <div className="absolute -bottom-2 -right-2 bg-cyan-500 p-1.5 rounded-full text-slate-900 shadow-lg animate-pulse">
                    <Info size={16} />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 text-center">{persona.nombre}</h3>
                <div className="flex items-center gap-2 text-cyan-400 text-sm mb-4">
                  <Briefcase size={14} />
                  <span className="font-medium uppercase tracking-wider">{persona.rol}</span>
                </div>
                <p className="mt-auto text-slate-500 text-[10px] uppercase tracking-widest font-bold">Click para detalles</p>
              </div>

              {/* CARA TRASERA */}
              <div className="absolute inset-0 h-full w-full bg-linear-to-br from-blue-900 to-slate-900 border border-cyan-500/30 p-8 rounded-[2rem] [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col justify-center items-center text-center">
                <div className="bg-cyan-500/20 p-3 rounded-full mb-4 text-cyan-300">
                  <Briefcase size={24} />
                </div>
                <h4 className="text-lg font-bold text-cyan-300 mb-4">Mi labor</h4>
                <p className="text-slate-200 text-sm leading-relaxed antialiased">
                  {persona.descripcion}
                </p>
                <div className="mt-6 flex items-center gap-2 text-slate-400 text-[11px] bg-black/30 px-3 py-1.5 rounded-full">
                  <Mail size={12} />
                  {persona.correo}
                </div>
              </div>

            </div>
          </div>
        ))}
      </section>
      <div className="h-16"></div>
      {/* FOOTER / CONTACTO */}
      <footer className="mt-auto max-w-7xl mx-auto w-full">
        <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 p-6 rounded-2xl text-center flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-slate-400 text-sm italic">© 2026 ArmatuXPC Team</span>
          <button 
            onClick={handleContacto}
            className="px-6 py-2 bg-linear-to-r from-blue-600 to-cyan-500 rounded-xl font-bold text-sm hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all active:scale-95 flex items-center gap-2"
           >
             Contactar al equipo
          </button>
        </div>
      </footer>

    </div>
  );
}