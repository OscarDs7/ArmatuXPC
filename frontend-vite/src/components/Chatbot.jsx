import { useState, useEffect, useRef} from "react";
import { enviarMensajeChatbot, 
        filtroComponente, 
        evaluarCompatibilidadTiempoReal,
        obtenerSugerenciasPorTipo } from "../services/api";
import Draggable from "react-draggable";
import ReactMarkdown from "react-markdown"; 

export default function Chatbot({ abierto, setAbierto }) {
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [chat, setChat] = useState([
    { tipo: "bot", texto: "Hola 👋 soy tu Asistente de ArmatuXPC. ¿Qué PC tienes en mente?" }
  ]);
  const scrollRef = useRef(null);
  // Ref opcional para evitar el modo estricto de React en consola
  const nodeRef = useRef(null);

  // Auto-scroll al recibir mensajes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat]);

  // Función para escribir texto con efecto de máquina de escribir
  const escribirTexto = async (texto, botId) => {
    for (let i = 0; i < texto.length; i++) {
      await new Promise(r => setTimeout(r, 8)); // velocidad

      setChat(prev =>
        prev.map(msg =>
          msg.id === botId
            ? { ...msg, texto: msg.texto + texto[i] }
            : msg
        )
      );
    }
  };

  // -- FUNCIÓN PRINCIPAL PARA ENVIAR MENSAJES EN STREAMING CON EL CHATBOT --
  const enviar = async (textoManual = null) => {
    const textoAEnviar = textoManual || mensaje;

    if (!textoAEnviar.trim()) return;

    setMensaje("");
    setCargando(true);

    const botId = Date.now();

    // 🔹 Agregar mensajes (usuario + bot vacío)
    setChat(prev => [
      ...prev,
      { tipo: "user", texto: textoAEnviar },
      { tipo: "bot", texto: "", id: botId }
    ]);

    const historial = chat.map(msg => ({
      rol: msg.tipo === "user" ? "user" : "assistant",
      contenido: msg.texto
    }));

    try {
      // Esperamos la respuesta completa del chatbot (con simulación de streaming)
      const data = await enviarMensajeChatbot(textoAEnviar, historial);

      // EFECTO TYPEWRITER (tipo ChatGPT)
      await escribirTexto(data.texto, botId);

      // 🔹 Agregar opciones al final
      if (data.opciones) {
        setChat(prev =>
          prev.map(msg =>
            msg.id === botId
              ? { ...msg, opciones: data.opciones }
              : msg
          )
        );
      }

    } catch (error) {
      console.error(error);

      setChat(prev =>
        prev.map(msg =>
          msg.id === botId
            ? { ...msg, texto: "Error al generar respuesta ⚠️" }
            : msg
        )
      );

    } finally {
      setCargando(false);
    }
  }; // -- FIN FUNCIÓN PRINCIPAL --

  // Si el chatbot no está abierto, no renderizamos nada
  if (!abierto) return null;

  return (
    // 2. Envolver con Draggable y usar el header como 'handle'
    <Draggable 
        handle=".chatbot-header" 
        nodeRef={nodeRef}
        defaultPosition={{x: 0, y: 0}}
    >
      <div 
        ref={nodeRef}
        // Quitamos las clases 'bottom-24 right-5' para que no pelee con el movimiento
        className="fixed z-50 w-85 h-125 bg-white rounded-xl shadow-2xl flex flex-col border border-gray-200 cursor-default"
        style={{ bottom: '100px', right: '20px' }} // Posición inicial
      >
        
        {/* 3. Header con clase 'chatbot-header' para arrastrar */}
        <div className="chatbot-header bg-blue-700 text-white p-3 rounded-t-xl flex justify-between items-center font-bold cursor-move">
          <span>🖥️ ArmatuXPC Assistant</span>
          <button 
            onClick={() => setAbierto(false)} 
            className="hover:text-red-300 cursor-pointer"
          >
            ✖
          </button>
        </div>

        {/* Cuerpo (Igual) */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {chat.map((msg, i) => (
            <div key={i} className={`flex ${msg.tipo === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] px-4 py-2 rounded-2xl shadow-sm ${
                msg.tipo === "user" ? "bg-blue-600 text-white rounded-br-none" : "bg-white text-gray-800 border rounded-bl-none"
              }`}>
                {/* Usamos ReactMarkdown para renderizar el texto con formato Markdown */}
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2">{children}</p>,
                      li: ({ children }) => <li className="ml-4 list-disc">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>
                    }}
                  >
                    {msg.texto}
                  </ReactMarkdown>
                </div>
                {msg.opciones && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {msg.opciones.map(opt => (
                      <button 
                        key={opt}
                        onClick={() => enviar(opt)}
                        className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs hover:bg-blue-700 hover:text-white"
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

        {/* Input (Igual) */}
        <div className="p-3 border-t bg-white rounded-b-xl flex gap-2">
          <input
            placeholder="Escribe tu duda..."
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && enviar()}
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none"
          />
          <button onClick={() => enviar()} className="bg-blue-700 text-white w-10 h-10 rounded-full flex items-center justify-center">
            ✈️
          </button>
        </div>
      </div>
    </Draggable>
  );  
}