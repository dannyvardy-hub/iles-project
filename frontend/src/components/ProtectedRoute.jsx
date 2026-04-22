import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth();

  const token = localStorage.getItem("access_token");
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");

  if (!token || !storedUser) return <Navigate to="/login" replace />;
  if (role && storedUser.role !== role) return <Navigate to="/unauthorized" replace />;

  return children;
}