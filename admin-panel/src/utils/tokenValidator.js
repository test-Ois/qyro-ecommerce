/**
 * ADMIN PANEL TOKEN VALIDATOR UTILITY
 * Checks if admin has valid token on app initialization
 * If not, redirects to frontend login
 */

export const validateAdminToken = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  // If no token or user info, not authenticated
  if (!token || !user) {
    return null;
  }

  try {
    // Parse user data
    const userData = JSON.parse(user);

    // Check if user has admin role
    if (userData.role !== "admin") {
      // Not an admin, clear storage
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      return null;
    }

    // Check if token is expired (basic check - decode JWT payload)
    try {
      const payload = JSON.parse(
        atob(token.split(".")[1])
      );
      
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();

      // Token expired?
      if (currentTime > expirationTime) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        return null;
      }
    } catch (err) {
      // Invalid token format
      console.error("Invalid token format", err);
      return null;
    }

    // Token is valid and user is admin
    return userData;
  } catch (err) {
    console.error("Error validating admin token", err);
    return null;
  }
};

/**
 * REDIRECT TO FRONTEND LOGIN
 * Admin must login only from the frontend
 */
export const redirectToFrontendLogin = () => {
  // Frontend runs on localhost:3000
  const frontendLoginUrl = process.env.REACT_APP_FRONTEND_URL || "http://localhost:3000";
  window.location.href = `${frontendLoginUrl}?returnUrl=http://localhost:3001`;
};
