import { useState } from "react";
import { useNavigate } from "react-router-dom";
// Cambiamos comprarTokens por iniciarSesionPago
import { iniciarSesionPago } from "../services/api"; 
import "../estilos/ComprarTokens.css";

export default function ComprarTokens() {
  const navigate = useNavigate();
  const uid = localStorage.getItem("userUid");
  const [cargando, setCargando] = useState(false);

  const paquetes = [
    { id: 1, nombre: "Básico", tokens: 3, precioTexto: "$49 MXN", precioValor: 49.00, color: "#3498db" },
    { id: 2, nombre: "Pro", tokens: 10, precioTexto: "$129 MXN", precioValor: 129.00, color: "#9b59b6" },
    { id: 3, nombre: "Avanzado", tokens: 30, precioTexto: "$199 MXN", precioValor: 199.00, color: "#e67e22" },
    { id: 4, nombre: "Ultimate", tokens: 50, precioTexto: "$249 MXN", precioValor: 249.00, color: "#2ecc71" },
    { id: 5, nombre: "Ilimitado (Mes)", tokens: 100, precioTexto: "$299 MXN", precioValor: 299.00, color: "#f1c40f" }
  ];

  const handleCompra = async (paquete) => {
    if (!uid) {
        alert("Debes iniciar sesión para comprar tokens.");
        return;
    }

    try {
      setCargando(true);
      
      // 1. Llamamos a la API para crear la sesión de Stripe
      const data = await iniciarSesionPago(uid, paquete.tokens, paquete.precioValor);
      
      // 2. Redirigimos al usuario fuera de nuestra app hacia el Checkout de Stripe
      // window.location.href es necesario porque es una URL externa
      if (data && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No se recibió la URL de pago.");
      }

    } catch (err) {
      alert("Error al conectar con Stripe: " + err.message);
      setCargando(false);
    }
  };

  return (
    <div className="compra-container">
      <button className="btn-volver" onClick={() => navigate("/dashboard-user")} disabled={cargando}>
        ← Volver
      </button>
      
      <h2 className="title">Aumenta tu capacidad de Armado 🚀</h2>
      
      {cargando && <p className="mensaje-carga">Conectando con Stripe segura... 🔒</p>}

      <div className={`paquetes-grid ${cargando ? "desactivado" : ""}`}>
        {paquetes.map((p) => (
          <div key={p.id} className="paquete-card" style={{ borderTop: `6px solid ${p.color}` }}>
            <h3>{p.nombre}</h3>
            <div className="token-circle">+{p.tokens}</div>
            <p className="precio">{p.precioTexto}</p>
            <button 
              className="btn-comprar" 
              onClick={() => handleCompra(p)}
              disabled={cargando}
            >
              {cargando ? "Procesando..." : "Seleccionar"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}