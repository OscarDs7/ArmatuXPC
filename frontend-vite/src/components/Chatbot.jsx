<<<<<<< HEAD
import { useState, useRef, useEffect } from "react";

function Chatbot({ abierto, setAbierto }) {

  const [mensaje, setMensaje] = useState("");
  const [mensajes, setMensajes] = useState([
    {
      tipo: "bot",
      texto: "Hola 👋 soy tu asistente de ArmatuXPC",
      botones: ["Armar PC", "Último Armado"]
    }
  ]);

  const [loading, setLoading] = useState(false);
  const mensajesRef = useRef(null);

  const API_URL = "http://127.0.0.1:8000/chatbot";

  // 🔽 SCROLL AUTO
  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
    }
  }, [mensajes, loading]);

  // 🔥 FORMATEAR TEXTO (SOLO BOT)
  const formatearTexto = (texto) => {
    if (!texto) return "";

    return texto
      .replace(/CPU:/g, "\n🧠 CPU:")
      .replace(/GPU:/g, "\n🎮 GPU:")
      .replace(/RAM:/g, "\n💾 RAM:")
      .replace(/Fuente:/g, "\n🔌 Fuente:")
      .replace(/Gabinete:/g, "\n🖥️ Gabinete:")
      .replace(/Almacenamiento:/g, "\n📦 Almacenamiento:")
      .replace(/Total estimado:/g, "\n💰 Total estimado:")
      .replace(/Consumo estimado:/g, "\n⚡ Consumo estimado:")
      .replace(/\n\s+/g, "\n");
  };

  // 🔥 ENVÍO REAL A BACKEND
  const enviarMensaje = async (texto) => {

    if (!texto || loading) return;

    setMensajes(prev => [...prev, { tipo: "user", texto }]);
    setMensaje("");
    setLoading(true);

    console.log("📡 Enviando a backend:", texto);

    try {

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensaje: texto,
          user_id: "anonimo"
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      const data = await res.json();

      console.log("✅ Respuesta backend:", data);

      if (!data || !data.respuesta) {
        throw new Error("Respuesta vacía");
      }

      setMensajes(prev => [
        ...prev,
        {
          tipo: "bot",
          texto: data.respuesta.resumen || "Sin respuesta",
          botones: data.respuesta.botones || []
        }
      ]);

    } catch (error) {

      console.error("❌ Error backend:", error);

      setMensajes(prev => [
        ...prev,
        {
          tipo: "bot",
          texto: "⚠️ Error conectando con IA"
        }
      ]);
    }

    setLoading(false);
  };

  // 🔥 BOTONES
  const manejarBoton = (accion) => {
    enviarMensaje(accion);
  };

  if (!abierto) return null;

  return (
    <div style={styles.chat}>

      <div style={styles.header}>
        ArmatuXPC IA
        <button onClick={() => setAbierto(false)}>✕</button>
      </div>

      <div style={styles.mensajes} ref={mensajesRef}>

        {mensajes.map((m, i) => (
          <div
            key={i}
            style={{
              ...styles.mensaje,
              ...(m.tipo === "user" ? styles.user : styles.bot)
            }}
          >

            <div style={styles.textoBot}>
              {m.tipo === "bot"
                ? formatearTexto(m.texto)
                : m.texto}
            </div>

            {m.botones && (
              <div style={styles.botones}>
                {m.botones.map((b, idx) => (
                  <button
                    key={idx}
                    style={styles.boton}
                    onClick={() => manejarBoton(b)}
                  >
                    {b}
                  </button>
                ))}
              </div>
            )}

          </div>
        ))}

        {loading && (
          <div style={styles.loading}>
            IA pensando...
          </div>
        )}

      </div>

      <div style={styles.inputArea}>
        <input
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          placeholder="Escribe aquí..."
          style={styles.input}
          onKeyDown={(e) => {
            if (e.key === "Enter") enviarMensaje(mensaje);
          }}
        />
        <button style={styles.enviar} onClick={() => enviarMensaje(mensaje)}>
          ➤
        </button>
=======
import { useState } from "react";

export default function Chatbot({ abierto, setAbierto }) {

  const [mensaje, setMensaje] = useState("");
  const [chat, setChat] = useState([
    { tipo: "bot", texto: "Hola 👋 soy tu Asistente de ArmatuXPC, listo para apoyarte!" }
  ]);
  function obtenerOpciones(texto) {

    const t = texto.toLowerCase();

    // 🔥 SOLO si es pregunta
    if (!t.includes("?")) return null;

    if (t.includes("amd") && t.includes("intel")) {
      return ["AMD", "Intel"];
    }

    if (t.includes("ram")) {
      return ["8GB", "16GB", "32GB"];
    }

    if (t.includes("si/no") || t.includes("sí/no")) {
      return ["Sí", "No"];
    }

    if (t.includes("almacenamiento")) {
      return ["512GB", "1TB"];
    }

    if (t.includes("fuente")) {
      return ["500W", "600W", "700W"];
    }

    return null;
  }

  // 🔴 Si no está abierto, no renderiza nada
  if (!abierto) return null;

  const enviar = async () => {

  if (!mensaje.trim()) return;

  const mensajeUsuario = mensaje;

  setChat(prev => [...prev, { tipo: "user", texto: mensajeUsuario }]);

  setMensaje("");

  // 🔥 ID único para el mensaje "Pensando"
  const idPensando = Date.now();

  setChat(prev => [
    ...prev,
    { tipo: "bot", texto: "Pensando...", id: idPensando }
  ]);

  try {
    const response = await fetch("http://localhost:8000/chatbot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ mensaje: mensajeUsuario })
    });

    const data = await response.json();

    // 🔥 ELIMINAR SOLO "Pensando..."
    setChat(prev => prev.filter(msg => msg.id !== idPensando));

    const r = data.respuesta || {};

    let texto = r.resumen || "Sin respuesta";

    if (r.componentes && Object.keys(r.componentes).length > 0) {
      const c = r.componentes;

      texto += `\n\nCPU: ${c.cpu || "No definido"}`;
      texto += `\nRAM: ${c.ram || "No definido"}`;
      texto += `\nGPU: ${c.gpu ?? "No incluida"}`;
      texto += `\nAlmacenamiento: ${c.almacenamiento || "No definido"}`;
      texto += `\nFuente: ${c.fuente || "No definido"}`;
    }

    setChat(prev => [...prev, { tipo: "bot", texto }]);

  } catch (error) {
    console.error(error);

    setChat(prev => prev.filter(msg => msg.id !== idPensando));

    setChat(prev => [
      ...prev,
      { tipo: "bot", texto: "Error al conectar con el servidor" }
    ]);
  }
};

  return (
    <div style={{
      position: "fixed",
      bottom: "90px",
      right: "20px",
      width: "320px",
      height: "420px",
      background: "white",
      borderRadius: "10px",
      boxShadow: "0 0 10px rgba(0,0,0,0.2)",
      display: "flex",
      flexDirection: "column",
      zIndex: 9999
    }}>

      {/* HEADER */}
      <div style={{
        background: "#1f6feb",
        color: "white",
        padding: "10px",
        display: "flex",
        justifyContent: "space-between"
      }}>
        <span>ArmatuXPC Assistant</span>
        <button
          onClick={() => setAbierto(false)}
          style={{
            background: "transparent",
            border: "none",
            color: "white",
            cursor: "pointer"
          }}
        >
          ✖
        </button>
      </div>

      {/* CHAT */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "10px"
      }}>
        {chat.map((msg, i) => {
  const opciones = msg.tipo === "bot" ? obtenerOpciones(msg.texto) : null;

  return (
    <div key={i} style={{
      textAlign: msg.tipo === "user" ? "right" : "left",
      marginBottom: "8px"
    }}>
      <div style={{
        background: msg.tipo === "user" ? "#1f6feb" : "#e4e7ec",
        color: msg.tipo === "user" ? "white" : "black",
        padding: "6px 10px",
        borderRadius: "8px",
        whiteSpace: "pre-line"
      }}>
        {msg.texto}
      </div>

      {/* 🔥 BOTONES */}
      {opciones && (
        <div style={{ marginTop: "5px" }}>
          {opciones.map((op, index) => (
            <button
              key={index}
              onClick={() => {
                setMensaje(op.toLowerCase());
                setTimeout(() => enviar(), 100);
              }}
              style={{
                margin: "3px",
                padding: "5px 10px",
                borderRadius: "6px",
                border: "none",
                background: "#1f6feb",
                color: "white",
                cursor: "pointer"
              }}
            >
              {op}
            </button>
          ))}
        </div>
      )}
    </div>
  );
})}
      </div>

      {/* INPUT */}
      <div style={{ display: "flex", padding: "5px" }}>
        <input
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && enviar()}
          style={{ flex: 1 }}
        />
        <button onClick={enviar}>Enviar</button>
