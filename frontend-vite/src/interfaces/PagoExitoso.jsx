import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { confirmarPagoEnServidor } from "../services/api";
//import "../estilos/PagoExitoso.css";

export default function PagoExitoso() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
            setMensaje("¡Pago verificado con éxito! Redirigiendo...");
            setTimeout(() => navigate("/mis-armados"), 3000);
          } else {
            setMensaje("Hubo un error al validar el pago.");
          }
        });
    }
  }, []);

  return (
    <div className="pago-exitoso-container">
       <h2>{mensaje}</h2>
       {/* Aquí podrías poner un spinner de carga */}
    </div>
  );
}