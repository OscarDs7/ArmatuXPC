import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // 1. Autenticación
      const userCred = await signInWithEmailAndPassword(auth, email, password); // Iniciar sesión
      const uid = userCred.user.uid; // Obtener UID

      // 2. Buscar si es un usuario normal en Firestore
      const ref = collection(db, "Usuario");
      const q = query(ref, where("UID", "==", uid));
      const snap = await getDocs(q);

      // 1. Si existe → verificar rol y denegar acceso si es "user"
      if (!snap.empty) {
        const data = snap.docs[0].data();
        if (data.Rol === "user" && data.UID === uid) {
          setError("Acceso denegado: no tienes permisos de administrador.");
          return;
        }
      }
      // 2. Si no existe → asumir que es admin (ya que si no es user, debe ser admin)
      alert("Bienvenido Administrador!");
      navigate("/dashboard-admin", { state: { nombre: "Administrador" } });
      

    } catch (err) {
      console.error(err);
      setError("Correo o contraseña incorrectos.");
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

          <button type="submit">Ingresar</button>
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
