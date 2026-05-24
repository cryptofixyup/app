import { Navigate } from "react-router-dom";
import { getToken } from "../../lib/adminApi";

export default function RequireAdmin({ children }) {
  if (!getToken()) {
    return <Navigate to="/admin" replace />;
  }
  return children;
}
