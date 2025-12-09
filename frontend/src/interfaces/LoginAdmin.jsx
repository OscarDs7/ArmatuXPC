import React, { useState } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../utilidades/firebase";
import logoAdmin from "../imagenes/LogoAdmin.png"; // imagen del logo del proyecto
import fondoProyecto from "../imagenes/fondo1.jpg"; // imagen de fondo del proyecto
import BackButton from "../utilidades/BackButton"; // Botón para regresar al menú de roles
import "../estilos/LoginAdmin.css";
import { useNavigate } from "react-router-dom";

export default function LoginAdmin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Bienvenido Administrador!");
      navigate("/check-admin", { state: { nombre: "Administrador" } });
    } catch (err) {
      console.error(err);
      setError("Correo o contraseña incorrectos.");
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setResetMessage("Por favor ingresa tu correo para recuperar la contraseña.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage("Se ha enviado un enlace de recuperación a tu correo.");
    } catch (err) {
      console.error(err);
      setResetMessage("Error al enviar el correo. Verifica que sea válido.");
    }
  };

  return (
    <div className="login-container" style={{ backgroundImage: `url(${fondoProyecto})`, }}>
      <BackButton to="/roles" label="Regresar" />

      <div className="login-card">
        <h2>Login Administrador</h2>

        {/* LOGO DEL ADMIN*/}
        <img src={logoAdmin} alt="Logo de Admin" className="logo-admin" />

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Ingresar</button>
        </form>

        {/* Enlace de recuperación */}
        <p className="forgot-password" onClick={handlePasswordReset}>
          ¿Olvidaste tu contraseña?
        </p>

        {error && <p className="error-message">{error}</p>}
        {resetMessage && <p className="reset-message">{resetMessage}</p>}
      </div>
    </div>
  );
}
