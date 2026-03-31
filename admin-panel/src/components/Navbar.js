import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Navbar() {

  const navigate = useNavigate();

  /* Clear tokens and redirect to login */
  const handleLogout = async () => {
    try {
      // Call logout API to invalidate refresh token on backend
      await API.post("/auth/logout");
    } catch (error) {
      console.error("Logout API error (will still clear local storage):", error);
    }

    // Clear local storage regardless of API response
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    delete API.defaults.headers.common['Authorization'];

    navigate("/");
  };

  return (

    <div style={{
      height: "60px",
      background: "#eee",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 20px"
    }}>

      <h3>Admin Panel</h3>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        style={{
          padding: "8px 16px",
          background: "#dc2626",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}
      >
        Logout
      </button>

    </div>

  );

}

export default Navbar;