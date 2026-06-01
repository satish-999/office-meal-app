import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { Role } from "../api/types";

export function ProtectedRoute({ role }: { role: Role }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    const home =
      user.role === "employee"
        ? "/employee"
        : user.role === "server"
          ? "/server"
          : "/admin";
    return <Navigate to={home} replace />;
  }

  return <Outlet />;
}
