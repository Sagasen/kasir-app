import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, ownerOnly = false }) {
  const { session, profile, loading } = useAuth();

  if (loading) return <div className="loading-text">Memuat...</div>;
  if (!session) return <Navigate to="/login" replace />;
  if (ownerOnly && profile?.role !== "owner") return <Navigate to="/kasir" replace />;

  return children;
}
