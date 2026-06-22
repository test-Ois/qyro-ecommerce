import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function AdminRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (form.name.length < 3) {
      setError("Name must be at least 3 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(form.password)) {
      setError("Password must be 8+ chars with uppercase, lowercase, number, and special character (@$!%*?&).");
      return;
    }

    setLoading(true);
    try {
      await API.post("/auth/admin-register", {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.root}>
        <div style={styles.bg} />
        <div style={styles.card}>
          <div style={styles.successIcon}>✅</div>
          <h1 style={styles.title}>Application Submitted</h1>
          <p style={styles.subtitle}>
            Your admin account has been created and is <strong>pending approval</strong> from the Super Admin.
            You will receive access once approved.
          </p>
          <p style={{ ...styles.subtitle, marginTop: 8 }}>
            Once approved, you can{" "}
            <Link to="/login" style={styles.link}>sign in here</Link>.
          </p>
        </div>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`}</style>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      <div style={styles.bg} />
      <div style={styles.bgGlow1} />
      <div style={styles.bgGlow2} />

      <div style={styles.card}>
        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}>Q</div>
          <span style={styles.logoText}>Qyro Admin</span>
        </div>

        <h1 style={styles.title}>Request Admin Access</h1>
        <p style={styles.subtitle}>
          Your account will be <strong style={{ color: "#fbbf24" }}>pending approval</strong> until a Super Admin reviews it.
        </p>

        {error && (
          <div style={styles.errorBox} role="alert">{error}</div>
        )}

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <div style={styles.field}>
            <label style={styles.label} htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              style={styles.input}
              placeholder="Admin Name"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="reg-email">Email address</label>
            <input
              id="reg-email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              style={styles.input}
              placeholder="admin@qyro.com"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              name="password"
              type="password"
              required
              value={form.password}
              onChange={handleChange}
              style={styles.input}
              placeholder="Min 8 chars, uppercase, number, special"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="reg-confirm">Confirm Password</label>
            <input
              id="reg-confirm"
              name="confirmPassword"
              type="password"
              required
              value={form.confirmPassword}
              onChange={handleChange}
              style={styles.input}
              placeholder="Repeat password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={loading ? { ...styles.btn, ...styles.btnDisabled } : styles.btn}
          >
            {loading ? "Submitting..." : "Submit Registration"}
          </button>
        </form>

        <p style={styles.loginLink}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
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
    backgroundImage: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(109,40,217,0.15) 0%, transparent 60%)",
    pointerEvents: "none"
  },
  bgGlow1: {
    position: "absolute",
    width: 600, height: 600,
    top: -200, left: -200,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)",
    pointerEvents: "none"
  },
  bgGlow2: {
    position: "absolute",
    width: 600, height: 600,
    bottom: -200, right: -200,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 70%)",
    pointerEvents: "none"
  },
  card: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: 440,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: "40px 36px",
    backdropFilter: "blur(20px)",
    animation: "fadeUp 0.5s ease both"
  },
  successIcon: { fontSize: 48, textAlign: "center", marginBottom: 20 },
  logoWrap: { display: "flex", alignItems: "center", gap: 10, marginBottom: 24 },
  logoIcon: {
    width: 36, height: 36, borderRadius: 10,
    background: "linear-gradient(135deg, #7c3aed, #ec4899)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 700, fontSize: 18, color: "#fff"
  },
  logoText: { fontWeight: 700, fontSize: 18, color: "#fff" },
  title: { fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#9ca3af", marginBottom: 24, lineHeight: 1.6 },
  errorBox: {
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: 10,
    padding: "12px 16px",
    color: "#fca5a5",
    fontSize: 14,
    marginBottom: 20
  },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  field: { display: "flex", flexDirection: "column", gap: 7 },
  label: { fontSize: 13, fontWeight: 500, color: "#d1d5db" },
  input: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10,
    padding: "12px 14px",
    color: "#fff",
    fontSize: 14,
    outline: "none",
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
    width: "100%"
  },
  btnDisabled: { opacity: 0.6, cursor: "not-allowed" },
  loginLink: { marginTop: 24, textAlign: "center", fontSize: 13, color: "#9ca3af" },
  link: { color: "#a78bfa", textDecoration: "none", fontWeight: 500 }
};

export default AdminRegister;
