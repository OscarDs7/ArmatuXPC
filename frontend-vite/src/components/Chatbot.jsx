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
      </div>

    </div>
  );
}