import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ADMIN_TRANSFER_KEY = "QYRO_ADMIN_AUTH";
const ADMIN_DASHBOARD_URL = "http://localhost:3001/dashboard";
const LOGIN_API_URL = "http://localhost:5000/api/auth/login";

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const persistAuth = (user, token, refreshToken) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);

    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    } else {
      localStorage.removeItem("refreshToken");
    }

    login(user, token, refreshToken);
  };

  const redirectByRole = (user, token, refreshToken) => {
    if (user.role === "admin") {
      window.name = JSON.stringify({
        type: ADMIN_TRANSFER_KEY,
        user,
        token,
        refreshToken
      });
      window.location.replace(ADMIN_DASHBOARD_URL);
      return;
    }

    window.name = "";

    if (user.role === "seller") {
      if (user.isApproved) {
        navigate("/seller-dashboard", { replace: true });
      } else {
        navigate("/seller-pending", { replace: true });
      }
      return;
    }

    navigate("/", { replace: true });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(LOGIN_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      if (!data?.user || !data?.token) {
        setError("Invalid login response");
        return;
      }

      persistAuth(data.user, data.token, data.refreshToken);
      redirectByRole(data.user, data.token, data.refreshToken);
    } catch (requestError) {
      console.error("Login error:", requestError);
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex flex-col items-center justify-center px-4">
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-8 w-full max-w-sm">
        <div
          onClick={() => navigate("/")}
          className="text-center cursor-pointer mb-6"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent tracking-wide hover:scale-105 transition">
            Qyro
          </h1>
        </div>

        <h2 className="text-1xl font-semibold bg-gradient-to-r from-yellow-800 via-pink-400 to-purple-700 bg-clip-text text-transparent text-center mb-6">
          Welcome Back
        </h2>

        <form onSubmit={submitHandler} className="space-y-5">
          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg border border-red-400/20">
              {error}
            </p>
          )}

          <input
            type="email"
            placeholder="Email address"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-gray-300 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 transition-all"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pr-10 bg-white/10 border border-white/20 text-white placeholder-gray-300 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="text-right">
            <span
              onClick={() => navigate("/forgot-password")}
              className="text-sm text-indigo-300 cursor-pointer hover:underline"
            >
              Forgot Password?
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full font-semibold py-3 rounded-xl transition-all duration-300 ${
              loading
                ? "bg-gray-500/20 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-pink-500 to-indigo-500 hover:scale-[1.02] hover:shadow-lg text-white"
            }`}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>

      <p className="mt-6 text-sm text-gray-300">
        Don't have an account?{" "}
        <span
          onClick={() => navigate("/register")}
          className="text-pink-400 cursor-pointer font-medium hover:underline"
        >
          Register
        </span>
      </p>
    </div>
  );
}

export default Login;
