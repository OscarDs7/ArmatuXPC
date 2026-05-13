import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

import {
  enviarMensajeChatbot,
  filtroComponente,
  evaluarCompatibilidadTiempoReal,
  obtenerSugerenciasPorTipo,
} from "../services/api";

import Draggable from "react-draggable";
import ReactMarkdown from "react-markdown";

export default function Chatbot({ abierto, setAbierto }) {

  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  // 🔥 NUEVO: minimizar chatbot
  const [minimizado, setMinimizado] = useState(false);

  const [chat, setChat] = useState([
    {
      tipo: "bot",
      texto:
        "Hola 👋 soy tu Asistente de ArmatuXPC.\n\n¿Que PC tienes en mente?",
    },
  ]);

  const scrollRef = useRef(null);
  const nodeRef = useRef(null);

  // Detectar cambio de ruta
  const location = useLocation();

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop =
        scrollRef.current.scrollHeight;
    }
  }, [chat]);

  // Cerrar chatbot al cambiar de página
  useEffect(() => {
    setAbierto(false);
  }, [location.pathname]);

  // Efecto escritura
  const escribirTexto = async (texto, botId) => {

    for (let i = 0; i < texto.length; i++) {

      await new Promise((r) =>
        setTimeout(r, 8)
      );

      setChat((prev) =>
        prev.map((msg) =>
          msg.id === botId
            ? {
                ...msg,
                texto: msg.texto + texto[i],
              }
            : msg
        )
      );
    }
  };

  // ENVIAR MENSAJE
  const enviar = async (textoManual = null) => {

    const textoAEnviar =
      textoManual || mensaje;

    if (!textoAEnviar.trim()) return;

    setMensaje("");
    setCargando(true);

    const botId = Date.now();

    setChat((prev) => [
      ...prev,
      {
        tipo: "user",
        texto: textoAEnviar,
      },
      {
        tipo: "bot",
        texto: "",
        id: botId,
      },
    ]);

    const historial = chat.map((msg) => ({
      rol:
        msg.tipo === "user"
          ? "user"
          : "assistant",
      contenido: msg.texto,
    }));

    try {

      const data =
        await enviarMensajeChatbot(
          textoAEnviar,
          historial
        );

      await escribirTexto(data.texto, botId);

      if (data.opciones) {

        setChat((prev) =>
          prev.map((msg) =>
            msg.id === botId
              ? {
                  ...msg,
                  opciones: data.opciones,
                }
              : msg
          )
        );
      }

    } catch (error) {

      console.error(error);

      setChat((prev) =>
        prev.map((msg) =>
          msg.id === botId
            ? {
                ...msg,
                texto:
                  "Error al generar respuesta ⚠️",
              }
            : msg
        )
      );

    } finally {
      setCargando(false);
    }
  };

  // Si está cerrado completamente
  if (!abierto) return null;

  return (
    <Draggable
      handle=".chatbot-header"
      nodeRef={nodeRef}
      defaultPosition={{ x: 0, y: 0 }}
    >

      <div
        ref={nodeRef}
        className="
          fixed z-50
          flex flex-col
          rounded-3xl
          overflow-hidden
          border
          border-blue-500/30
          backdrop-blur-xl
          bg-[#020617]
          shadow-[0_0_25px_rgba(59,130,246,0.35)]
          transition-all
          duration-300
        "
        style={{
          bottom: "100px",
          right: "20px",
          width: minimizado ? "280px" : "340px",
          height: minimizado ? "70px" : "520px",
        }}
      >

        {/* HEADER */}
        <div
          className="
            chatbot-header
            flex
            items-center
            justify-between
            px-4
            py-3
            cursor-move
            bg-gradient-to-r
            from-blue-700
            via-blue-600
            to-cyan-500
            text-white
            font-bold
            border-b
            border-blue-400/30
          "
        >

          <span className="tracking-wide">
            🖥️ ArmatuXPC IA
          </span>

          <div className="flex items-center gap-2">

            {/* Minimizar */}
            <button
              onClick={() =>
                setMinimizado(!minimizado)
              }
              className="
                text-white
                hover:text-cyan-300
                transition
                duration-200
                text-sm
                cursor-pointer
              "
            >
              {minimizado ? "🗖" : "🗕"}
            </button>

            {/* Cerrar */}
            <button
              onClick={() =>
                setAbierto(false)
              }
              className="
                text-white
                hover:text-red-300
                transition
                duration-200
                text-lg
                cursor-pointer
              "
            >
              ✕
            </button>

          </div>
        </div>

        {/* 🔥 CONTENIDO SOLO SI NO ESTÁ MINIMIZADO */}
        {!minimizado && (
          <>

            {/* MENSAJES */}
            <div
              ref={scrollRef}
              className="
                flex-1
                overflow-y-auto
                px-3
                py-4
                space-y-4
                bg-gradient-to-b
                from-[#0b1220]
                to-[#020617]
              "
            >

              {chat.map((msg, i) => (

                <div
                  key={i}
                  className={`flex ${
                    msg.tipo === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >

                  <div
                    className={`
                      max-w-[85%]
                      px-4
                      py-3
                      rounded-2xl
                      text-sm
                      leading-relaxed
                      shadow-lg
                      whitespace-pre-line
                      transition-all
                      duration-300

                      ${
                        msg.tipo === "user"
                          ? `
                            bg-gradient-to-r
                            from-blue-600
                            to-cyan-500
                            text-white
                            rounded-br-md
                            shadow-blue-500/30
                          `
                          : `
                            bg-[#111827]
                            text-gray-200
                            border
                            border-blue-500/20
                            rounded-bl-md
                            shadow-[0_0_10px_rgba(59,130,246,0.15)]
                          `
                      }
                    `}
                  >

                    <div className="prose prose-invert prose-sm max-w-none">

                      <ReactMarkdown
                        components={{
                          p: ({ children }) => (
                            <p className="mb-2">
                              {children}
                            </p>
                          ),

                          li: ({ children }) => (
                            <li className="ml-4 list-disc">
                              {children}
                            </li>
                          ),

                          strong: ({ children }) => (
                            <strong className="font-semibold text-cyan-300">
                              {children}
                            </strong>
                          ),
                        }}
                      >
                        {msg.texto}
                      </ReactMarkdown>

                    </div>

                    {/* BOTONES */}
                    {msg.opciones && (

                      <div className="flex flex-wrap gap-2 mt-4">

                        {msg.opciones.map((opt) => (

                          <button
                            key={opt}
                            onClick={() =>
                              enviar(opt)
                            }
                            className="
                              px-3
                              py-1.5
                              rounded-full
                              text-xs
                              font-medium
                              border
                              border-cyan-400/30
                              bg-cyan-500/10
                              text-cyan-300
                              hover:bg-cyan-500
                              hover:text-white
                              transition-all
                              duration-200
                              shadow-md
                            "
                          >
                            {opt}
                          </button>

                        ))}

                      </div>

                    )}

                  </div>

                </div>

              ))}

              {/* ESCRIBIENDO */}
              {cargando && (

                <div className="flex justify-start">

                  <span
                    className="
                      bg-[#111827]
                      border
                      border-blue-500/20
                      text-cyan-300
                      px-4
                      py-2
                      rounded-full
                      text-xs
                      animate-pulse
                    "
                  >
                    Escribiendo...
                  </span>

                </div>

              )}

            </div>

            {/* INPUT */}
            <div
              className="
                p-3
                border-t
                border-blue-500/20
                bg-[#020617]
                flex
                gap-2
              "
            >

              <input
                placeholder="Escribe aqui..."
                value={mensaje}
                onChange={(e) =>
                  setMensaje(e.target.value)
                }
                onKeyDown={(e) =>
                  e.key === "Enter" && enviar()
                }
                className="
                  flex-1
                  rounded-2xl
                  bg-[#0f172a]
                  border
                  border-blue-500/20
                  px-4
                  py-2
                  text-sm
                  text-white
                  outline-none
                  focus:border-cyan-400
                  focus:shadow-[0_0_10px_rgba(34,211,238,0.35)]
                  transition-all
                  duration-200
                "
              />

              <button
                onClick={() => enviar()}
                className="
                  w-11
                  h-11
                  rounded-2xl
                  bg-gradient-to-r
                  from-blue-600
                  to-cyan-500
                  text-white
                  flex
                  items-center
                  justify-center
                  hover:scale-105
                  transition-all
                  duration-200
                  shadow-[0_0_15px_rgba(59,130,246,0.45)]
                "
              >
                🚀
              </button>

            </div>

          </>
        )}

      </div>

    </Draggable>
  );
}