import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../utilidades/firebase";
import { useNavigate } from "react-router-dom";
import { getFunctions, httpsCallable } from "firebase/functions"; // Importa funciones de Firebase Functions (para usar la función segura de eliminación de usuario)
import { getAuth } from "firebase/auth";

export default function AdministrarCuentas() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [tab, setTab] = useState("user");

  const coleccionUsuarios = collection(db, "Usuario");
   const auth = getAuth();
  console.log("Usuario actual:", auth.currentUser);

  // 
  getAuth().currentUser.getIdTokenResult(true).then((tokenResult) => {
    console.log("Claims actualizados:", tokenResult.claims);
  }).catch((error) => {
    console.error("Error al obtener token:", error);
  });


  // 🔹 Obtener datos
  const fetchUsuarios = async () => {
    const snapshot = await getDocs(coleccionUsuarios);

    const listaUsuarios = [];
    const listaAdmins = [];

    snapshot.forEach((docSnap) => {
      const data = { id: docSnap.id, ...docSnap.data() };

      if (data.Rol === "admin") {
        listaAdmins.push(data);
      } else {
        listaUsuarios.push(data);
      }
    });

    setUsuarios(listaUsuarios);
    setAdmins(listaAdmins);
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);


  // 🔹 Cambiar rol
  const handleCambiarRolProfesional = async (id, uid, rolActual) => {

    const nuevoRol = rolActual === "admin" ? "user" : "admin";

    if (!window.confirm(`¿Cambiar rol a ${nuevoRol}?`)) return;

    try {
      const functions = getFunctions();
      const cambiarRol = httpsCallable(functions, "cambiarRol");

      await cambiarRol({
        uid,
        docId: id,
        nuevoRol
      });

      alert("Rol actualizado correctamente ✅");
      fetchUsuarios();

    } catch (error) {
      console.error(error);
      alert("Error al cambiar rol.");
    }
  };

  const dataToShow = tab === "admin" ? admins : usuarios; // Decide qué datos mostrar según la pestaña activa

  // Función para eliminar usuario usando Firebase Functions (para eliminar también de Auth)
  const handleEliminarProfesional = async (id, uid) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta cuenta?")) return;
    try {
      const functions = getFunctions();
      const eliminarUsuario = httpsCallable(functions, "eliminarUsuario");
      await eliminarUsuario({ uid, docId: id });
      alert("Usuario eliminado correctamente ✅");
      fetchUsuarios();
    } catch (err) {
      console.error(err);
      alert("Error al eliminar usuario.");
    }
  };

  // Función para copiar la uid de un usuario en cuánto le das click a la celda
  const copiarAlPortapapeles = (texto) => {
    navigator.clipboard.writeText(texto);
    alert("UID copiado al portapapeles 📋");
  };

  return (

    <div className="min-h-screen bg-linear-to-br from-indigo-950 via-slate-900 to-black text-white px-4 sm:px-8 py-6 sm:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-semibold">
              Administrar Cuentas
            </h1>

            <button
              onClick={() => navigate("/gestion-cuentas")}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 rounded-lg transition"
            >
              Regresar
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setTab("user")}
              className={`px-6 py-2 rounded-lg transition ${
                tab === "user"
                  ? "bg-indigo-600"
                  : "bg-slate-700 hover:bg-slate-600"
              }`}
            >
              Usuarios
            </button>

            <button
              onClick={() => setTab("admin")}
              className={`px-6 py-2 rounded-lg transition ${
                tab === "admin"
                  ? "bg-indigo-600"
                  : "bg-slate-700 hover:bg-slate-600"
              }`}
            >
              Administradores
            </button>
          </div>

          {/* Tabla */}
          <div className="bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-700">
            <table className="w-full text-left min-w-200">
              <thead className="bg-slate-700 text-slate-300">
                <tr>
                  <th className="p-4">UID</th>
                  <th className="p-4">Nombre</th>
                  <th className="p-4">Correo</th>
                  <th className="p-4">Fecha Registro</th>
                  <th className="p-4">Tokens Disponibles</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {dataToShow.map((usuario) => (
                  <tr
                    key={usuario.id}
                    className="border-t border-slate-700 hover:bg-slate-700/40 transition"
                  >
                    {/* UID Truncado: solo muestra el inicio y tiene un ancho máximo */}
                   <td 
                      className="p-4 text-xs font-mono text-slate-400 max-w-30 truncate cursor-pointer hover:text-sky-400 transition-colors"
                      title="Click para copiar UID completo"
                      onClick={() => copiarAlPortapapeles(usuario.id)}
                    >
                      {usuario.id}
                    </td> 
                    <td className="p-4 font-medium">{usuario.Nombre}</td>
                    <td className="p-4 text-slate-300">{usuario.Correo}</td>
                    <td className="p-4 whitespace-nowrap text-center">
                      {usuario.FechaRegistro?.toDate
                        ? usuario.FechaRegistro.toDate().toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="p-4 text-center">
                      <span className="bg-slate-900 px-2 py-1 rounded text-sky-400 text-sm">
                        {usuario.TokensDisponibles || 0} Tokens
                      </span>
                    </td>
                    <td className="p-4 text-center space-x-3">
                      <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <button
                        onClick={() =>
                          handleCambiarRolProfesional(usuario.id, usuario.UID, usuario.Rol)
                        }
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 rounded-md text-sm"
                      >
                        Cambiar Rol
                      </button>

                      <button
                        onClick={() => handleEliminarProfesional(usuario.id, usuario.UID)}  
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md text-sm"
                      >
                        Eliminar
                      </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {dataToShow.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center p-6 text-slate-400">
                      No hay registros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
  );
}