>>>>>>> origin/main
      </div>

    </div>
  );
<<<<<<< HEAD
}

// 🎨 ESTILOS PRO
const styles = {
  chat: {
    position: "fixed",
    bottom: 20,
    right: 20,
    width: 340,
    height: 500,
    background: "linear-gradient(180deg, #0b1220, #020617)",
    borderRadius: 20,
    display: "flex",
    flexDirection: "column",
    border: "1px solid rgba(59,130,246,0.3)",
    boxShadow: `
      0 0 20px rgba(59,130,246,0.3),
      0 0 40px rgba(59,130,246,0.2),
      inset 0 0 10px rgba(59,130,246,0.1)
    `,
    backdropFilter: "blur(10px)"
  },

  header: {
    padding: 14,
    background: "linear-gradient(90deg,#2563eb,#38bdf8)",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    fontWeight: "bold"
  },

  mensajes: {
    flex: 1,
    padding: 12,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 10
  },

  mensaje: {
    padding: 10,
    borderRadius: 14,
    maxWidth: "85%"
  },

  bot: {
    background: "#1e293b",
    color: "#e2e8f0"
  },

  user: {
    background: "linear-gradient(135deg,#3b82f6,#60a5fa)",
    color: "white",
    alignSelf: "flex-end"
  },

  textoBot: {
    whiteSpace: "pre-line",
    lineHeight: 1.6
  },

  botones: {
    marginTop: 6,
    display: "flex",
    gap: 6,
    flexWrap: "wrap"
  },

  boton: {
    background: "linear-gradient(135deg,#3b82f6,#60a5fa)",
    border: "none",
    padding: "6px 10px",
    borderRadius: 10,
    color: "white",
    cursor: "pointer",
    boxShadow: "0 0 10px rgba(59,130,246,0.5)"
  },

  inputArea: {
    display: "flex",
    padding: 10,
    background: "#020617",
    borderTop: "1px solid rgba(59,130,246,0.2)",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20
  },

  input: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    border: "1px solid rgba(59,130,246,0.3)",
    background: "#020617",
    color: "white"
  },

  enviar: {
    marginLeft: 6,
    padding: "10px",
    borderRadius: 10,
    background: "#3b82f6",
    color: "white",
    border: "none"
  },

  loading: {
    color: "#38bdf8",
    fontStyle: "italic"
  }
};

export default Chatbot;
=======
}
>>>>>>> origin/main
