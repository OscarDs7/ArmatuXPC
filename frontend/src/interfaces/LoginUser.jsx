import React, { useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "../utilidades/firebase";
import fondoProyecto from "../imagenes/fondo1.jpg"; // imagen de fondo del proyecto
import BackButton from "../utilidades/BackButton"; // Botón para regresar al menú de roles
import { useNavigate } from "react-router-dom";

import "../estilos/LoginUser.css";
import logoUser from "../imagenes/LogoUser.png";

export default function LoginUser() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");

  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [intentos, setIntentos] = useState(0);

  const [modoRegistro, setModoRegistro] = useState(false);

  const navigate = useNavigate(); // Navegación entre rutas

  // ------------------------------------------------
  // REFERENCIA A LA COLECCIÓN DE USUARIOS
  // ------------------------------------------------
  const coleccionUsuarios = collection(db, "Usuario");

  // ------------------------------------------------
  // FUNCIÓN PARA MANEJAR EL LOGIN
  // ------------------------------------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setResetMessage("");

    try {
      // Buscar usuario por correo
      const q = query(coleccionUsuarios, where("Correo", "==", email));
      const querySnap = await getDocs(q);

      // Verificar si el usuario existe por correo
      if (querySnap.empty) {
        manejarIntentoFallido();
        return setError("El correo no está registrado o es incorrecto.");
      }
      // Obtener datos del usuario
      const usuario = querySnap.docs[0].data();

      // Validar contraseña
      if (usuario.Contrasena !== password) {
        manejarIntentoFallido();
        return setError("La contraseña es incorrecta.");
      }

      alert(`Bienvenido ${usuario.Nombre} ✨`);
      // Redirigir aquí a dashboard si se desea
      navigate("/check-user", { state: { nombre: usuario.Nombre } });

    } catch (err) {
      console.error(err);
      setError("Error al iniciar sesión.");
    }
  };

  // ------------------------------------------------
  // FUNCIÓN PARA MANEJAR INTENTOS FALLIDOS
  // ------------------------------------------------
  const manejarIntentoFallido = () => {
    const nuevosIntentos = intentos + 1;
    setIntentos(nuevosIntentos);

    if (nuevosIntentos === 3) {
      alert("Has fallado 3 veces. Te recomendamos registrarte.");
    }
  };

  // ------------------------------------------------
  // FUNCIÓN PARA REGISTRAR USUARIO
  // ------------------------------------------------
  const handleRegistro = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (!nombre.trim()) return setError("Ingresa tu nombre.");
      if (!email.trim()) return setError("Ingresa tu correo.");
      if (!password.trim()) return setError("Ingresa una contraseña.");

      // Verificar si ya existe el correo
      const q = query(coleccionUsuarios, where("Correo", "==", email));
      const snap = await getDocs(q);

      if (!snap.empty) {
        return setError("Este correo ya está registrado.");
      }

      // Registrar usuario
      await addDoc(coleccionUsuarios, {
        Nombre: nombre,
        Correo: email,
        Contrasena: password,
        FechaRegistro: new Date(),
      });

      alert("Registro exitoso 🎉 Ya puedes iniciar sesión.");
      setModoRegistro(false);

    } catch (err) {
      console.error("ERROR REGISTRO:", err);
      setError("Error al registrar usuario.");
    }
  };

  // ------------------------------------------------
  // FUNCIÓN PARA RECUPERAR CONTRASEÑA (AUTH)
  // ------------------------------------------------
  const handlePasswordReset = async () => {
    if (!email) {
      return setResetMessage("Ingresa tu correo para recuperar tu contraseña.");
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage("Se ha enviado un enlace a tu correo.");

    } catch (err) {
      console.error(err);
      setResetMessage("Error al enviar enlace. Verifica el correo.");
    }
  };

  return (
    <div className="login-container" style={{ backgroundImage: `url(${fondoProyecto})`, }}>
     <BackButton to="/roles" label="Regresar" />

      <div className="login-card">
        <h2>{modoRegistro ? "Registro de Usuario" : "Login Usuario"}</h2>

        {/* Logo */}
        <img src={logoUser} alt="Logo User" className="logo-user" />

        {/* FORMULARIO LOGIN */}
        {!modoRegistro && (
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit">Ingresar</button>
          </form>
        )}

        {/* FORMULARIO REGISTRO */}
        {modoRegistro && (
          <form onSubmit={handleRegistro}>
            <input
              type="text"
              placeholder="Nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />

            <input
              type="email"
              placeholder="Correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit">Registrar</button>

            <p className="small-info">
              Una vez registrado podrás iniciar sesión.
            </p>
          </form>
        )}

        {/* Enlace de recuperar contraseña (solo login) */}
        {!modoRegistro && (
          <p className="forgot-password" onClick={handlePasswordReset}>
            ¿Olvidaste tu contraseña?
          </p>
        )}

        {/* Enlace de cambio entre login ↔ registro */}
        <p
          className="register-link"
          onClick={() => {
            setModoRegistro(!modoRegistro);
            setError("");
          }}
        >
          {modoRegistro
            ? "¿Ya tienes cuenta? Inicia sesión"
            : "¿Aún no estás registrado? Regístrate aquí"}
        </p>

        {/* Mensajes */}
        {error && <p className="error-message">{error}</p>}
        {resetMessage && <p className="reset-message">{resetMessage}</p>}
      </div>
    </div>
  );
}
