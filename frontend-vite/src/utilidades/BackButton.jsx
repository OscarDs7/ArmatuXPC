import React from "react";
import { useNavigate } from "react-router-dom";
import "../estilos/BackButton.css"; // Puedes cambiar la ubicación si usas otra ruta

const BackButton = ({ to = "/roles", label = "Regresar" }) => {
  const navigate = useNavigate();

  return (
    <button className="back-button" onClick={() => navigate(to)}>
      ⟵ {label}
    </button>
  );
};

export default BackButton;
