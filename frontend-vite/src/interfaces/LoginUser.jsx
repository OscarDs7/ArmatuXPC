import React, { useState } from "react";
import {
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
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nombre, setNombre] = useState("");

  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [intentos, setIntentos] = useState(0);
  const [loading, setLoading] = useState(false);

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

// Calcular fuerza de contraseña
const getPasswordStrength = () => {
  const checks = Object.values(passwordValidations).filter(Boolean).length;

  if (checks <= 2) {
    return { label: "Débil", color: "red", emoji: "🔴" };
  }

  if (checks === 3 || checks === 4) {
    return { label: "Media", color: "orange", emoji: "🟡" };
  }

  return { label: "Fuerte", color: "green", emoji: "🟢" };
};

// Variable que contiene la información de la fuerza de la contraseña para mostrar al usuario
const passwordStrength = getPasswordStrength();

// Validación de email con regex
const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
// Limpiar email de espacios y convertir a minúsculas para evitar errores comunes
const cleanEmail = email.trim().toLowerCase();
// Validar que las contraseñas coincidan
const passwordsMatch = password === confirmPassword;

// Validación completa del formulario de registro
const isRegistroValido =
  nombre.trim() !== "" &&
  emailValid &&
  passwordsMatch &&
  Object.values(passwordValidations).every(Boolean);


  // ------------------------------------------------
  // FUNCIÓN PARA MANEJAR EL LOGIN
  // ------------------------------------------------
  const handleLogin = async (e) => {
  e.preventDefault();
  setError("");
  setResetMessage("");
  setLoading(true); // Activar loading

  try {
    // 1️⃣ Iniciar sesión en Firebase Auth
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
    const uid = cred.user.uid;

    // 2️⃣ Buscar usuario en Firestore por UID
    const userRef = doc(db, "Usuario", uid);
    const userSnap = await getDoc(userRef); // obtenemos el documento directamente por UID (más eficiente que query)

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
    // Manejo de errores específicos de Firebase Auth
    switch (err.code) {
      case "auth/invalid-credential":
        setError("Correo o contraseña incorrectos.");
        break;

      case "auth/invalid-email":
        setError("Correo electrónico no válido.");
        break;

      case "auth/too-many-requests":
        setError("Demasiados intentos. Intenta más tarde.");
        break;

      default:
        setError("Error inesperado. Intenta más tarde.");
    }

    manejarIntentoFallido(); // Incrementar intentos fallidos y mostrar alerta si es necesario
    
  } // fin-catch
  finally {
    setLoading(false);
  }

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
    if(!emailValid) return setError("El formato del correo no es válido.");
    if (!password.trim()) return setError("Ingresa una contraseña.");

    // Validar que las contraseñas coincidan antes de intentar registrar
     if (password !== confirmPassword) {
        return setError("Las contraseñas no coinciden.");
    }

    // Validación de contraseña en tiempo real
    if (!Object.values(passwordValidations).every(Boolean)) {
      return setError("La contraseña no cumple los requisitos de seguridad.");
    }

    // Activamos el loading mientras se procesa el registro
    setLoading(true);

    // 1️⃣ Crear usuario en Firebase Auth
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    const uid = cred.user.uid;

    // 2️⃣ Guardar datos del usuario en Firestore
    await setDoc(doc(db, "Usuario", uid), {  // usamos el UID como ID del documento para fácil acceso
      UID: uid,
      Nombre: nombre,
      Correo: cleanEmail,
      Rol: "user",
      FechaRegistro: new Date(),
    }, { merge: false }); // merge: false para evitar sobreescribir datos si el UID ya existe

    alert("Registro exitoso 🎉 Ya puedes iniciar sesión.");
    setModoRegistro(false);

  } catch (err) {
    console.error("ERROR REGISTRO:", err);

    switch (err.code) {
      case "auth/email-already-in-use":
        setError("Este correo ya está registrado.");
        break;

      case "auth/invalid-email":
        setError("El formato del correo no es válido.");
        break;

      case "auth/weak-password":
        setError("La contraseña es demasiado débil.");
        break;

      default:
        setError("Error al registrar usuario.");
    }
  }
  finally {
    setLoading(false);
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
      alert("Por favor revisa tu bandeja de Spam para encontrar el correo de recuperación si no lo ves en tu bandeja de entrada.");
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

            <button type="submit" disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
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

            {/* Validación de fuerza de contraseña en tiempo real */}
            {password.length > 0 && (
            <div className="password-strength">
              <p>
                Seguridad de contraseña:{" "}
                <strong style={{ color: passwordStrength.color }}>
                  {passwordStrength.label} {passwordStrength.emoji}
                </strong>
              </p>

              <div className="strength-bar">
                <div
                  className="strength-fill"
                  style={{
                    width: `${Object.values(passwordValidations).filter(Boolean).length * 20}%`,
                    backgroundColor: passwordStrength.color,
                  }}
                ></div>
              </div>
                <br></br>
            </div>
          )}
           <div>
            <input
              type="password"
              placeholder="Confirmar Contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />

            {confirmPassword.length > 0 && (
              <p className={password === confirmPassword ? "valid" : "invalid"}>
                {password === confirmPassword ? "✔ Las contraseñas coinciden" : "✖ Las contraseñas no coinciden"}
              </p>
            )} <br></br>
          </div>

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
