import { useState, useEffect, useRef} from "react";
import { enviarMensajeChatbot, 
        filtroComponente, 
        evaluarCompatibilidadTiempoReal,
        obtenerSugerenciasPorTipo } from "../services/api";

export default function Chatbot({ abierto, setAbierto }) {
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [chat, setChat] = useState([
    { tipo: "bot", texto: "Hola 👋 soy tu Asistente de ArmatuXPC. ¿Qué PC tienes en mente?" }
  ]);
  
  const scrollRef = useRef(null);

  // Auto-scroll al recibir mensajes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat]);

  const enviar = async (textoManual = null) => {
    const textoAenviar = textoManual || mensaje;
    if (!textoAenviar.trim() || cargando) return;

    setChat(prev => [...prev, { tipo: "user", texto: textoAenviar }]);
    setMensaje("");
    setCargando(true);

    try {
      // 1. Lógica de palabras clave (Intenciones)
      if (textoAenviar.toLowerCase().includes("armar una pc")) {
          const cpus = await filtroComponente("CPU");
          const nombresCpus = cpus.slice(0, 3).map(c => c.nombre); // Solo top 3
          setChat(prev => [...prev, { 
              tipo: "bot", 
              texto: "¡Excelente! Para empezar, elige una plataforma:",
              opciones: ["Intel", "AMD"] 
          }]);
      } 
      else {
          // 2. Fallback a la IA
          const data = await enviarMensajeChatbot(textoAenviar);
          setChat(prev => [...prev, { tipo: "bot", texto: data.texto }]);
      }
    } catch (error) {
      setChat(prev => [...prev, { tipo: "bot", texto: "Lo siento, tuve un problema técnico. 🔧" }]);
    } finally {
      setCargando(false);
    }
  };

  if (!abierto) return null;

  return (
    <div className="fixed bottom-24 right-5 w-85 h-[500px] bg-white rounded-xl shadow-2xl flex flex-col z-50 border border-gray-200">
      {/* Header */}
      <div className="bg-blue-700 text-white p-3 rounded-t-xl flex justify-between items-center font-bold">
        <span>🖥️ ArmatuXPC Assistant</span>
        <button onClick={() => setAbierto(false)} className="hover:text-gray-300">✖</button>
      </div>

      {/* Cuerpo del Chat */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {chat.map((msg, i) => (
          <div key={i} className={`flex ${msg.tipo === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] px-4 py-2 rounded-2xl shadow-sm ${
              msg.tipo === "user" ? "bg-blue-600 text-white rounded-br-none" : "bg-white text-gray-800 border rounded-bl-none"
            }`}>
              <p className="text-sm whitespace-pre-line">{msg.texto}</p>
              
              {/* Render de Opciones/Botones */}
              {msg.opciones && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {msg.opciones.map(opt => (
                    <button 
                      key={opt}
                      onClick={() => enviar(opt)}
                      className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs hover:bg-blue-700 hover:text-white transition-colors"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {cargando && (
          <div className="text-left">
            <span className="inline-block bg-gray-200 px-3 py-1 rounded-full text-xs animate-pulse">Escribiendo...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t bg-white rounded-b-xl flex gap-2">
        <input
          placeholder="Escribe tu duda..."
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && enviar()}
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
        />
        <button 
          onClick={() => enviar()} 
          disabled={cargando}
          className="bg-blue-700 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-800 disabled:bg-gray-400"
        >
          ✈️
        </button>
      </div>
    </div>
  );
}