import React, { useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  setDoc,
  doc
} from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail} from "firebase/auth";
import { auth, db } from "../utilidades/firebase";
import fondoProyecto from "../assets/fondo1.jpg"; // imagen de fondo del proyecto
import BackButton from "../utilidades/BackButton"; // Botón para regresar al menú de roles
import { useNavigate } from "react-router-dom";

import "../estilos/Login.css";
import logoUser from "../assets/LogoUser.png";

export function LoginUser() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");

  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [intentos, setIntentos] = useState(0);

  const [modoRegistro, setModoRegistro] = useState(false);

  const navigate = useNavigate(); // Navegación entre rutas

  // Objeto para validaciones de contraseña en tiempo real
  const passwordValidations = {
  length: password.length >= 8,
  upper: /[A-Z]/.test(password),
  lower: /[a-z]/.test(password),
  number: /\d/.test(password),
  special: /[\W_]/.test(password),
};

// Validación completa del formulario de registro
const isRegistroValido =
  nombre.trim() !== "" &&
  email.trim() !== "" &&
  Object.values(passwordValidations).every(Boolean);

  // ------------------------------------------------
  // REFERENCIA A LA COLECCIÓN DE USUARIOS
  // ------------------------------------------------
  //const coleccionUsuarios = collection(db, "Usuario");

  
  // ------------------------------------------------
  // FUNCIÓN PARA MANEJAR EL LOGIN
  // ------------------------------------------------
  const handleLogin = async (e) => {
  e.preventDefault();
  setError("");
  setResetMessage("");

  try {
    // 1️⃣ Iniciar sesión en Firebase Auth
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;

    // 2️⃣ Buscar usuario en Firestore por UID
    const userRef = doc(db, "Usuario", uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return setError("No se encontró tu perfil en la base de datos.");
    }

    const usuario = userSnap.data();

    //Validar rol según la ventana donde inicia sesión
    if (!usuario.Rol || usuario.Rol !== "user") {
      return setError("No tienes permisos para acceder aquí.");
    }

    alert(`Bienvenido ${usuario.Nombre} ✨`);
    navigate("/dashboard-user", { state: { nombre: usuario.Nombre } });

  } catch (err) {
  console.error("Login error:", err.code);

    if (
      err.code === "auth/invalid-credential" ||
      err.code === "auth/user-not-found" ||
      err.code === "auth/wrong-password"
    ) {
      manejarIntentoFallido();
      setError("Correo o contraseña incorrectos.");
      return;
    }

    setError("Error inesperado. Intenta más tarde.");
  } // fin-catch

}; // fin handleLogin


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
    // Validaciones básicas antes de intentar registrar
    if (!nombre.trim()) return setError("Ingresa tu nombre.");
    if (!email.trim()) return setError("Ingresa tu correo.");
    if (!password.trim()) return setError("Ingresa una contraseña.");

    // Validación de contraseña en tiempo real
    if (!Object.values(passwordValidations).every(Boolean)) {
      return setError("La contraseña no cumple los requisitos de seguridad.");
    }

    // 1️⃣ Crear usuario en Firebase Auth
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;

    // 2️⃣ Guardar datos del usuario en Firestore
    await setDoc(doc(db, "Usuario", uid), {  // usamos el UID como ID del documento para fácil acceso
      UID: uid,
      Nombre: nombre,
      Correo: email,
      Rol: "user",
      FechaRegistro: new Date(),
    }, { merge: false }); // merge: false para evitar sobreescribir datos si el UID ya existe

    alert("Registro exitoso 🎉 Ya puedes iniciar sesión.");
    setModoRegistro(false);

  } catch (err) {
    console.error("ERROR REGISTRO:", err);

    if (err.code === "auth/email-already-in-use") {
      return setError("Este correo ya está registrado.");
    }

    setError("Error al registrar usuario.");
  }
}; // fin handleRegistro

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
     <BackButton to="/" label="Regresar" className = "back-button" />

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
              autoComplete = "username"
              required
            />

            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            {/* VALIDACIÓN VISUAL EN TIEMPO REAL */}
            {password.length > 0 && (
            <ul className="password-rules">
              <p className="small-info">Tu contraseña debe contener:</p>

              <li className={passwordValidations.length ? "valid" : "invalid"}>
                {passwordValidations.length ? "✔" : "✖"} Debe tener mínimo 8 caracteres
              </li>

              <li className={passwordValidations.upper ? "valid" : "invalid"}>
                {passwordValidations.upper ? "✔" : "✖"} Una letra mayúscula
              </li>

              <li className={passwordValidations.lower ? "valid" : "invalid"}>
                {passwordValidations.lower ? "✔" : "✖"} Una letra minúscula
              </li>

              <li className={passwordValidations.number ? "valid" : "invalid"}>
                {passwordValidations.number ? "✔" : "✖"} Un número
              </li>

              <li className={passwordValidations.special ? "valid" : "invalid"}>
                {passwordValidations.special ? "✔" : "✖"} Un carácter especial
              </li>
            </ul>
            )}

            <button
              type="submit"
              disabled={!isRegistroValido} // Deshabilitar botón si el registro no es válido
              className={`px-6 py-3 rounded-xl transition shadow-lg ${
                isRegistroValido
                  ? "bg-sky-500 hover:bg-sky-600"
                  : "bg-slate-600 cursor-not-allowed"
              }`}
            >
              Registrarse
            </button>
            
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
};

export default LoginUser;
