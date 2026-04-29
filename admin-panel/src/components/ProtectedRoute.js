import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

const FRONTEND_LOGIN_URL = "http://localhost:3000/login";
const ADMIN_TRANSFER_KEY = "QYRO_ADMIN_AUTH";

const clearAdminSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

const readStoredUser = () => {
  const storedUser = localStorage.getItem("user");

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    console.error("Admin user parse error:", error);
    return null;
  }
};

const restoreTransferredSession = () => {
  if (!window.name) {
    return false;
  }

  try {
    const payload = JSON.parse(window.name);

    if (payload?.type !== ADMIN_TRANSFER_KEY) {
      return false;
    }

    const { token, refreshToken, user } = payload;

    if (!token || !user || user.role !== "admin") {
      return false;
    }

    localStorage.setItem("token", token);

    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    } else {
      localStorage.removeItem("refreshToken");
    }

    localStorage.setItem("user", JSON.stringify(user));
    return true;
  } catch (error) {
    console.error("Admin auth transfer error:", error);
    return false;
  } finally {
    window.name = "";
  }
};

const ProtectedRoute = () => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = readStoredUser();

    if (storedToken && storedUser?.role === "admin") {
      setIsAuthorized(true);
      setIsChecking(false);
      return;
    }

    const restored = restoreTransferredSession();
    const restoredToken = localStorage.getItem("token");
    const restoredUser = readStoredUser();

    if (restored && restoredToken && restoredUser?.role === "admin") {
      setIsAuthorized(true);
      setIsChecking(false);
      return;
    }

    clearAdminSession();
    setIsAuthorized(false);
    setIsChecking(false);
    window.location.replace(FRONTEND_LOGIN_URL);
  }, []);

  if (isChecking || !isAuthorized) {
    return null;
  }

  return <Outlet />;
};

export default ProtectedRoute;
