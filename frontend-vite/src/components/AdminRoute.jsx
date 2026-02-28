import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user, rol, loading } = useAuth();

  //console.log("User:", user);
  //console.log("Rol:", rol);
 // console.log("Loading:", loading);

  if (loading) return null;

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (rol !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}