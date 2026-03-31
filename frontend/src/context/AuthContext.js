import { createContext, useState, useEffect, useCallback } from "react";
import API from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tokenRefreshing, setTokenRefreshing] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");

    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      // Set authorization header
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setAuthLoading(false);
  }, []);

  /**
   * Update token in storage and API headers
   * Called when token is refreshed by interceptor
   */
  const updateToken = useCallback((newToken, newRefreshToken) => {
    localStorage.setItem("token", newToken);
    if (newRefreshToken) {
      localStorage.setItem("refreshToken", newRefreshToken);
    }
    API.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  }, []);

  /**
   * Refresh token manually
   * Can be called proactively before token expires
   */
  const refreshTokenManually = useCallback(async () => {
    try {
      setTokenRefreshing(true);
      const refreshToken = localStorage.getItem("refreshToken");
      
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await API.post("/auth/refresh-token", { refreshToken });
      const { token: newToken, refreshToken: newRefreshToken } = response.data;
      
      updateToken(newToken, newRefreshToken);
      setTokenRefreshing(false);
      
      return true;
    } catch (error) {
      console.error("Manual token refresh failed:", error);
      setTokenRefreshing(false);
      
      // Token refresh failed - logout user
      logout();
      return false;
    }
  }, [updateToken]);

  const login = (userData, token, refreshToken) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
    localStorage.setItem("refreshToken", refreshToken);
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  };

  const logout = async () => {
    try {
      // Call logout API to invalidate refresh token
      await API.post("/auth/logout");
    } catch (error) {
      console.error("Logout API error:", error);
      // Continue with logout even if API call fails
    }

    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    delete API.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // Check if user has required role
  const hasRole = (role) => {
    return user && user.role === role;
  };

  // Check if user is approved seller
  const isApprovedSeller = () => {
    return user && user.role === "seller" && user.isApproved;
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      authLoading,
      hasRole,
      isApprovedSeller,
      updateToken,
      refreshTokenManually,
      tokenRefreshing
    }}>
      {children}
    </AuthContext.Provider>
  );

}