import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api"
});

let isRefreshing = false;
let refreshQueue = [];

const isAdminPanel = () =>
  typeof window !== "undefined" && window.location.port === "3001";

const clearFrontendAuth = () => {
  if (typeof window === "undefined" || isAdminPanel()) {
    return;
  }

  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  delete API.defaults.headers.common.Authorization;
};

const redirectToLogin = () => {
  if (typeof window === "undefined" || isAdminPanel()) {
    return;
  }

  if (window.location.pathname !== "/login") {
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

API.interceptors.request.use((config) => {
  if (isAdminPanel()) {
    return config;
  }

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

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      isAdminPanel() ||
      !originalRequest ||
      originalRequest._retry ||
      error.response?.status !== 401 ||
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/refresh-token")
    ) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      clearFrontendAuth();
      redirectToLogin();
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
      const response = await axios.post(
        "http://localhost:5000/api/auth/refresh-token",
        { refreshToken }
      );
      const { token: newToken, refreshToken: newRefreshToken, user } = response.data;

      localStorage.setItem("token", newToken);

      if (newRefreshToken) {
        localStorage.setItem("refreshToken", newRefreshToken);
      }

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

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
