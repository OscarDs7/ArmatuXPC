import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { confirmarPagoEnServidor } from "../services/api";
import "../estilos/PagoExitoso.css";

export default function PagoExitoso() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [mensaje, setMensaje] = useState("Confirmando tu pago...");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const uid = searchParams.get("uid");
    const tokens = searchParams.get("tokens");

    if (sessionId) {
      // Confirmamos con nuestro backend (confirmar-pago)
      fetch(confirmarPagoEnServidor(sessionId, uid, tokens))
        .then(res => {
          if (res.ok) {
            setStatus("success");
            setMensaje(`¡Pago verificado con éxito! ¡Acreditamos ${tokens} tokens a tu cuenta! y te redirigimos...`);
            setTimeout(() => navigate("/mis-armados"), 4000);
          } else {
            setStatus("error");
            setMensaje("No pudimos verificar tu pago automáticamente. Por favor, contacta al equipo de soporte.");
          }
        });
    }
  }, [searchParams, navigate]); // El array de dependencias incluye navigate para evitar warnings, aunque no cambia

return (
    <div className="pago-exitoso-full-page">
      <div className={`pago-card ${status}`}>
        <div className="icon-container">
          {status === "loading" && <div className="spinner"></div>}
          {status === "success" && <div className="check-icon">✓</div>}
          {status === "error" && <div className="error-icon">✕</div>}
        </div>
        
        <h2>{status === "success" ? "¡Gracias por tu compra!" : "Estado del Pago"}</h2>
        <p className="mensaje-texto">{mensaje}</p>
        
        {status === "success" && (
          <p className="redirect-text">Redirigiendo a tus proyectos en unos segundos...</p>
        )}
        
        {status === "error" && (
          <button onClick={() => navigate("/comprar-tokens")} className="btn-reintentar">
            Volver a intentar
          </button>
        )}
      </div>
    </div>
  );


}