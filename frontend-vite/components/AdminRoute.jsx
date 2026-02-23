// Script para proteger rutas y redirigir a login si el usuario no está autenticado o no tiene el rol de admin

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user, rol } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (rol !== "admin") {
    return <Navigate to="/no-autorizado" replace />;
  }

  return children;
}