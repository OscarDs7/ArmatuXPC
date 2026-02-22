import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { auth, db } from "../utilidades/firebase";
import adminImg from "../assets/LogoAdmin.png";

export default function CrearCuentaAdmin() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const coleccionUsuarios = collection(db, "Usuario");

  const handleCrearAdmin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (!nombre || !correo || !password) {
        return setError("Todos los campos son obligatorios.");
      }

      // 🔹 Guardar credenciales del admin actual
      const adminActual = auth.currentUser;
      const adminEmail = adminActual.email;

      // ⚠️ Aquí necesitarías la contraseña del admin actual
      // Para proyecto académico asumiremos que vuelve a loguearse manualmente
      // (más abajo te explico alternativa profesional)

      // 1️⃣ Crear usuario en Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, correo, password);
      const uid = cred.user.uid;

      // 2️⃣ Guardar en Firestore
      await addDoc(coleccionUsuarios, {
        UID: uid,
        Nombre: nombre,
        Correo: correo,
        Rol: "admin",
        FechaRegistro: new Date(),
      });

      alert("Administrador creado correctamente ✅");

      // 3️⃣ Redirigir al login admin (porque la sesión cambió)
      navigate("/login-admin");

    } catch (err) {
      console.error(err);

      if (err.code === "auth/email-already-in-use") {
        return setError("Este correo ya está registrado.");
      }

      setError("Error al crear administrador.");
    }
  };

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

        <form onSubmit={handleCrearAdmin} className="space-y-6">

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
              Crear cuenta
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