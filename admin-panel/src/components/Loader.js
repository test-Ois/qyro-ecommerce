/**
 * SIMPLE LOADER COMPONENT FOR ADMIN PANEL
 * Shows loading screen while checking authentication
 */

function Loader() {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    }}>
      <div style={{ textAlign: "center", color: "white" }}>
        <div style={{
          border: "4px solid rgba(255, 255, 255, 0.3)",
          borderTop: "4px solid white",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          animation: "spin 1s linear infinite",
          margin: "0 auto 20px"
        }} />
        <p>Loading...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}

export default Loader;
