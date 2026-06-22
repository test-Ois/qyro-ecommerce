import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AdminAuthContext } from "../context/AuthContext";
import API from "../services/api";

function Login() {
  const { login } = useContext(AdminAuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await API.post("/auth/login", {
        email: form.email.trim().toLowerCase(),
        password: form.password
      });

      const { user, token, refreshToken } = data;

      // Only allow admin and super_admin roles
      if (user.role !== "admin" && user.role !== "super_admin") {
        setError("Access denied. This portal is for administrators only.");
        return;
      }

      // Check if admin is approved
      if (user.role === "admin" && !user.isApproved) {
        setError("Your admin account is pending approval by a super admin.");
        return;
      }

      login(user, token, refreshToken);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      {/* Background */}
      <div style={styles.bg} />
      <div style={styles.bgGlow1} />
      <div style={styles.bgGlow2} />

      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}>Q</div>
          <span style={styles.logoText}>Qyro Admin</span>
        </div>

        <h1 style={styles.title}>Admin Portal</h1>
        <p style={styles.subtitle}>Sign in to manage the marketplace</p>

        {error && (
          <div style={styles.errorBox} role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <div style={styles.field}>
            <label style={styles.label} htmlFor="admin-email">Email address</label>
            <input
              id="admin-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange}
              style={styles.input}
              placeholder="admin@qyro.com"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={handleChange}
              style={styles.input}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={loading ? { ...styles.btn, ...styles.btnDisabled } : styles.btn}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p style={styles.registerLink}>
          New admin?{" "}
          <Link to="/register" style={styles.link}>
            Request access
          </Link>
        </p>

        <p style={styles.footer}>
          Customer portal →{" "}
          <a
            href={process.env.REACT_APP_FRONTEND_URL || "http://localhost:3000"}
            style={styles.link}
            rel="noreferrer"
          >
            qyro.com
          </a>
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  root: {
    fontFamily: "'Inter', sans-serif",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#07070d",
    position: "relative",
    overflow: "hidden",
    padding: 16
  },
  bg: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(109,40,217,0.15) 0%, transparent 60%)",
    pointerEvents: "none"
  },
  bgGlow1: {
    position: "absolute",
    width: 600,
    height: 600,
    top: -200,
    left: -200,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)",
    pointerEvents: "none"
  },
  bgGlow2: {
    position: "absolute",
    width: 600,
    height: 600,
    bottom: -200,
    right: -200,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 70%)",
    pointerEvents: "none"
  },
  card: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: 420,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: "40px 36px",
    backdropFilter: "blur(20px)",
    animation: "fadeUp 0.5s ease both"
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 28
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "linear-gradient(135deg, #7c3aed, #ec4899)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 18,
    color: "#fff"
  },
  logoText: {
    fontWeight: 700,
    fontSize: 18,
    color: "#fff"
  },
  title: {
    fontSize: 26,
    fontWeight: 700,
    color: "#fff",
    marginBottom: 6
  },
  subtitle: {
    fontSize: 14,
    color: "#9ca3af",
    marginBottom: 28
  },
  errorBox: {
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: 10,
    padding: "12px 16px",
    color: "#fca5a5",
    fontSize: 14,
    marginBottom: 20
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 18
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 7
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
    color: "#d1d5db"
  },
  input: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10,
    padding: "12px 14px",
    color: "#fff",
    fontSize: 14,
    outline: "none",
    transition: "border-color 0.2s",
    width: "100%"
  },
  btn: {
    marginTop: 8,
    padding: "13px 20px",
    borderRadius: 12,
    background: "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)",
    color: "#fff",
    fontWeight: 600,
    fontSize: 15,
    border: "none",
    cursor: "pointer",
    transition: "opacity 0.2s, transform 0.2s",
    width: "100%"
  },
  btnDisabled: {
    opacity: 0.6,
    cursor: "not-allowed"
  },
  registerLink: {
    marginTop: 24,
    textAlign: "center",
    fontSize: 13,
    color: "#9ca3af"
  },
  footer: {
    marginTop: 12,
    textAlign: "center",
    fontSize: 12,
    color: "#6b7280"
  },
  link: {
    color: "#a78bfa",
    textDecoration: "none",
    fontWeight: 500
  }
};

export default Login;
