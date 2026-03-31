import { useNavigate } from "react-router-dom";

function SellerPending() {

  const navigate = useNavigate();

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "80vh",
      textAlign: "center",
      padding: "20px"
    }}>

      <h2>⏳ Application Under Review</h2>

      <p style={{ color: "#6b7280", maxWidth: "400px", marginTop: "12px" }}>
        Your seller application has been submitted successfully.
        Admin will review and approve your account shortly.
        You will receive an email once approved.
      </p>

      <button
        onClick={() => navigate("/")}
        style={{
          marginTop: "20px",
          padding: "10px 24px",
          background: "#4f46e5",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer"
        }}
      >
        Go to Home
      </button>

    </div>
  );

}

export default SellerPending;