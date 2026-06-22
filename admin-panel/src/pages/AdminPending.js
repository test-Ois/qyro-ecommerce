import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AdminAuthContext } from "../context/AuthContext";

function AdminPending() {
  const { logout } = useContext(AdminAuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div style={styles.root}>
      <div style={styles.bg} />
      <div style={styles.card}>
        <div style={styles.icon}>⏳</div>
        <h1 style={styles.title}>Approval Pending</h1>
        <p style={styles.subtitle}>
          Your admin account has been registered and is awaiting approval from the Super Admin.
          You will be able to access the dashboard once your account is approved.
        </p>
        <p style={styles.note}>
          If you believe there is a delay, please contact the platform administrator.
        </p>
        <button onClick={handleLogout} style={styles.btn}>
          Sign Out
        </button>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
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
    padding: 16
  },
  bg: {
    position: "absolute",
    inset: 0,
    backgroundImage: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(109,40,217,0.12) 0%, transparent 60%)",
    pointerEvents: "none"
  },
  card: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: 460,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: "48px 40px",
    backdropFilter: "blur(20px)",
    textAlign: "center"
  },
  icon: { fontSize: 56, marginBottom: 20 },
  title: { fontSize: 26, fontWeight: 700, color: "#fff", marginBottom: 16 },
  subtitle: { fontSize: 14, color: "#9ca3af", lineHeight: 1.7, marginBottom: 12 },
  note: { fontSize: 13, color: "#6b7280", marginBottom: 32 },
  btn: {
    padding: "12px 28px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#d1d5db",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer"
  }
};

export default AdminPending;
