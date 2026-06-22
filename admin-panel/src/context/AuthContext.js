import { createContext, useState, useEffect, useCallback, useContext } from "react";
import API from "../services/api";

export const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const storedUser = localStorage.getItem("adminUser");

    if (token && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        // Only accept admin and super_admin roles
        if (parsed.role === "admin" || parsed.role === "super_admin") {
          setAdmin(parsed);
          API.defaults.headers.common.Authorization = `Bearer ${token}`;
        } else {
          // Wrong role — clear storage
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminUser");
          localStorage.removeItem("adminRefreshToken");
        }
      } catch {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        localStorage.removeItem("adminRefreshToken");
      }
    }

    setAuthLoading(false);
  }, []);

  const login = useCallback((userData, token, refreshToken) => {
    localStorage.setItem("adminToken", token);
    localStorage.setItem("adminUser", JSON.stringify(userData));
    if (refreshToken) {
      localStorage.setItem("adminRefreshToken", refreshToken);
    }
    API.defaults.headers.common.Authorization = `Bearer ${token}`;
    setAdmin(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      if (localStorage.getItem("adminToken")) {
        await API.post("/auth/logout");
      }
    } catch {
      // Ignore logout API errors
    } finally {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      localStorage.removeItem("adminRefreshToken");
      delete API.defaults.headers.common.Authorization;
      setAdmin(null);
    }
  }, []);

  const isSuperAdmin = () => admin && admin.role === "super_admin";

  return (
    <AdminAuthContext.Provider value={{ admin, authLoading, login, logout, isSuperAdmin }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
