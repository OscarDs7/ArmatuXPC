import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";
import {doc, getDoc} from "firebase/firestore";

import { auth, db } from "../utilidades/firebase";
import logoAdmin from "../assets/LogoAdmin.png";
import fondoProyecto from "../assets/fondo1.jpg";
import BackButton from "../utilidades/BackButton";
import "../estilos/Login.css";
import { useNavigate } from "react-router-dom";

export function LoginAdmin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();

      // 1. Login (Autenticación con Firebase Auth)
      const userCred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const user = userCred.user;

      // 🔥 2. VALIDAR CON CLAIMS (Autorización de acceso)
      const tokenResult = await user.getIdTokenResult();

      if (!tokenResult.claims.admin) {
        setError("No tienes permisos de administrador.");
        return;
      }

      // 🔥 3. (OPCIONAL) Obtener datos de Firestore
      let nombre = "Administrador";

      try {
        const userRef = doc(db, "Usuario", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          nombre = userSnap.data().Nombre;
        }
      } catch (err) {
        console.warn("Firestore no disponible, usando nombre genérico");
      }

      // 4. Acceso
      alert(`Bienvenido ${nombre} ✨`);
      navigate("/dashboard-admin", { state: { nombre } });

    } catch (err) {
      console.error(err);
      setError("Correo o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar el restablecimiento de contraseña
  const handlePasswordReset = async () => {
    if (!email) {
      setResetMessage("Ingresa tu correo para recuperar la contraseña.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage("Se ha enviado un enlace de recuperación.");
      alert("Por favor revisa tu bandeja de Spam para encontrar el correo de recuperación si no lo ves en tu bandeja de entrada.");
    } catch (err) {
      console.error(err);
      setResetMessage("Error al enviar el correo. Verifica tu correo.");
    }
  };

  // Renderizado del componente
  return (
    <div
      className="login-container"
      style={{ backgroundImage: `url(${fondoProyecto})` }}
    >
      <BackButton to="/" label="Regresar" className = "back-button" />

      <div className="login-card">
        <h2>Login Administrador</h2>

        <img src={logoAdmin} alt="Logo Admin" className="logo-admin" />

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete = "username"
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p className="forgot-password" onClick={handlePasswordReset}>
          ¿Olvidaste tu contraseña?
        </p>

        {error && <p className="error-message">{error}</p>}
        {resetMessage && <p className="reset-message">{resetMessage}</p>}
      </div>
    </div>
  );
};

export default LoginAdmin;
