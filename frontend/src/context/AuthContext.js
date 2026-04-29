import { createContext, useState, useEffect, useCallback } from "react";
import API from "../services/api";

export const AuthContext = createContext();

const isAdminPanel = () =>
  typeof window !== "undefined" && window.location.port === "3001";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tokenRefreshing, setTokenRefreshing] = useState(false);

  const clearStoredAuth = useCallback(() => {
    if (isAdminPanel()) {
      return;
    }

    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    delete API.defaults.headers.common.Authorization;
  }, []);

  useEffect(() => {
    if (isAdminPanel()) {
      setAuthLoading(false);
      return;
    }

    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (savedUser && token) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        API.defaults.headers.common.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error("User parse error:", error);
        clearStoredAuth();
      }
    } else {
      delete API.defaults.headers.common.Authorization;
    }

    setAuthLoading(false);
  }, [clearStoredAuth]);

  const updateToken = useCallback((newToken, newRefreshToken) => {
    if (isAdminPanel()) {
      return;
    }

    localStorage.setItem("token", newToken);

    if (newRefreshToken) {
      localStorage.setItem("refreshToken", newRefreshToken);
    }

    API.defaults.headers.common.Authorization = `Bearer ${newToken}`;
  }, []);

  const refreshTokenManually = useCallback(async () => {
    if (isAdminPanel()) {
      return false;
    }

    const storedRefreshToken = localStorage.getItem("refreshToken");
    if (!storedRefreshToken) {
      return false;
    }

    try {
      setTokenRefreshing(true);

      const res = await API.post("/auth/refresh-token", {
        refreshToken: storedRefreshToken
      });
      const { token, refreshToken: newRefreshToken, user: refreshedUser } = res.data;

      updateToken(token, newRefreshToken);

      if (refreshedUser) {
        localStorage.setItem("user", JSON.stringify(refreshedUser));
        setUser(refreshedUser);
      }

      return true;
    } catch (error) {
      console.error("Refresh failed:", error);
      clearStoredAuth();
      setUser(null);
      return false;
    } finally {
      setTokenRefreshing(false);
    }
  }, [clearStoredAuth, updateToken]);

  const login = useCallback((userData, token, refreshToken) => {
    if (isAdminPanel()) {
      return;
    }

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);

    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    } else {
      localStorage.removeItem("refreshToken");
    }

    API.defaults.headers.common.Authorization = `Bearer ${token}`;
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    if (isAdminPanel()) {
      return;
    }

    try {
      if (localStorage.getItem("token")) {
        await API.post("/auth/logout");
      }
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      clearStoredAuth();
      setUser(null);
    }
  }, [clearStoredAuth]);

  const hasRole = (role) => user && user.role === role;

  const isApprovedSeller = () =>
    user && user.role === "seller" && user.isApproved;

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        authLoading,
        hasRole,
        isApprovedSeller,
        updateToken,
        refreshTokenManually,
        tokenRefreshing
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
