import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from "firebase/auth"; // Importa funciones de autenticación de Firebase
import { collection, addDoc } from "firebase/firestore"; // Importa funciones de Firestore para agregar documentos
import { auth, db } from "../utilidades/firebase"; // Importa autenticación y Firestore
import adminImg from "../assets/LogoAdmin.png";
import { getFunctions, httpsCallable } from "firebase/functions"; // Importa funciones de Firebase Functions (para usar la función segura de creación de admin)

export default function CrearCuentaAdmin() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const coleccionUsuarios = collection(db, "Usuario");
  //const auth = getAuth();
  //console.log("Usuario actual:", auth.currentUser);



  // Crear administrador sin cerrar sesión actual (opción profesional: usar Firebase Functions con permisos específicos para crear admins sin exponer la función a todos los usuarios autenticados)
  const handleCrearAdminProfesional = async (e) => {
    e.preventDefault();
    setError("");

    if (!nombre || !correo || !password) {
      return setError("Todos los campos son obligatorios.");
    }

    try {
      const functions = getFunctions(undefined, "us-central1"); // Obtener instancia de Functions (especificar región si es necesario)
      const crearAdminFunction = httpsCallable(functions, "crearAdmin"); // Nombre de la función que creé en Firebase Functions

      await crearAdminFunction({
        nombre,
        correo,
        password
      });

      alert("Administrador creado correctamente ✅");
      navigate("/gestion-cuentas-admin");

    } catch (error) {
      console.error("Error completo:", error);
      console.error("Código:", error.code);
      console.error("Mensaje:", error.message);

      if (error.code === "already-exists") {
        return setError("Este correo ya está registrado.");
      }

      setError("Error al crear administrador.");
    }
  }; // fin handleCrearAdminProfesional

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-950 via-slate-900 to-black text-white px-6 py-12">
      <div className="max-w-2xl mx-auto bg-slate-800/70 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-700 p-10">

        <h1 className="text-3xl font-semibold mb-6 text-center">
          Crear nueva cuenta de administrador
        </h1>

        <img
          src={adminImg}
          alt="Administrador"
          className="w-40 mb-10 opacity-90 mx-auto"
        />

        <form onSubmit={handleCrearAdminProfesional} className="space-y-6">

          <div>
            <label className="block mb-2 text-sm font-medium">
              Nombre completo
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white focus:ring-2 focus:ring-indigo-500"
              placeholder="Ingresa el nombre completo"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">
              Correo electrónico
            </label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white focus:ring-2 focus:ring-indigo-500"
              placeholder="Ingresa el correo electrónico"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white focus:ring-2 focus:ring-indigo-500"
              placeholder="Ingresa la contraseña"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <div className="flex justify-between">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 transition shadow-lg"
            >
              Crear Administrador
            </button>

            <button
              type="button"
              onClick={() => navigate("/gestion-cuentas-admin")}
              className="px-6 py-3 rounded-xl bg-gray-600 hover:bg-gray-700 transition shadow-lg"
            >
              Cancelar
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}