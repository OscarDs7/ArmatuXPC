import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Estilos en línea para simplicidad
const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #1f2933, #0f172a)",
    color: "#fff",
    padding: "30px",
    textAlign: "center",
  },
  title: {
    fontSize: "36px",
    marginBottom: "5px",
  },
  subtitle: {
    fontSize: "20px",
    marginBottom: "30px",
    opacity: 0.9,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
    maxWidth: "900px",
    margin: "0 auto",
  },
  card: {
    background: "#1e293b",
    borderRadius: "15px",
    padding: "25px",
    cursor: "pointer",
    boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
    transition: "transform 0.2s, box-shadow 0.2s",
    hover: {
      transform: "translateY(-5px)",
      boxShadow: "0 15px 30px rgba(245, 243, 243, 0.95)",
      color: "#fff",
    },
  },
  icon: {
    fontSize: "40px",
    marginBottom: "15px",
  },
  button: {
    marginTop: "40px",
    padding: "12px 30px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    background: "#0ea5e9",
    color: "#fff",
  },
};

// Componente principal
export default function DashBoardAdmin() {
  const location = useLocation();
  const navigate = useNavigate();
  const nombre = location.state?.nombre || "Usuario";

  const cards = [
    { title: "Gestión de cuentas", icon: "⚙️" },
    { title: "Gestión de Catálogo", icon: "📦" },
    { title: "Monitoreo y logística", icon: "📊" },
    { title: "Métricas y reportes", icon: "📈" },
  ];

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Inicio Administrador</h1>
      <p style={styles.subtitle}>
        Bienvenido <strong>{nombre}</strong>, has iniciado sesión ✔️
      </p>

      <div style={styles.grid}>
        {cards.map((card, index) => (
          <div key={index} style={styles.card}>
            <div style={styles.icon}>{card.icon}</div>
            <h3>{card.title}</h3>
          </div>
        ))}
      </div>

      <button style={styles.button} onClick={() => navigate(-1)}>
        Regresar
      </button>
    </div>
  );
}
