// Script para proteger rutas y redirigir a login si el usuario no está autenticado

import { Navigate } from "react-router-dom";
import { useAuth } from "../src/context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}