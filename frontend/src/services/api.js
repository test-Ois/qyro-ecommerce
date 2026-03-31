import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

/**
 * Refresh state + queue
 */
let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

/**
 * REQUEST INTERCEPTOR
 * - Attach token
 * - Proactive refresh before expiry
 */
API.interceptors.request.use(async (config) => {
  const token = localStorage.getItem("token");

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const tokenExpire = payload.exp * 1000;
      const now = Date.now();

      // 🔥 PROACTIVE REFRESH (30 sec before expiry)
      if (!isRefreshing && tokenExpire < now + 30000) {
        isRefreshing = true;

        const refreshToken = localStorage.getItem("refreshToken");

        if (refreshToken) {
          try {
            const response = await axios.post(
              "http://localhost:5000/api/auth/refresh-token",
              { refreshToken }
            );

            const { token: newToken, refreshToken: newRefreshToken } = response.data;

            localStorage.setItem("token", newToken);
            localStorage.setItem("refreshToken", newRefreshToken);

            onRefreshed(newToken);
          } catch (err) {
            // ❌ Refresh failed → logout
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            window.location.href = "/login";
          }
        }

        isRefreshing = false;
      }

      config.headers.Authorization = `Bearer ${localStorage.getItem("token")}`;
    } catch (err) {
      console.error("Token decode error:", err);
    }
  }

  config.retryCount = config.retryCount || 0;
  return config;
});

/**
 * RESPONSE INTERCEPTOR
 * - Handle 401
 * - Refresh token
 * - Retry request
 */
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest.url.includes("/auth/refresh-token")
    ) {
      // ❌ Stop infinite loop
      if (originalRequest.retryCount >= 2) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      // 🔁 Queue system
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            originalRequest.retryCount += 1;
            resolve(API(originalRequest));
          });
        });
      }

      isRefreshing = true;
      originalRequest.retryCount += 1;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) throw new Error("No refresh token");

        const response = await axios.post(
          "http://localhost:5000/api/auth/refresh-token",
          { refreshToken }
        );

        const { token: newToken, refreshToken: newRefreshToken } = response.data;

        localStorage.setItem("token", newToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        API.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        onRefreshed(newToken);

        isRefreshing = false;

        return API(originalRequest);
      } catch (err) {
        isRefreshing = false;

        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        window.location.href = "/login";

        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default API;