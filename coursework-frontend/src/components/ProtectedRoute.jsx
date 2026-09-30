import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children, adminOnly = false }) {
  const { token, role } = useAuth();

  if (!token) return <Navigate to="/login" replace />;
  if (adminOnly && role !== "admin") return <Navigate to="/dashboard" replace />;

  return children;
}