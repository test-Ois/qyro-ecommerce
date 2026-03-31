import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

/**
 * Consolidated route protection component
 * Replaces AdminRoute, PrivateRoute, and SellerRoute
 *
 * @param {React.ReactNode} children - Component to render if authorized
 * @param {string} requiredRole - Required role: 'admin' | 'seller' | 'user' (optional)
 * @param {boolean} requireAuth - Whether authentication is required (default: true)
 * @param {boolean} requireApprovedSeller - Whether seller must be approved (default: false)
 * @param {string} redirectTo - Path to redirect if unauthorized (default: '/login')
 */
function ProtectedRoute({
  children,
  requiredRole = null,
  requireAuth = true,
  requireApprovedSeller = false,
  redirectTo = "/login"
}) {
  const { user, authLoading, isApprovedSeller } = useContext(AuthContext);

  // Wait for auth state to load
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Check if authentication is required
  if (requireAuth && !user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check if user has required role
  if (requiredRole && user && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  // Check if approved seller is required
  if (requireApprovedSeller && !isApprovedSeller()) {
    return <Navigate to="/seller-pending" replace />;
  }

  return children;
}

export default ProtectedRoute;
