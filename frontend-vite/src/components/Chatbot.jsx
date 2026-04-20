import { useState, useEffect, useRef } from "react";

export default function Chatbot({ abierto, setAbierto }) {
  const [mensaje, setMensaje] = useState("");

  const [chat, setChat] = useState([
    {
      tipo: "bot",
      texto: "Hola 👋 soy tu asistente de ArmaTuXPC",
      botones: ["Armar PC", "Último Armado"]
    }
  ]);

  // ✅ REF DENTRO DEL COMPONENTE
  const chatRef = useRef(null);

  // ✅ AUTO SCROLL AL RECIBIR MENSAJES
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop =
        chatRef.current.scrollHeight;
    }
  }, [chat]);

  // ✅ AUTO SCROLL AL ABRIR
  useEffect(() => {
    if (abierto && chatRef.current) {
      chatRef.current.scrollTop =
        chatRef.current.scrollHeight;
    }
  }, [abierto]);

  if (!abierto) return null;

  const enviar = async (textoManual = null) => {
    const textoUsuario = textoManual || mensaje;

    if (!textoUsuario.trim()) return;

    setChat((prev) => [
      ...prev,
      { tipo: "user", texto: textoUsuario }
    ]);

    setMensaje("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/chatbot",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            mensaje: textoUsuario
          })
        }
      );

      const data = await response.json();
      const r = data.respuesta || {};

      setChat((prev) => [
        ...prev,
        {
          tipo: "bot",
          texto:
            typeof r === "object"
              ? r.resumen || "Sin respuesta"
              : r,
          botones:
            typeof r === "object"
              ? r.botones || []
              : []
        }
      ]);
    } catch {
      setChat((prev) => [
        ...prev,
        {
          tipo: "bot",
          texto: "Error conectando con IA",
          botones: []
        }
      ]);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "90px",
        right: "20px",
        width: "340px",
        height: "470px",
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 0 15px rgba(0,0,0,.2)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* HEADER */}
      <div
        style={{
          background: "#2563eb",
          color: "white",
          padding: "10px",
          display: "flex",
          justifyContent: "space-between"
        }}
      >
        <span>ArmaTuXPC IA</span>

        <button
          onClick={() => setAbierto(false)}
          style={{
            background: "transparent",
            border: "none",
            color: "white",
            fontSize: "20px",
            cursor: "pointer"
          }}
        >
          ✖
        </button>
      </div>

      {/* CHAT */}
      <div
        ref={chatRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "10px",
          background: "#f5f5f5",
          scrollBehavior: "smooth"
        }}
      >
        {chat.map((msg, i) => (
          <div
            key={i}
            style={{
              textAlign:
                msg.tipo === "user"
                  ? "right"
                  : "left",
              marginBottom: "10px"
            }}
          >
            <div
              style={{
                display: "inline-block",
                background:
                  msg.tipo === "user"
                    ? "#2563eb"
                    : "#e5e7eb",
                color:
                  msg.tipo === "user"
                    ? "white"
                    : "black",
                padding: "10px",
                borderRadius: "12px",
                maxWidth: "85%",
                whiteSpace: "pre-line"
              }}
            >
              {msg.texto}
            </div>

            {/* BOTONES */}
            {msg.botones &&
              msg.botones.length > 0 && (
                <div
                  style={{
                    marginTop: "8px"
                  }}
                >
                  {msg.botones.map(
                    (btn, index) => (
                      <button
                        key={index}
                        onClick={() =>
                          enviar(btn)
                        }
                        style={{
                          margin: "3px",
                          padding:
                            "7px 12px",
                          borderRadius:
                            "8px",
                          border: "none",
                          background:
                            "#2563eb",
                          color: "white",
                          cursor:
                            "pointer",
                          fontSize:
                            "14px"
                        }}
                      >
                        {btn}
                      </button>
                    )
                  )}
                </div>
              )}
          </div>
        ))}
      </div>

      {/* INPUT */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          padding: "8px",
          borderTop:
            "1px solid #ddd"
        }}
      >
        <input
          value={mensaje}
          onChange={(e) =>
            setMensaje(
              e.target.value
            )
          }
          onKeyDown={(e) =>
            e.key === "Enter" &&
            enviar()
          }
          placeholder="Escribe aquí..."
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "8px",
            border:
              "1px solid #ccc"
          }}
        />

        <button
          onClick={() => enviar()}
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: "8px 12px",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}