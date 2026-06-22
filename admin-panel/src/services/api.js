import axios from "axios";

const apiBase = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const API = axios.create({
  baseURL: apiBase
});

let isRefreshing = false;
let refreshQueue = [];

const clearAdminSession = () => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminRefreshToken");
  localStorage.removeItem("adminUser");
  delete API.defaults.headers.common.Authorization;
};

// Redirect to admin panel's own login page (not frontend)
const redirectToAdminLogin = () => {
  if (!window.location.pathname.startsWith("/login")) {
    window.location.replace("/login");
  }
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

export const getAdminApiErrorMessage = (error, fallbackMessage) =>
  error.response?.data?.message || error.message || fallbackMessage;

// Request interceptor — attach adminToken (not the frontend "token")
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
    API.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common.Authorization;
  }

  return config;
});

// Response interceptor — handle 401 with token refresh, redirect to /login on failure
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry login or refresh requests
    if (
      !originalRequest ||
      originalRequest._retry ||
      error.response?.status !== 401 ||
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/refresh-token")
    ) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem("adminRefreshToken");

    if (!refreshToken) {
      clearAdminSession();
      redirectToAdminLogin();
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

      localStorage.setItem("adminToken", newToken);
      if (newRefreshToken) localStorage.setItem("adminRefreshToken", newRefreshToken);
      if (user) localStorage.setItem("adminUser", JSON.stringify(user));

      API.defaults.headers.common.Authorization = `Bearer ${newToken}`;
      flushRefreshQueue(null, newToken);

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      return API(originalRequest);
    } catch (refreshError) {
      flushRefreshQueue(refreshError);
      clearAdminSession();
      redirectToAdminLogin();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default API;
