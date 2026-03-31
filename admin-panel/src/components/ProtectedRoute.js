import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const token = localStorage.getItem("token");

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  if (!token || !user || user.role !== "admin") {
    return <Navigate to="http://localhost:3000/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;