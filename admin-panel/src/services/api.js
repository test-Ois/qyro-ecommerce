import axios from "axios";

const FRONTEND_LOGIN_URL = "http://localhost:3000/login";

const API = axios.create({
  baseURL: "http://localhost:5000/api"
});

let isRefreshing = false;
let refreshQueue = [];

const clearAdminSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  delete API.defaults.headers.common.Authorization;
};

const redirectToLogin = () => {
  if (window.location.href !== FRONTEND_LOGIN_URL) {
    window.location.replace(FRONTEND_LOGIN_URL);
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

export const adminApi = {
  async getUsers() {
    const { data } = await API.get("/users");
    return Array.isArray(data) ? data : [];
  },

  deleteUser(userId) {
    return API.delete(`/users/${userId}`);
  },

  async toggleUserBlock(userId) {
    const { data } = await API.put(`/users/${userId}/block`);
    return data.user;
  }
};

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

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      !originalRequest ||
      originalRequest._retry ||
      error.response?.status !== 401 ||
      originalRequest.url?.includes("/auth/refresh-token")
    ) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      clearAdminSession();
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
      const response = await axios.post("http://localhost:5000/api/auth/refresh-token", {
        refreshToken
      });
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
      clearAdminSession();
      redirectToLogin();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default API;
