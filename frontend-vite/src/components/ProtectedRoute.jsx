import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null; // Espera a Firebase

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}