import React from "react";
import { useLocation } from "react-router-dom";

export default function CheckAdmin() {
  const location = useLocation();
  const nombre = location.state?.nombre || "Administrador";

  return (
    <div style={{ padding: "20px" }}>
      <h1>Bienvenido!</h1>
      <h2>{nombre}, has iniciado sesión correctamente ✔️</h2>
    </div>
  );
}