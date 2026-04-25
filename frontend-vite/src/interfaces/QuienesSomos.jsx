import React from "react";
import { useNavigate } from "react-router-dom";
import "../estilos/QuienesSomos.css";
import oscar from "../assets/integrantes/oscar.jfif";
import eduardo from "../assets/integrantes/yayo.jpeg";
import bryan from "../assets/integrantes/bryan.jpeg";
import diego from "../assets/integrantes/diego.jpeg";

export default function QuienesSomos() {

  const navigate = useNavigate();

const crearIntegrante = (nombre, rol, correo, imagen) => ({ nombre, rol, correo, imagen });

const integrantes = [
  crearIntegrante("Oscar Romero",  "Database Manager", "oeromero@email.com",    oscar),
  crearIntegrante("Eduardo Medina",  "Backend Dev",  "ermdeina@email.com",   eduardo),
  crearIntegrante("Bryan Soto", "AI Dev",  "bnsoto@email.com",  bryan),
  crearIntegrante("Diego Corona", "Frontend Dev",        "djcorona@email.com", diego),
];

  return (
    <div className="quienesSomos-container">

      {/* HEADER */}
      <header className="quienesSomos-header">
        <button onClick={() => navigate("/dashboard-user")}>
          ← Volver
        </button>
        <h1>Quiénes somos</h1>
      </header>

      {/* INTRO */}
      <section className="quienesSomos-intro">
        <p>
          Somos un equipo de estudiantes de ingeniería desarrollando como proyecto una 
          plataforma educativa para enseñar a armar computadoras PCs de manera interactiva.
        </p>
      </section>

      {/* TARJETAS */}
      <section className="quienesSomos-grid">

        {integrantes.map((persona, index) => (
          <div key={index} className="integrante-card">

            <img src={persona.imagen} alt={persona.nombre} />

            <h3>{persona.nombre}</h3>
            <p>{persona.rol}</p>
            <p>{persona.correo}</p>

          </div>
        ))}

      </section>

      {/* CONTACTO GENERAL */}
      <footer className="quienesSomos-footer">
        <p>Contacto</p>
      </footer>

    </div>
  );
}