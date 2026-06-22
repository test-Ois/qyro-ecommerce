import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AdminAuthContext } from "../context/AuthContext";

/**
 * Admin Panel Protected Route
 *
 * Protects all admin dashboard routes.
 * Redirects to /login (admin panel's own login) if not authenticated.
 *
 * @param {string} requiredRole - Optional: "super_admin" to restrict a route further
 */
function ProtectedRoute({ requiredRole = null }) {
  const { admin, authLoading } = useContext(AdminAuthContext);

  // Show nothing while checking localStorage auth state
  if (authLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0f",
          color: "#fff"
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 48,
              height: 48,
              border: "3px solid rgba(139,92,246,0.3)",
              borderTop: "3px solid #8b5cf6",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 16px"
            }}
          />
          <p style={{ color: "#9ca3af", fontSize: 14 }}>Verifying access...</p>
        </div>
      </div>
    );
  }

  // Not logged in → redirect to admin login
  if (!admin) {
    return <Navigate to="/login" replace />;
  }

  // Must be approved admin (or super_admin)
  if (admin.role === "admin" && !admin.isApproved) {
    return <Navigate to="/pending" replace />;
  }

  // Optional super_admin-only route
  if (requiredRole === "super_admin" && admin.role !== "super_admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
