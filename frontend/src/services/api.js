import axios from "axios";

const apiBase = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const API = axios.create({
  baseURL: apiBase
});

let isRefreshing = false;
let refreshQueue = [];

// Routes that are PUBLIC — never redirect to login on 401 from these
const PUBLIC_ROUTES = [
  "/products",
  "/auth/login",
  "/auth/register",
  "/auth/admin-register",
  "/auth/send-otp",
  "/auth/verify-otp",
  "/auth/reset-password",
  "/auth/refresh-token"
];

const isPublicRoute = (url) => {
  if (!url) return true;
  return PUBLIC_ROUTES.some((route) => url.includes(route));
};

const clearFrontendAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  delete API.defaults.headers.common.Authorization;
};

const redirectToLogin = () => {
  if (
    typeof window === "undefined" ||
    window.location.pathname === "/login" ||
    window.location.pathname.startsWith("/seller/login") ||
    window.location.pathname.startsWith("/admin")
  ) {
    return;
  }
  window.location.replace("/login");
};

const flushRefreshQueue = (error, token = null) => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
      return;
    }
    resolve(token);
  });
  refreshQueue = [];
};

// Request interceptor — attach token if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
    API.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common.Authorization;
  }

  return config;
});

// Response interceptor — handle 401 with token refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip retry conditions:
    // 1. No original request config
    // 2. Already retried
    // 3. Not a 401
    // 4. Public route (no auth needed, don't redirect guest users)
    if (
      !originalRequest ||
      originalRequest._retry ||
      error.response?.status !== 401 ||
      isPublicRoute(originalRequest.url) ||
      originalRequest.url?.includes("/auth/refresh-token")
    ) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      // Only clear auth and redirect if user was supposed to be logged in
      const token = localStorage.getItem("token");
      if (token) {
        clearFrontendAuth();
        redirectToLogin();
      }
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then((newToken) => {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return API(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await axios.post(`${apiBase}/auth/refresh-token`, { refreshToken });
      const { token: newToken, refreshToken: newRefreshToken, user } = response.data;

      localStorage.setItem("token", newToken);
      if (newRefreshToken) localStorage.setItem("refreshToken", newRefreshToken);
      if (user) localStorage.setItem("user", JSON.stringify(user));

      API.defaults.headers.common.Authorization = `Bearer ${newToken}`;
      flushRefreshQueue(null, newToken);

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      return API(originalRequest);
    } catch (refreshError) {
      flushRefreshQueue(refreshError);
      clearFrontendAuth();
      redirectToLogin();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default API;
